import { Interval, SchedulerRegistry } from '@nestjs/schedule';
import { Get, Req } from '@nestjs/common';
import { ConnectedSocket, MessageBody, WebSocketServer, OnGatewayConnection, SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({namespace: '/game', cors: true})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	
	@WebSocketServer()
	server: Server;

	positions = {
		x1: 0,
		y1: 0,

		x2: 640 - 15,
		y2: 0,

		xball: 320,
		yball: 240,
		vxball: (Math.random() * (1 - (-1)) + 1),
		vyball: (Math.random() * (1 - (-1)) + 1),
	};

	playerSlots = {
		slot1: null,
		slot2: null, 
	}

	gameState = {
		ready1: 0,
		ready2: 0,
		playing: 0,
	}

	playerCount = 0;
	
	handleConnection(@ConnectedSocket() client: Socket) {
		console.log(client.id, " in game lobby !");
		this.server.emit('position', this.positions);
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		console.log(client.id, " left game lobby !");
		const playerId = client.id;
		this.leaveRoom(client, { playerId });
	}

	afterInit(server: any) {
		// this.handleInterval();
	}

	@SubscribeMessage('joinRoom')
	joinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		if (this.playerCount < 2)
		{
			client.join("room1");
			console.log(client.id, " has joined room1");
			this.server.to('room1').emit('position', this.positions);
			this.playerCount++;
			if (this.playerSlots.slot1 == null)
			{
				this.playerSlots.slot1 = client.id;	
				return (1);
			}
			else if (this.playerSlots.slot2 == null)
			{
				this.playerSlots.slot2 = client.id;
				return (2);
			}
		}
		else
		{
			console.log("room is full !");
			return (0);
		}
	}

	@SubscribeMessage('leaveRoom')
	leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		console.log(client.id, " has left room1");
		client.leave("room1");
		if (this.playerSlots.slot1 == client.id)
		{
			this.playerSlots.slot1 = null;
			this.playerCount--;
		}
		else if (this.playerSlots.slot2 == client.id)
		{
			this.playerSlots.slot2 = null;
			this.playerCount--;
		}
	}

	constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

	createInterval(id: string, duration:number) {
		const IntervalId = setInterval(() => {
			this.updateBallPosition();
			this.server.to('room1').emit("position", this.positions);
			// console.log("updating !");
		}, duration);
		this.schedulerRegistry.addInterval(id, IntervalId);
	}

	deleteInterval(id:string) {
		const intervalId = this.schedulerRegistry.getInterval(id);

		if (intervalId) {
			clearInterval(intervalId);
			this.schedulerRegistry.deleteInterval(id);
		}
	}

	@SubscribeMessage('setReady')
	setReady(@ConnectedSocket() client:  Socket, @MessageBody() data: any) {
		if (client.id == this.playerSlots.slot1)
		{
			this.gameState.ready1 = 1;
			console.log("player 1 ready ;-)");
		} 
		else if (client.id == this.playerSlots.slot2)
		{
			this.gameState.ready2 = 1;
			console.log("player 2 ready =D");
		}
		if (this.gameState.ready1 && this.gameState.ready2)
		{
			this.createInterval("room1", 10);
		}
	}

	@SubscribeMessage('unsetReady') 
	unsetReady(@ConnectedSocket() client:  Socket, @MessageBody() data: any) {
		if (client.id == this.playerSlots.slot1)
		{
			this.gameState.ready1 = 0;
			console.log("player 1 not ready :(");
		} 
		else if (client.id == this.playerSlots.slot2)
		{
			this.gameState.ready2 = 0;
			console.log("player 2 not ready :(");
		}
		this.deleteInterval("room1");
	}

	@SubscribeMessage('move')
	updatePosition( client: Socket, data: any) {
		if (client.rooms.has('room1') 
			&& (client.id == this.playerSlots.slot1 || client.id == this.playerSlots.slot2))
		{
			this.server.to('room1').emit('position', this.positions);
			if (data.direction == 'up')
			{
				if (this.positions.y1 > 0 && data.id == 1)
					this.positions.y1 -= 10;
				else if (this.positions.y2 > 0 && data.id == 2)
					this.positions.y2 -= 10;
			}
			else if (data.direction == 'down')
			{
				if (this.positions.y1 < 480 - 60 && data.id == 1)
					this.positions.y1 += 10;
				else if (this.positions.y2 < 480 - 60 && data.id == 2)
					this.positions.y2 += 10;
			}
			this.server.to('room1').emit("position", this.positions);
		}
	}

	updateBallPosition() {
		const racketLength = 60;
		const racketWidth = 15;  
		this.positions.xball += this.positions.vxball;
		this.positions.yball += this.positions.vyball;

		if (this.positions.xball - 5 < 0 || this.positions.xball + 5 > 640)
		{
			this.positions.xball = 320;
			this.positions.yball = 240;
			this.positions.vxball = 0;
			this.positions.vyball = 0;
			setTimeout( () => {
				this.positions.vxball = this.randomDirection();
				this.positions.vyball = this.randomDirection();
			}, 3000);
		}
		if (this.positions.yball - 5 < 0 || this.positions.yball + 5 > 480)
			this.positions.vyball = -(this.positions.vyball);

		if (this.positions.xball < this.positions.x1 + racketWidth + 5
			&& this.positions.xball > this.positions.x1 + 5
			&& this.positions.yball < this.positions.y1 + racketLength
			&& this.positions.yball > this.positions.y1)
		{
			this.positions.vxball = -(this.positions.vxball);
		}

		if (this.positions.xball > this.positions.x2 - 5
			// && this.positions.xball < this.positions.x2 - 5
			&& this.positions.yball < this.positions.y2 + racketLength
			&& this.positions.yball > this.positions.y2)
		{
			this.positions.vxball = -(this.positions.vxball);
		}
	}

	randomDirection() {
		if (Math.random() > 0.5)
			return (Math.random() + 1);
		else
			return ((Math.random() + 1) * -1);
	}
}