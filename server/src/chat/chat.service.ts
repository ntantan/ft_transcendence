import { Injectable } from "@nestjs/common";
import { ChannelService } from "./channels/channel.service";
import { Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/users/entities/user.entity";
import { Status } from "src/users/enum/status.enum";
import { Friend } from "src/users/entities/friend.entity";

@Injectable()
export class ChatService {

	private testuser: User = {
		id: 99,
		login: "test",
		username: "test",
		authToken: "",
		avatar: "",
		level: 1,
		status: Status.ONLINE,
		win: 0,
		lose: 0,
		two_fa: false,
		secret: "",
		two_fa_logged: false,
		friends: null,
		blocked: [],
	};

	constructor(
		private readonly channelService: ChannelService,
		private readonly authService: AuthService
	) { }

	parseCookie(str: string) {
		return str
			.split(';')
			.map(v => v.split('='))
			.reduce((acc, v) => {
				acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
				return acc;
			}, {});
	}

	async get_ws_user(client: Socket) {
		if (!client.handshake.headers.cookie) {
			console.log('no jwt provided');
			client.disconnect();
			return (null);
		}
		var jwt = this.parseCookie(client.handshake.headers.cookie)['jwt'];
		const user = await this.authService.verifyJwt(jwt) || null;
		if (!user) {
			console.log('no user found with jwt');
			client.disconnect();
			return (null);
		}
		return (user);
	}

	joinRoom(client: Socket, channel_id: string) {
		client.rooms.forEach((room) => client.leave(room));
		client.join("room-" + channel_id);
		// console.log(client.id, "has joined room-" + channel_id);
	}

	leaveRoom(client: Socket, channel_id: string) {
		client.leave("room-" + channel_id);
		// console.log(client.id, "has left room-", channel_id);
	}
}