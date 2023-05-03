import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';
import { ChatService } from "./chat.service";
import { ChannelService } from "./channels/channel.service";
import { CreateRoomDTO } from "./dto/create-room.dto";
import { JoinRoomDTO } from "./dto/join-room.dto";
import { Res, UnauthorizedException, ValidationPipe, UsePipes } from "@nestjs/common";
import { CreateDirectRoomDTO } from "./dto/create-direct-room.dto";
import { AddUserPrivateDTO } from "./dto/add-user-private.dto";
import { JoinSocketDTO } from "./dto/join-socket.dto";
import { LeaveRoomDTO } from "./dto/leave-room.dto";
import { CreateMessageDTO } from "./dto/create-message.dto";
import { KickUserDTO } from "./dto/kick-user.dto";
import { BannedDTO } from "./dto/add-banned.dto";
import { AdminDTO } from "./dto/admin.dto";
import { MuteDTO } from "./dto/mute.dto";
import { UpdatePasswordDTO } from "./dto/update-password.dto";

@UsePipes()
@WebSocketGateway({namespace: '/chat', cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
		private readonly chatService: ChatService,
		private readonly channelService: ChannelService) 
	{}

    @WebSocketServer()
    server: Server;

    handleConnection(@ConnectedSocket() client: Socket) 
	{
		// console.log(client.id , "in the chat socket");	
	}

	handleDisconnect(@ConnectedSocket() client: Socket)
	{
		client.disconnect();
		// console.log(client.id, " disconnect from chat socket")
	}
	

    @SubscribeMessage('createRoom')
    async createRoom(@MessageBody() body: CreateRoomDTO, @ConnectedSocket() client: Socket) 
    {
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.createChannel(body.room_name, body.password, user, body.room_type); }
		catch (error) {
			// console.log(error);
			client.emit('error', error);
		}
		this.server.emit('newRoom');
		// console.log("room " + body.room_name + " created");
    }

	@SubscribeMessage('createDirectRoom')
	async createDirectRoom(@MessageBody() body: CreateDirectRoomDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.createDirectChannel(user, body.user_id); }
		catch (error) {
			// console.log(error);
			client.emit('error', error);
		}
		this.server.emit('newRoom');
	}
	
    @SubscribeMessage('joinRoom')
    async joinRoom(@MessageBody() body: JoinRoomDTO, @ConnectedSocket() client: Socket) 
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		try { await this.channelService.addUser(body.id, user, body.password); }
		catch (error) {
			// console.log(error);
			client.emit('error', error);
		}
	
		this.chatService.joinRoom(client, body.id);
	
		this.server.emit('updateRoom');
    }

	@SubscribeMessage('addUserPrivate')
	async addUserPrivate(@MessageBody() body: AddUserPrivateDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try { await this.channelService.addUserPrivate(body.id, body.user_id); }
		catch (error) { client.emit('error', error); }

		this.server.emit('updateRoom');
		this.server.emit('newRoom');
	}

	@SubscribeMessage('joinSocket')
	async joinSocket(@MessageBody() body: JoinSocketDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		// try { await this.channelService.addUser(body.id, user, body.password); }
		// catch (error) { console.log(error); }
	
		this.chatService.joinRoom(client, body.id);
	}

	@SubscribeMessage('leaveRoom')
	async leaveRoom(@MessageBody() body: LeaveRoomDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.rmUser(body.id, user); }
		catch (error) {
			client.emit('error', error);
			this.server.emit('newRoom')
			client.emit('channelRemoved');
		}
		this.chatService.leaveRoom(client, body.id);
		this.server.emit('updateRoom');
	}

	@SubscribeMessage('textMessage')
	async handleMessage(@MessageBody() body: CreateMessageDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.newMessage(body.id, user, body.msg); } 
		catch (error) { 
			// console.log(error);
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('kickUser')
	async kickUser(@MessageBody() body: KickUserDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.kickUser(user, body.id, body.user_id)}
		catch (error) { 
			// console.log(error); 
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('addBanned')
	async addBanned(@MessageBody() body: BannedDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.addBanned(user, body.id, body.user_id)}
		catch (error) { 
			// console.log(error); 
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('rmBanned')
	async rmBanned(@MessageBody() body: BannedDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.rmBanned(user, body.id, body.user_id)}
		catch (error) { 
			// console.log(error); 
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('addAdmin')
	async addAdmin(@MessageBody() body: AdminDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try { await this.channelService.addAdmin(user, body.id, body.user_id)}
		catch (error) {
			// console.log(error);
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('rmAdmin')
	async rmAdmin(@MessageBody() body: AdminDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try { await this.channelService.rmAdmin(user, body.id, body.user_id)}
		catch (error) {
			// console.log(error);
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('addMute')
	async addMute(@MessageBody() body: MuteDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.addMuted(user, body.id, body.user_id, Number(body.muted_time))}
		catch (error) {
			// console.log(error);
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('rmMute')
	async rmMute(@MessageBody() body: MuteDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try { await this.channelService.rmMuted(user, body.id, body.user_id)}
		catch (error) {
			// console.log(error);
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('blockUser')
	async blockUser(@ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try {}
		catch (error) {
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('updatePassword')
	async updatePassword(@MessageBody() body: UpdatePasswordDTO, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try { await this.channelService.updatePassword(user, body.id, body.password);
				client.emit('error', {message: 'Password successfully updated'}) }
		catch (error) {
			client.emit('error', error);
		}

		this.server.emit('updateRoom');
	}
}