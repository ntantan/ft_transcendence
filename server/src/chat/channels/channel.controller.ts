import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from 'express';
import { ChannelService } from "./channel.service";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { createMessageDTO } from "./dto/create-message.dto";
import { AuthService } from "src/auth/auth.service";
import { ChatGateway } from "../chat.gateway";


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

	// send message, expect body to have channel id as "id" and message as "message"
	// Need to get username here
	// @Post('/send_message')
	// postMessage(@Param('id') id: string, @Body() body: createMessageDTO)
	// {
	// 	return (this.channelService.newMessage(body.id, "req.user incomming", body.message));
	// }

	// ////// CHANNEL MANAGEMENT //////
	// requester = "admin";

	// // // exemple : localhost:3000/channels/add_admin
	// @Post('/add_admin')
	// addAdmin(@Body() body: UpdateUserDTO)
	// {
	// 	return (this.channelService.addAdmin(body.requester, body.id, body.user));
	// }

	// @Post('/rm_admin')
	// rmAdmin(@Body() body: UpdateUserDTO)
	// {
	// 	return (this.channelService.rmAdmin(body.requester, body.id, body.user));
	// }

	// @Post('/add_user')
	// addUser(@Body() body: any)
	// {
	// 	return (this.channelService.addUser(body.id, body.user, body.password));
	// }

	// @Post('/rm_user')
	// rmUser(@Body() body: UpdateUserDTO)
	// {
	// 	return (this.channelService.rmUser(body.id, body.user));
	// }

	// @Post('/add_muted')
	// addMuted(@Body() body: UpdateUserDTO)
	// {
	// 	return (this.channelService.addMuted(body.requester, body.id, body.user, 10  ));
	// }

	// @Post('/rm_muted')
	// rmMuted(@Body() body: UpdateUserDTO)
	// {
	// 	return (this.channelService.rmMuted(body.requester, body.id, body.user));
	// }

	// @Post('/add_banned')
	// addBanned(@Body() body: UpdateUserDTO)
	// {
	// 	return (this.channelService.addBanned(body.requester, body.id, body.user));
	// }

	// @Post('/rm_banned')
	// rmBanned(@Body() body: UpdateUserDTO)
	// {
	// 	return (this.channelService.rmBanned(body.requester, body.id, body.user));
	// }

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
			return (await this.channelService.getChannel(id, user));
		}
		catch (error) {
			throw (error);
		}
	}
}