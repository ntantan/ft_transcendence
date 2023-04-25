import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';
import { ChatService } from "./chat.service";
import { ChannelService } from "./channels/channel.service";
import { CreateRoomDTO } from "./dto/create-room.dto";
import { JoinRoomDTO } from "./dto/join-room.dto";
import { Res, UnauthorizedException } from "@nestjs/common";

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
		console.log(client.id , "in the chat socket");	
	}

	handleDisconnect(@ConnectedSocket() client: Socket)
	{
		client.disconnect();
		console.log(client.id, " disconnect from chat socket")
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
			this.server.emit('error', error)
		}
		this.server.emit('newRoom');
		console.log("room " + body.room_name + " created");
    }

	@SubscribeMessage('createDirectRoom')
	async createDirectRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.createDirectChannel(user, body.user_id); }
		catch (error) {
			// console.log(error);
			this.server.emit('error', error)
		}

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
			this.server.emit('error', error)
		}
	
		this.chatService.joinRoom(client, body.id);
	
		this.server.emit('updateRoom');
    }

	@SubscribeMessage('joinSocket')
	async joinSocket(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		// try { await this.channelService.addUser(body.id, user, body.password); }
		// catch (error) { console.log(error); }
	
		this.chatService.joinRoom(client, body.id);
	}

	@SubscribeMessage('leaveRoom')
	async leaveRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.rmUser(body.id, user); }
		catch (error) {
			// console.log(error);
			this.server.emit('error', error)
		}
		this.chatService.leaveRoom(client, body.id);

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('textMessage')
	async handleMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.newMessage(body.id, user, body.msg); } 
		catch (error) { 
			// console.log(error);
			this.server.emit('error', error)
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('kickUser')
	async kickUser(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		try { await this.channelService.kickUser(user, body.id, body.user_id)}
		catch (error) { 
			// console.log(error); 
			this.server.emit('error', error)
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('addAdmin')
	async addAdmin(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try { await this.channelService.addAdmin(user, body.id, body.user_id)}
		catch (error) {
			// console.log(error);
			this.server.emit('error', error)
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('rmAdmin')
	async rmAdmin(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try { await this.channelService.rmAdmin(user, body.id, body.user_id)}
		catch (error) {
			// console.log(error);
			this.server.emit('error', error)
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('addMute')
	async addMute(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try { await this.channelService.addMuted(user, body.id, body.user_id, 1)}
		catch (error) {
			// console.log(error);
			this.server.emit('error', error)
		}

		this.server.emit('updateRoom');
	}

	@SubscribeMessage('rmMute')
	async rmMute(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		
		try { await this.channelService.rmMuted(user, body.id, body.user_id)}
		catch (error) {
			// console.log(error);
			this.server.emit('error', error)
		}

		this.server.emit('updateRoom');
	}
}