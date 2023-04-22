import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Room } from './entities/room.entities';
import { Game } from './objects/Game';
import { Game2 } from './objects/Game2';
import { Game3 } from './objects/Game3';
import { Server, Socket } from 'socket.io';
import { HistoryService } from './history.service';
import { User } from 'src/users/entities/user.entity';
import { Player } from './objects/Player';

@Injectable()
export class GameService {

	constructor(private readonly historyService: HistoryService, private readonly schedulerRegistry: SchedulerRegistry) {}

	//		CONTROLLER		//
	findAllGame()
	{
		return (this.rooms);
	}
	
	// 		PLAYERS		//

	private player: Player[] = [
		{
			username: "test",
			socket_id: "test"
		}
	];

	player_join(username: string, socket_id: string, client: Socket)
	{
		const find = this.player.find((player) => player.username == username);

		if (!find)
		{
			console.log(username, "connected to game socket");
			return (this.player.push({username, socket_id}));
		}
		console.log(username, "already connected to game socket");
		client.disconnect();
		return (null);
	}

	player_leave(username: string, socket_id: string)
	{
		const find = this.player.find((player) => player.username == username && player.socket_id == socket_id);

		if (find)
			this.player.splice((this.player.indexOf(find)), 1);
	}

	//		ROOMS		//
	private rooms: Room[] = [
		{
			id: 1,
			name: "ia room",
			state: "playing",
			game: new Game,
			mod: '1',
			player_1: "ia1",
			player_2: "ia2",
			end_status: null,
		},
		{
			id: 2,
			name: "ia room2",
			state: "playing",
			game: new Game3,
			mod: '3',
			player_1: "ia1",
			player_2: "ia2",
			end_status: null,
		},
	];

	//		QUEUE		//
	private queue: string[]

	joinQueue(client: Socket, server: Server, mod: number, user: User)
	{
		this.leaveAllRoom(client, server, user.username);

		// Search for a waiting room
		if (this.rooms.length > 0)
		{
			for (var room of this.rooms)
			{
				if (room.name == "test room" || room.name == "ia room" || room.mod != mod.toString()) // Skip the test room, will be deleted later
					continue;
				if (!room.player_1)
				{
					room.player_1 = user.username;
					return (room);
				}
				else if (!room.player_2)
				{
					room.player_2 = user.username;
					return (room);
				}
			}
		}

		// If no waiting rooms found
		var newRoom = this.createRoom(mod, "public");
		if (Math.random() > 0.5)
			newRoom.player_1 = user.username;
		else
			newRoom.player_2 = user.username;
		return (newRoom);
	}

	startMatch(server: Server, room: Room)
	{
		if (room.player_1 && room.player_2)
		{

			setTimeout(() => {
				server.to(room.name).emit("startGame");
			}, 1000);

			setTimeout(() => {
				this.createInterval(server, room, room.name);
			}, 6000);
			room.state = "playing";
		}
	}

	async endMatch(server: Server, room: Room)
	{
		if (room.state === "ending")
			return;

		const roomcpy = Object.assign({}, room);
		const create = await this.historyService.create({
			"player1": roomcpy.player_1,
			"player2": roomcpy.player_2,
			"gamemod": roomcpy.mod,
			"winner": roomcpy.end_status,
			"date": new Date(),
		});

		room.state = "ending";
		server.to(room.name).emit("endGame", { roomName: room.name, endStatus: room.end_status });
	}

	createRoom(mod: number, type: string)
	{
		let roomName = type + Math.floor(Math.random() * 1000);	
		while (this.rooms.find((room) => room.name === roomName))
			roomName = type + Math.floor(Math.random() * 1000);

		let newRoom = new Room;
		if (mod == 0)
		{
			newRoom = {
				id: this.rooms.length + 1,
				name: roomName,
				state: "waiting",
				game: new Game2,
				mod: mod.toString(),
				player_1: undefined,
				player_2: undefined,
				end_status: null,
			};
		}
		else if (mod == 1)
		{
			newRoom = {
				id: this.rooms.length + 1,
				name: roomName,
				state: "waiting",
				game: new Game,
				mod: mod.toString(),
				player_1: undefined,
				player_2: undefined,
				end_status: null,
			};
		}
		else if (mod == 2)
		{
			newRoom = {
				id: this.rooms.length + 1,
				name: roomName,
				state: "waiting",
				game: new Game3,
				mod: mod.toString(),
				player_1: undefined,
				player_2: undefined,
				end_status: null,
			};
		}
		this.rooms.push(newRoom);

		return (newRoom);
	}

