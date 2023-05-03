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
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GameService {

	constructor(private readonly historyService: HistoryService, 
				private readonly schedulerRegistry: SchedulerRegistry,
				private readonly userService: UsersService
				) {}

	//		CONTROLLER		//
	findAllGame()
	{
		return (this.rooms);
	}
	
	// 		PLAYERS		//

	private player: Player[] = [
		{
			id: "test",
			socket_id: "test"
		}
	];

	player_join(id: string, socket_id: string, client: Socket)
	{
		const find = this.player.find((player) => player.id == id);

		if (!find)
		{
			// console.log(client.id, id, "connected to game socket");
			this.try_reconnect(id, client);
			return (this.player.push({id, socket_id}));
		}
		// console.log(id, "already connected to game socket");
		client.disconnect();
		return (null);
	}

	try_reconnect(id: string, client: Socket)
	{
		const find = this.rooms.find((room) => {
			if (room.p1_copy == id && room.player_1 == undefined)
			{
				room.player_1 = id;
				client.join(room.name);
				client.emit('reconnect', {player_side: '1', room: room.name})
				return (room);
			}
			else if (room.p2_copy == id && room.player_2 == undefined)
			{
				room.player_2 = id;
				client.join(room.name);
				client.emit('reconnect', {player_side: '2', room: room.name})
				return (room);
			}
		})
	}

	player_leave(id: string, socket_id: string)
	{
		const find = this.player.find((player) => player.id == id && player.socket_id == socket_id);

		if (find)
			this.player.splice((this.player.indexOf(find)), 1);
	}

	send_invitation(client: Socket, server: Server, id: string, room_name: string, user: User)
	{
		const find = this.player.find((player) => player.id == id);
		if (!find)
		{
			client.emit("error", {message: "User is disconnected, leave and try again."})
			return;
		}
		console.log(find.socket_id);
		console.log(room_name, user.username);
		server.to(find.socket_id).emit('gameInvite', {room_name: room_name, inviter: user.username});
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
			p1_copy: "",
			p2_copy: "",
			player1_score: undefined,
			player2_score: undefined,
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
			p1_copy: "",
			p2_copy: "",
			player1_score: undefined,
			player2_score: undefined,
			end_status: null,
		},
	];

	//		QUEUE		//
	private queue: string[]

	joinQueue(client: Socket, server: Server, mod: Number, user: User)
	{
		this.leaveAllRoom(client, server, String(user.id));

		// Search for a waiting room
		if (this.rooms.length > 0)
		{
			for (var room of this.rooms)
			{
				if (room.name == "test room"
				|| room.state != "waiting"
				|| room.name == "ia room" 
				|| room.mod != mod.toString()
				|| room.name.includes("custom")) // Skip the test room, will be deleted later
					continue;
				if (!room.player_1)
				{
					room.player_1 = String(user.id);
					return (room);
				}
				else if (!room.player_2)
				{
					room.player_2 = String(user.id);
					return (room);
				}
			}
		}

		// If no waiting rooms found
		var newRoom = this.createRoom(mod, "public");
		if (Math.random() > 0.5)
			newRoom.player_1 = String(user.id);
		else
			newRoom.player_2 = String(user.id);
		return (newRoom);
	}

	createCustomRoom(client: Socket, server: Server, mod: Number, user: User)
	{
		this.leaveAllRoom(client, server, user.username);

		var newRoom = this.createRoom(mod, "custom");
		if (Math.random() > 0.5)
			newRoom.player_1 = String(user.id);
		else
			newRoom.player_2 = String(user.id);
		return (newRoom);
	}

	startMatch(server: Server, room: Room)
	{
		if (room.player_1 && room.player_2)
		{
			room.p1_copy = room.player_1;
			room.p2_copy = room.player_2;
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
		room.state = "ending";

		const roomcpy = Object.assign({}, room);
		const create = await this.historyService.create({
			"player1": roomcpy.p1_copy,
			"player2": roomcpy.p2_copy,
			"player1_score": roomcpy.player1_score,
			"player2_score": roomcpy.player2_score,
			"gamemod": roomcpy.mod,
			"winner": roomcpy.end_status,
			"date": new Date(),
		});

		server.to(room.name).emit("endGame", { roomName: room.name, endStatus: room.end_status });

		const p1 = await this.userService.findOne(Number(roomcpy.p1_copy));
		const p2 = await this.userService.findOne(Number(roomcpy.p2_copy));
		if (roomcpy.end_status == "1")
		{
			this.userService.winUp(p1);
			this.userService.loseUp(p2);
		}
		else
		{
			this.userService.loseUp(p1);
			this.userService.winUp(p2);
		}
		this.checkLevelUp(p1);
		this.checkLevelUp(p2);
	}

	checkLevelUp(user: User)
	{
		let i = 0;
		while (user.win * 2 + user.lose >= user.level * 3 && i < 20)
		{
			this.userService.levelUp(user)
			i++;
		}
	}

	createRoom(mod: Number, type: string)
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
				p1_copy: "",
				p2_copy: "",
				player1_score: undefined,
				player2_score: undefined,
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
				p1_copy: "",
				p2_copy: "",
				player1_score: undefined,
				player2_score: undefined,
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
				p1_copy: "",
				p2_copy: "",
				player1_score: undefined,
				player2_score: undefined,
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

	getPlayerSide(clientId: string, room: Room)
	{
		// var find = this.rooms.find((room) => room.name === roomName);
		// console.log("GPS", room)
		if (!room)
			return (0);
		if (room.player_1 == clientId)
			return (1);
		if (room.player_2 == clientId)
			return (2);
	}

	joinRoom(roomName: string, clientId: string, server: Server)
	{
		var find = this.rooms.find((room) => room.name === roomName);
		if (!find)
			return (null);

		if (find.player_1 == clientId || find.player_2 == clientId)
		{
			// console.log(clientId, "already in the room", roomName);
		}
		else if (!find.player_1)
		{
			// console.log(clientId, "in slot 1 of", roomName);
			find.player_1 = clientId;
		}
		else if (!find.player_2)
		{
			// console.log(clientId, "in slot 2 of", roomName);
			find.player_2 = clientId;
		}
		else
		{	
			// console.log("room is full !");
			return (null);
		}
		return (find);
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
		// LA C'EST CA QUI FAIT TOUT QUITTER JE PENSE
		// client.rooms.forEach((room) => {
		// 	console.log(room);
		// 	client.leave(room);
		// });
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
		var last_emit = new Date();
		var current = new Date();
		const IntervalId = setInterval(() => {
			if (room.name === "ia room" || room.name === "ia room2")
				room.game.ia_move();

			if (room.player_1 && room.player_2)
			{
				room.end_status = room.game.ball_move(room);
				server.to(room.name).emit("position", room.game);
				last_emit = new Date();
			}
			else
			{
				current = new Date();
				var dif = Math.abs((last_emit.getTime() - current.getTime()) / 1000);
				if (dif >= 3)
				{
					if (!room.player_1)
						room.end_status = "2";
					else if (!room.player_2)
						room.end_status = "1";
				}
			}
			if (room.end_status && room.name !== "ia room" && room.name !== "ia room2")
				this.endMatch(server, room);
		}, 10);
		this.schedulerRegistry.addInterval(id, IntervalId);
	}

	send_reconnect(server: Server, room: Room)
	{
		if (!room.player_1)
		{
			const find = this.player.find((player) => player.id == room.player_1)
			if (find)
				server.to(find.socket_id).emit('reconnect', {player_side: '1', room: room.name})
		}
		if (!room.player_2)
		{
			const find = this.player.find((player) => player.id == room.player_2)
			if (find)
				server.to(find.socket_id).emit('reconnect', {player_side: '2', room: room.name})
		}
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