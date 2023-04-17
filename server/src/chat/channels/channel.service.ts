import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "./entities/channel.entity";
import { ArrayContains, Repository } from "typeorm";
import { Messages } from "./entities/messages.entity";
import { WsException } from "@nestjs/websockets";
import { User } from "src/users/entities/user.entity";
import { Response } from "express";
import { ChatModule } from "../chat.module";

@Injectable()
export class ChannelService
{
	constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
		@InjectRepository(Messages)
		private readonly messageRepository: Repository<Messages>,
    ) {}

	// Returns all the created channel in db without messagers
	getAllChannel()
	{
		return (this.channelRepository.find());
	}

	// Returns one room with all messages
	async getChannel(id: string, user: User, res: Response)
	{
		const channel = await this.channelRepository.findOne({
			where: [{id: Number(id)}],
			relations: ['messages', 'users'],
		});

		if (!channel.users.find((users) => users.id == user.id))
			return (res.status(449).send('User needs to join room first'));

		if (channel.banned.find((banned) => banned == user.id))
			return (res.status(403).send('User Banned'));

		if (channel)
			return (res.send(channel));
		return (res.status(404).send("Channel not found"));
	}

	// Return all channels that are "private" and include user
	async getPrivateChannels(user: User, res: Response)
	{
		const channel = await this.channelRepository.find({
			where: [{type: "private", users: ArrayContains([user.username])}]
		})

		if (channel)
			return (res.send(channel));
	}

	async getDirectChannels(user: User, res: Response)
	{
		user.friends;
	}

	// Create one room
	createChannel(name: string, password: string, owner: User, type: string)
	{
		const newChannel = this.channelRepository.create({
			name: name,
			password: password,
			channel_owner: owner.id,
			type: type,
			admin: [owner.id],
			muted: [],
			banned: [],
			users: [owner],
		});
		const newMessage = this.messageRepository.create({
			message: "Welcome to " + name + " channel!",
			user: owner,
			date: new Date()
		});
		newChannel.messages = [newMessage];
		this.channelRepository.save(newChannel);

		return;
	}

	async findChannelById(id: string)
	{
		const channel = await this.channelRepository.findOne({
			where: [{id: Number(id)}],
			relations: ['users']
		})

		if (channel)
			return (channel);
		throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
	}

	// Save a new message in a channel
	async newMessage(channel_id: string, user: User, message: string)
	{
		const channel = await this.findChannelById(channel_id);

		const newMessage = this.messageRepository.create({
			message: message,
			user: user,
			date: new Date(),
			channel: channel
		});

		return (this.messageRepository.save(newMessage));
	}

	// Add admin if true, remove admin if false
	async addAdmin(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);
		
		if (channel.channel_owner !== requester.id)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		if (!channel.admin.find(item => item === user_id))
		{
			channel.admin.push(user_id);
			return (this.channelRepository.save(channel));
		}
	}

	async rmAdmin(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);

		if (channel.channel_owner !== requester.id)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		
		const index = channel.admin.indexOf(user_id);
		if (index >= 0)
		{
			channel.admin.splice(index, 1);
			return (this.channelRepository.save(channel));
		}
		throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
	}

	async addMuted(requester: User, channel_id: string, user_id: number, muted_time: number)
	{
		const channel = await this.findChannelById(channel_id);

		if (channel.admin.find(admin => admin === requester.id))
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		
		if (!channel.muted.find(item => item.user === user_id))
		{
			const until = new Date();
			until.setHours(until.getMinutes() + muted_time);
			channel.muted.push({user: user_id, until});
			return (this.channelRepository.save(channel));
		}
	}

	async rmMuted(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);

		if (channel.admin.find(admin => admin === requester.id))
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		
		const found = channel.muted.find(json => json.user === user_id);
		const index = channel.muted.indexOf(found);
		if (index >= 0)
		{
			channel.muted.splice(index, 1);
			return (this.channelRepository.save(channel));
		}
		throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
	}

	async addBanned(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);
		
		if (channel.admin.find(admin => admin === requester.id))
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		if (!channel.banned.find(item => item === user_id))
		{
			channel.banned.push(user_id);
			return (this.channelRepository.save(channel));
		}
	}

	async rmBanned(requester: User, channel_id: string, user_id: number)
	{
		const channel = await this.findChannelById(channel_id);
		
		if (channel.admin.find(admin => admin === requester.id))
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		const index = channel.banned.indexOf(user_id);
		if (index >= 0)
		{
			channel.banned.splice(index, 1);
			return (this.channelRepository.save(channel));
		}
		throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
	}

	async addUser(channel_id: string, user: User, password: string)
	{
		const channel = await this.findChannelById(channel_id);

		if (channel.password && channel.password !== password)
			return ('Wrong Password');
		
		if (channel.banned.find((banned) => banned == user.id))
			return ('User Banned');

		if (!channel.users.find(item => item.id === user.id))
		{
			channel.users.push(user);
			return (this.channelRepository.save(channel));
		}
	}

	async rmUser(channel_id: string, user: User)
	{
		const channel = await this.findChannelById(channel_id);

		const index = channel.users.indexOf(user);
		if (index >= 0)
		{
			channel.users.splice(index, 1);
			return (this.channelRepository.save(channel));
		}
		throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
	}

	async updatePassword(requester: User, channel_id: string, new_password: string)
	{
		const channel = await this.findChannelById(channel_id);
		
		if (channel.channel_owner !== requester.id)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		channel.password = new_password;
		return (this.channelRepository.save(channel));
	}
}