	deleteRoom(roomName: string)
	{
		let i;
		for (i = 0; i < this.rooms.length; i++)
		{
			if (this.rooms[i].name === roomName)
			{
				delete this.rooms[i];
				break;
			}
		}
		this.rooms.splice(i, 1);
	}

	startServerRoom(server: Server)
	{
		var find = this.rooms.find((room) => room.name === "ia room");
		this.createInterval(server, find, find.name);

		var find = this.rooms.find((room) => room.name === "ia room2");
		this.createInterval(server, find, find.name);
	}

	getPlayerSide(clientId: string, roomName: string)
	{
		var find = this.rooms.find((room) => room.name === roomName);
		if (!find)
			return (0);
		if (find.player_1 == clientId)
			return (1);
		if (find.player_2 == clientId)
			return (2);
	}

	joinRoom(roomName: string, clientId: string, server: Server)
	{
		var find = this.rooms.find((room) => room.name === roomName);
		if (!find)
			return (null);

		if (!find.player_1)
		{
			console.log(clientId, "in slot 1 of", roomName);
			find.player_1 = clientId;
		}
		else if (!find.player_2)
		{
			console.log(clientId, "in slot 2 of", roomName);
			find.player_2 = clientId;
		}
		else
		{	
			console.log("room is full !");
			return (null);
		}

		if (find.player_1 && find.player_2)
			this.createInterval(server, find, find.name);
		return (find.name);
	}

	leaveRoom(roomName: string, clientId: string)
	{
		var find = this.rooms.find((room) => room.name === roomName);
		if (!find)
			return (null);
		if (find.player_1 == clientId)
			find.player_1 = undefined;
		else if (find.player_2 == clientId)
			find.player_2 = undefined;

		// last player using this function triggers deletion of room
		if (!find.player_1 && !find.player_2)
		{
			if (find.state == "playing")
			{
				this.deleteInterval(find.name);
			}
			this.deleteRoom(find.name);
		}

		return (find.name);
	}

	leaveAllRoom(client: Socket, server: Server, username: string)
	{
		for (var room of this.rooms)
		{
			if (room.player_1 == username)
				room.player_1 = undefined;
			else if (room.player_2 == username)
				room.player_2 = undefined;
			client.leave(room.name);
			// console.log(username, "has left", room.name);
		}
		client.rooms.forEach((room) => client.leave(room));
		server.to(username).emit("clear");
	}

	spectateRoom(roomName: string, clientId: string)
	{
		var find = this.rooms.find((room) => room.name === roomName);
		if (!find)
			return (null);

		return (find.name);
	}

	//		GAME ACTIONS		//
	move(roomName: string, direction: string, rooms: Set<string>, clientId: string)
	{
		var find = this.rooms.find((room) => room.name === roomName);
		if (!find || (find.player_1 !== clientId && find.player_2 !== clientId))
			return (null);

		if (direction == "up" && find.player_1 == clientId)
			find.game.p1_moveup();
		else if (direction == "down" && find.player_1 == clientId)
			find.game.p1_movedown();
		else if (direction == "up" && find.player_2 == clientId)
			find.game.p2_moveup();
		else if (direction == "down" && find.player_2 == clientId)
			find.game.p2_movedown();
	}

	//		MANAGE SERVER DATA SENDING		//

	createInterval(server: Server, room: Room, id: string) 
	{
		// setTimeout(() => {
			const IntervalId = setInterval(() => {
				if (room.name === "ia room" || room.name === "ia room2")
					room.game.ia_move();
	
				room.end_status = room.game.ball_move();
				server.to(room.name).emit("position", room.game);
				if (!room.player_1)
					room.end_status = room.player_1 + " disconnected";
				else if (!room.player_2)
					room.end_status = room.player_2 + " disconnected";
				if (room.end_status && room.name !== "ia room" && room.name !== "ia room2")
				{
					// if (room.end_status === "Player 1 Win")
					// 	room.end_status = room.player_1 + " won";
					// else if (room.end_status === "Player 2 Win")
					// 	room.end_status = room.player_2 + " won";
					this.endMatch(server, room);
				}
			}, 10);
			this.schedulerRegistry.addInterval(id, IntervalId);
		// }, 5000);
	}

	deleteInterval(id:string)
	{
		const intervalId = this.schedulerRegistry.getInterval(id);

		if (intervalId) {
			clearInterval(intervalId);
			this.schedulerRegistry.deleteInterval(id);
		}
	}
}