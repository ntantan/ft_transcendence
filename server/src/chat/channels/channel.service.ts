import { ForbiddenException, GoneException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "./entities/channel.entity";
import { ArrayContainedBy, ArrayContains, FindOperator, In, Not, Repository } from "typeorm";
import { Messages } from "./entities/messages.entity";
import { WsException } from "@nestjs/websockets";
import { User } from "src/users/entities/user.entity";
import { Response } from "express";
import { ChannelUser } from "./entities/channelUser.entity";
import { UsersService } from "src/users/users.service";
import { ChatModule } from "../chat.module";
import * as bcrypt from 'bcrypt';

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
			where: [{
				id: Number(id),
				messages: {
					user: Not(In(user.blocked)),
				}
			}],
			relations: {
				channel_users: {
					user: true
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
		// console.log(channels);
		return (channels);
	}

	adaptDirectChannelName(user: User, channels: Channel[])
	{
		for (const channel of channels)
		{
			const other = channel.channel_users.find((channel_user) => channel_user.user.id !== user.id);
			if (other)
				channel.name = other.user.username;
		}
	}

	async getDirectChannels(user: User)
	{
		const select_channels = await this.channelRepository.find({
			where: [{
				type: "direct",
				channel_users: {
					user: {
						id: user.id
					}
				},
			}],
			select: {
				id: true,
			}
		});
		const arr = [];
		select_channels.map((channel) => arr.push(channel.id));
		const channels = await this.channelRepository.find({
			relations: {
				channel_users: {
					user: true,
				},
			},
			where: {
				id: In(arr)
			}
		})
		// console.log(channels)
		return (channels)
	}

	// Create one room
	async createChannel(name: string, password: string, owner: User, type: string)
	{

		if (password)
		{
			var saltRounds = 10;
			await bcrypt.hash(password, saltRounds).then(async (hash) => {
				var createChannel = {
					name: name,
					password: hash,
					type: type,
				}
				var newChannel = this.channelRepository.create(createChannel);
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
					message: "Welcome to " + name + " channel!",
					user: owner,
					date: new Date(),
					channel: newChannel
				});
				await this.messageRepository.save(newMessage);
				newChannel.messages = [newMessage];
				return (await this.channelRepository.save(newChannel));
			})
		}
		else
		{
			var createChannel = {
				name: name,
				password: password,
				type: type,
			}
			var newChannel = this.channelRepository.create(createChannel);
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

			if (type != "direct")
			{
				const a = await this.channelRepository.save(newChannel);
				const newMessage = this.messageRepository.create({
					message: "Welcome to " + name + " channel!",
					user: owner,
					date: new Date(),
					channel: newChannel
				});
				await this.messageRepository.save(newMessage);
				newChannel.messages = [newMessage];
			}
			return (await this.channelRepository.save(newChannel));
		}
	}

	async createDirectChannel(user: User, other_user_id: number)
	{
		const channels = await this.getDirectChannels(user);
		for (const channel of channels)
		{
			if (channel.channel_users.find((channel_user) => channel_user.user.id == user.id) 
				&& channel.channel_users.find((channel_user) => channel_user.user.id == other_user_id))
			throw new ForbiddenException('Channel already exists')
		}
		const newChannel = await this.createChannel(user.username, "", user, "direct");
		this.addUser(String(newChannel.id), await this.usersService.findOne(other_user_id), "");
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
		if (channel_user)
			return (channel_user);
		throw new NotFoundException("User " + user_id + " not found in this channel");
	}

	// Save a new message in a channel
	async newMessage(channel_id: string, user: User, message: string)
	{
		const channel = await this.findChannelById(channel_id);
		const channel_user = await this.findChannelUserByUser(channel, user.id);
		await this.isMuted(channel_user)

		const newMessage = this.messageRepository.create({
			message: message,
			user: user,
			date: new Date(),
			channel: channel
		});

		return (await this.messageRepository.save(newMessage));
	}

	async isMuted(channel_user: ChannelUser)
	{
		// if not muted
		var current = new Date();
		if (channel_user.muted == null)
			return (false);
		else
		{
			if (current > channel_user.muted)
			{
				channel_user.muted = null;
				return (false)
			}
		}
		throw new ForbiddenException('User is muted for ' + Math.floor((channel_user.muted.getTime() - current.getTime()) / 60000) + ' minutes.');

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

		const ch_pass = await this.channelRepository
				.createQueryBuilder('channel')
				.where("channel.id = :id", {id: channel_id})
				.addSelect("channel.password")
				.getOne()
		if (ch_pass.password)
		{
			await bcrypt.compare(password, ch_pass.password).then((result) => {
				if (result == false)
					throw new UnauthorizedException("Wrong Password");
			})
		}

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

	async addUserPrivate(channel_id: string, user_id: string)
	{
		const user = await this.usersService.findOne(Number(user_id));
		return (await this.addUser(channel_id, user, ""));
	}

	async rmUser(channel_id: string, user: User)
	{
		const channel = await this.findChannelById(channel_id);
		const messages = await this.messageRepository.find({where: [{channel: channel}]});
		const channel_users = await this.channelUserRepository.find({where:[{channel: channel}]});
		const channel_user = await this.findChannelUserByUser(channel, user.id);

		if (channel_user.channel_owner)
		{
			await this.messageRepository.remove(messages);
			await this.channelUserRepository.remove(channel_users);
			await this.channelRepository.remove(channel);
			throw new GoneException('Channel owner has left the channel');
		}
		else
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