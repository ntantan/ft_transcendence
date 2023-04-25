import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "./entities/channel.entity";
import { ArrayContainedBy, ArrayContains, FindOperator, In, Repository } from "typeorm";
import { Messages } from "./entities/messages.entity";
import { WsException } from "@nestjs/websockets";
import { User } from "src/users/entities/user.entity";
import { Response } from "express";
import { ChannelUser } from "./entities/channelUser.entity";
import { UsersService } from "src/users/users.service";

@Injectable()
export class ChannelService
{
	constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
		@InjectRepository(Messages)
		private readonly messageRepository: Repository<Messages>,
		@InjectRepository(ChannelUser)
		private readonly channelUserRepository: Repository<ChannelUser>,
		private readonly usersService: UsersService,
    ) {}

	// Returns all the created channel in db without messagers
	getAllChannel()
	{
		return (this.channelRepository.find());
	}

	// Returns one room with all messages
	async getChannel(id: string, user: User)
	{
		const channel = await this.channelRepository.findOne({
			where: [{id: Number(id)}],
			relations: {
				channel_users: {
					user: true,
				},
				messages: {
					user: true
				}
			},
		});
		if (!channel)
			throw new NotFoundException('Channel not found');
			
		try {
			var channel_user = await this.findChannelUserByUser(channel, user.id);
		}
		catch (error) {
			throw new UnauthorizedException('User has not joined this channel')
		}
		if (channel_user.banned)
			throw new ForbiddenException('User was banned from this channel')

		return (channel);
	}

	async getPublicChannels()
	{
		const channels = await this.channelRepository.find({
			where: [{ type: "public" }]
		});

		return (channels);
	}

	// Return all channels that are "private" and include user
	async getPrivateChannels(user: User)
	{
		const channels = await this.channelRepository.createQueryBuilder("channel")
						.leftJoinAndSelect("channel.channel_users", "channel_users")
						.leftJoinAndSelect("channel_users.user", "user")
						.where("channel.type = :type", {type: "private"})
						.andWhere("user.id = :user", { user: user.id})
						.getMany()
		// console.log(channels)
		return (channels);
	}

	async getDirectChannels(user: User)
	{
		const channels = await this.channelRepository.createQueryBuilder("channel")
			.leftJoinAndSelect("channel.channel_users", "channel_users")
			.leftJoinAndSelect("channel_users.user", "user")
			.where("channel.type = :type", {type: "direct"})
			.andWhere("user.id = :user", { user: user.id})
			.getMany()
		
		return (channels)
	}

	// Create one room
	async createChannel(name: string, password: string, owner: User, type: string)
	{
		const newChannel = this.channelRepository.create({
			name: name,
			password: password,
			type: type,
		});
		await this.channelRepository.save(newChannel);

		const channel_user = this.channelUserRepository.create({
			user: owner,
			channel_owner: true,
			admin: false,
			banned: false,
			muted: null,
			channel: newChannel
		});
		await this.channelUserRepository.save(channel_user);
		newChannel.channel_users = [channel_user];

		const a = await this.channelRepository.save(newChannel);
		const newMessage = this.messageRepository.create({
			message: "Welcome to " + name + " channel! It was created by ",
			user: owner,
			date: new Date(),
			channel: newChannel
		});
		await this.messageRepository.save(newMessage);
		newChannel.messages = [newMessage];
	
		return (await this.channelRepository.save(newChannel));
	}

	async createDirectChannel(user: User, other_user_id: number)
	{
		// const channels = await this.channelRepository.createQueryBuilder("channel")
		// .leftJoinAndSelect("channel.channel_users", "channel_users")
		// .leftJoinAndSelect("channel_users.user", "user")
		// .where("channel.type = :type", {type: "direct"})
		// .andWhere("user.id IN :...users", { users: [user.id, other_user.id]})
		// .andWhere("COUNT(user.id) = 2")
		// .groupBy("channel.id")
		// .getMany()
		const channels = await this.getDirectChannels(user);
		if (channels.find((channels) => {
			channels.channel_users.find((channels_users) => {
				channels_users.user.id == other_user_id
			})
		}))
			throw new ForbiddenException('Channel already exists')
		
		return (this.createChannel(user.id + "+" + other_user_id, "", user, "direct"));
		
	}

	async findChannelById(id: string)
	{
		const channel = await this.channelRepository.findOne({
			where: [{id: Number(id)}],
			relations: {
				channel_users: {
					user: true,
				}
			},
		})

		if (channel)
			return (channel);
		throw new NotFoundException("Channel not found");
	}

	async findChannelUserByUser(channel: Channel, user_id: number)
	{
		const channel_user = channel.channel_users.find((channel_user) => channel_user.user.id === user_id);
		// const channel_user = await this.channelUserRepository.findOne({
		// 	relations: ['user'],
		// 	loadRelationIds: true,
		// 	where: [{user: user}],
		// })
		if (channel_user)
			return (channel_user);
		throw new NotFoundException("User " + user_id + " not found in this channel");
	}

	// Save a new message in a channel
	async newMessage(channel_id: string, user: User, message: string)
	{
		const channel = await this.findChannelById(channel_id);
		if (await this.isMuted(channel, user))
			throw new ForbiddenException('User is muted');

		const newMessage = this.messageRepository.create({
			message: message,
			user: user,
			date: new Date(),
			channel: channel
		});

		return (await this.messageRepository.save(newMessage));
	}

	async isMuted(channel: Channel, user: User)
	{
		const channel_user = await this.findChannelUserByUser(channel, user.id);
		// if not muted
		if (channel_user.muted == null)
			return (false);
		else
		{
			const current = new Date();
			if (current > channel_user.muted)
				return (false)
		}
		return (true);
	}

	// Add admin if true, remove admin if false
	async addAdmin(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, user_id);
		const requester_channel_user = await this.findChannelUserByUser(channel, requester.id);
		
		if (!requester_channel_user.channel_owner)
			throw new UnauthorizedException('Only channel owner can promote admin');

		channel_user.admin = true;
		return (await this.channelRepository.save(channel));
	}

	async rmAdmin(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, user_id);
		const requester_channel_user = await this.findChannelUserByUser(channel, requester.id);

		if (!requester_channel_user.channel_owner)
			throw new UnauthorizedException('Only channel owner can remove admin');

		channel_user.admin = false;
		return (await this.channelRepository.save(channel));
	}

	async addMuted(requester: User, channel_id: string, user_id: number, muted_time: number)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, user_id);
		const requester_channel_user = await this.findChannelUserByUser(channel, requester.id);

		if (!requester_channel_user.admin && !requester_channel_user.channel_owner)
			throw new UnauthorizedException('User does not have privilege to mute');
		if ((channel_user.admin || channel_user.channel_owner) && !requester_channel_user.channel_owner)
			throw new UnauthorizedException('You can not mute another admin');
		
		const until = new Date();
		until.setMinutes(until.getMinutes() + muted_time);
		channel_user.muted = until;
		return (await this.channelRepository.save(channel));
	}

	async rmMuted(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, user_id);
		const requester_channel_user = await this.findChannelUserByUser(channel, requester.id);

		if (!requester_channel_user.admin && !requester_channel_user.channel_owner)
			throw new UnauthorizedException('User does not have privilege to unmute');
		if ((channel_user.admin || channel_user.channel_owner) && !requester_channel_user.channel_owner)
			throw new UnauthorizedException('You can not unmute another admin');
		
		channel_user.muted = null;
		return (await this.channelRepository.save(channel));
	}

	async addBanned(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, user_id);
		const requester_channel_user = await this.findChannelUserByUser(channel, requester.id);

		if (!requester_channel_user.admin && !requester_channel_user.channel_owner)
			throw new UnauthorizedException('User does not have privilege to ban');

		if ((channel_user.admin || channel_user.channel_owner) && !requester_channel_user.channel_owner)
			throw new UnauthorizedException('You can not ban another admin');

		channel_user.banned = true;
		return (await this.channelRepository.save(channel));
	}

	async rmBanned(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, user_id);
		const requester_channel_user = await this.findChannelUserByUser(channel, requester.id);
		
		if (!requester_channel_user.admin && !requester_channel_user.channel_owner)
			throw new UnauthorizedException('User does not have privilege to unban');

		channel_user.banned = false;
		return (await this.channelRepository.save(channel));
	}

	async addUser(channel_id: string, user: User, password: string)
	{
		const channel = await this.findChannelById(channel_id);
		// const user = await this.usersService.findOne(user_id);

		const ch_pass = await this.channelRepository.findOne({
			where: [{id: Number(channel_id)}],
			select: {
				password: true,
			}
		})

		if (ch_pass.password && ch_pass.password !== password)
			throw new UnauthorizedException("Wrong Password");

		let channel_user;
		try {
			channel_user = await this.findChannelUserByUser(channel, user.id);
		}
		catch {
			channel_user = this.channelUserRepository.create({
				user: user,
				channel_owner: false,
				admin: false,
				banned: false,
				muted: null,
				channel: channel
			})
			await this.channelUserRepository.save(channel_user);
			channel.channel_users.push(channel_user);
		}
		if (channel_user && channel_user.banned)
			throw new UnauthorizedException("This user was banned in this channel");

		return (await this.channelRepository.save(channel));
	}

	async rmUser(channel_id: string, user: User)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, user.id);

		this.channelUserRepository.remove(channel_user);
		return (await this.channelRepository.save(channel));
	}

	async kickUser(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, user_id);
		const requester_channel_user = await this.findChannelUserByUser(channel, requester.id);

		if (!requester_channel_user.admin && !requester_channel_user.channel_owner)
			throw new UnauthorizedException('User does not have privilege to kick');
		if ((channel_user.admin || channel_user.channel_owner) && !requester_channel_user.channel_owner)
			throw new UnauthorizedException('You can not kick another admin');

		this.channelUserRepository.remove(channel_user);
		return (await this.channelRepository.save(channel));
	}

	async updatePassword(requester: User, channel_id: string, new_password: string)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, requester.id);
		
		if (!channel_user.channel_owner)
			throw new UnauthorizedException("Only channel can update password");
		channel.password = new_password;
		return (await this.channelRepository.save(channel));
	}
}