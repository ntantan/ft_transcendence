import { ConnectedSocket, MessageBody, WebSocketServer, OnGatewayConnection, SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, OnGatewayInit, WsException } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/entities/user.entity';
import { Req } from '@nestjs/common';
import { Player } from './objects/Player';

@WebSocketGateway({namespace: '/game', cors:  {origin: ['http://localhost:5173'], credentials: true, cookie: true}})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	
	constructor (private readonly gameService: GameService,
				 private readonly authService: AuthService) {};

	parseCookie(str: string)
	{
		return str
		.split(';')
		.map(v => v.split('='))
		.reduce((acc, v) => {
			acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
			return acc;
		}, {});
	}

	async get_ws_user(client: Socket)
	{
		if (!client.handshake.headers.cookie)
		{
			console.log('no jwt provided');
			client.disconnect();
			return (null);
		}
		var jwt = this.parseCookie(client.handshake.headers.cookie)['jwt'];
		const user = await this.authService.verifyJwt(jwt) || null;
		if (!user)
		{
			console.log('no user found with jwt');
			client.disconnect();
			return (null);
		}
		return (user);
	}
				 
	@WebSocketServer()
	server: Server;

	async handleConnection(@ConnectedSocket() client: Socket) 
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;
		return (this.gameService.player_join(user.username, client.id, client));
	}
	
	async handleDisconnect(@ConnectedSocket() client: Socket) {
		const user = await this.get_ws_user(client);
		if (!user)
			return;

		this.gameService.leaveAllRoom(client, this.server, user.username);
		client._cleanup();
		this.gameService.player_leave(user.username, client.id);
		console.log(client.id, "disconnected");
	}
	
	afterInit(server: any) {
		this.gameService.startServerRoom(server);
	}

	@SubscribeMessage('joinQueue')
	async joinQueue(@ConnectedSocket() client: Socket, @MessageBody() data: any)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;

		const room = await this.gameService.joinQueue(client, this.server, data.mod, user);
		client.join(room.name);
		this.gameService.startMatch(this.server, room);
		const player_side = this.gameService.getPlayerSide(user.username, room.name);
		const roomName = room.name;
		return ({ player_side, roomName });
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;
		
		const roomName = this.gameService.joinRoom(data.roomName, user.username, this.server);
		if (roomName)
		{
			this.gameService.leaveAllRoom(client, this.server, user.username);
			client.join(roomName);
		}
		return (this.gameService.getPlayerSide(user.username, roomName))
	}

	@SubscribeMessage('leaveRoom')
	async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;
	
		const roomName = this.gameService.leaveRoom(data.roomName, user.username);
		if (roomName)
		{
			client.leave(roomName);
			console.log(user.username, "left", roomName);
			this.server.to(roomName).emit("clear");
		}
	}

	@SubscribeMessage('spectateRoom')
	async spectateRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any )
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;

		const roomName = this.gameService.spectateRoom(data.roomName, client.id);
		if (roomName)
		{
			this.gameService.leaveAllRoom(client, this.server, user.username);
			client.join(roomName);
			console.log(roomName, "new spec !");
		}
	}

	@SubscribeMessage('move')
	async move(client: Socket, data: any)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;
		
		this.gameService.move(data.roomName, data.direction, client.rooms, user.username);
	}

	@SubscribeMessage('test')
	test()
	{
		console.log('test');
	}
}