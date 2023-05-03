import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from 'express';
import { ChannelService } from "./channel.service";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { createMessageDTO } from "./dto/create-message.dto";
import { AuthService } from "src/auth/auth.service";
import { ChatGateway } from "../chat.gateway";
import { ConstraintMetadata } from "class-validator/types/metadata/ConstraintMetadata";


@Controller("channels")
export class ChannelController
{
	constructor(private readonly channelService: ChannelService,
				private readonly authService: AuthService,
				private readonly chatGateway: ChatGateway) {}

	// get all the channels created with messages at localhost:3000/channels
	@Get()
	async getAllChannels(@Req() req: Request)
	{
		if (!req.cookies['jwt'])
			throw new BadRequestException('No jwt provided');
		const user = await this.authService.verifyJwt(req.cookies['jwt']);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		return (this.channelService.getAllChannel());
	}

	@Get('/public')
	async getPublicChannels(@Req() req: Request)
	{
		if (!req.cookies['jwt'])
			throw new BadRequestException('No jwt provided');
		const user = await this.authService.verifyJwt(req.cookies['jwt']);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		return (this.channelService.getPublicChannels());
	}

	@Get('/private')
	async getPrivateChannels(@Req() req: Request)
	{
		if (!req.cookies['jwt'])
			throw new BadRequestException('No jwt provided');
		const user = await this.authService.verifyJwt(req.cookies['jwt']);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		return (this.channelService.getPrivateChannels(user));
	}

	@Get('/direct')
	async getDirectChannels(@Req() req: Request)
	{
		if (!req.cookies['jwt'])
			throw new BadRequestException('No jwt provided');
		const user = await this.authService.verifyJwt(req.cookies['jwt']);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		const res = await this.channelService.getDirectChannels(user);
		this.channelService.adaptDirectChannelName(user, res);
		return (res);
	}

	// get the channel with messages at id ex: localhost:3000/channels/1
	@Get(':id')
	async getChannel(@Param('id') id: string, @Req() req: Request)
	{
		if (!req.cookies['jwt'])
			throw new BadRequestException('No jwt provided');
		const user = await this.authService.verifyJwt(req.cookies['jwt']);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try {
			// console.log(await this.channelService.getChannel(id, user));
			return (await this.channelService.getChannel(id, user));
		}
		catch (error) {
			throw (error);
		}
	}
}