import { ConnectedSocket, MessageBody, WebSocketServer, OnGatewayConnection, SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, OnGatewayInit, WsException } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/entities/user.entity';
import { Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { Player } from './objects/Player';
import { joinQueueDTO } from './dto/join-queue.dto';
import { createCustomDTO } from './dto/create-custom-dto';
import { joinRoomDTO } from './dto/join-room.dto';
import { leaveRoomDTO } from './dto/leave-room.dto';
import { spectateRoomDTO } from './dto/spectate-room.dto';
import { playerMoveDTO } from './dto/player-move.dto';

@UsePipes()
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
		return (this.gameService.player_join(String(user.id), client.id, client));
	}
	
	async handleDisconnect(@ConnectedSocket() client: Socket) {
		const user = await this.get_ws_user(client);
		if (!user)
			return;

		this.gameService.leaveAllRoom(client, this.server, String(user.id));
		client._cleanup();
		this.gameService.player_leave(String(user.id), client.id);
		// console.log(client.id, "disconnected");
	}
	
	afterInit(server: any) {
		this.gameService.startServerRoom(server);
	}

	@SubscribeMessage('joinQueue')
	async joinQueue(@ConnectedSocket() client: Socket, @MessageBody() data: joinQueueDTO)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;

		const room = await this.gameService.joinQueue(client, this.server, data.mod, user);
		client.join(room.name);
		this.gameService.startMatch(this.server, room);
		const player_side = this.gameService.getPlayerSide(String(user.id), room);
		return ({ player_side: player_side, roomName: room.name });
	}

	@SubscribeMessage('createCustom')
	async createCustom(@ConnectedSocket() client: Socket, @MessageBody() data: createCustomDTO)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;

		var room = this.gameService.createCustomRoom(client, this.server, data.mod, user);
		client.join(room.name);
		this.gameService.startMatch(this.server, room);
		const player_side = this.gameService.getPlayerSide(String(user.id), room);
		this.gameService.send_invitation(client, this.server, data.invite_id, room.name, user);
		return ({ player_side: player_side, roomName: room.name });
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: joinRoomDTO)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;
		
		this.gameService.leaveAllRoom(client, this.server, String(user.id));
		var room = this.gameService.joinRoom(data.roomName, String(user.id), this.server);
		if (room)
		{
			client.join(room.name);
		}
		var player_side = this.gameService.getPlayerSide(String(user.id), room);
		if (room.player_1 && room.player_2)
			this.gameService.startMatch(this.server, room);
		return ({ player_side: player_side, roomName: room.name });
	}

	@SubscribeMessage('leaveRoom')
	async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: leaveRoomDTO)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;
	
		const roomName = this.gameService.leaveRoom(data.roomName, String(user.id));
		if (roomName)
		{
			client.leave(roomName);
			// console.log(user.username, "left", roomName);
			this.server.to(roomName).emit("clear");
		}
	}

	@SubscribeMessage('spectateRoom')
	async spectateRoom(@ConnectedSocket() client: Socket, @MessageBody() data: spectateRoomDTO)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;

		const roomName = this.gameService.spectateRoom(data.roomName, client.id);
		if (roomName)
		{
			this.gameService.leaveAllRoom(client, this.server, String(user.id));
			client.join(roomName);
			// console.log(roomName, "new spec !");
		}
	}

	@SubscribeMessage('move')
	async move(@ConnectedSocket() client: Socket, @MessageBody() data: playerMoveDTO)
	{
		const user = await this.get_ws_user(client);
		if (!user)
			return;
		
		this.gameService.move(data.roomName, data.direction, client.rooms, String(user.id));
	}

	@SubscribeMessage('test')
	test()
	{
		console.log('test');
	}
}