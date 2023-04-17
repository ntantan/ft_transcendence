import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';
import { ChatService } from "./chat.service";
import { ChannelService } from "./channels/channel.service";
import { CreateRoomDTO } from "./dto/create-room.dto";
import { JoinRoomDTO } from "./dto/join-room.dto";
import { Res } from "@nestjs/common";

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
		console.log("test");
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			return;

		const aw = await this.channelService.createChannel(body.room_name, body.password, user, "public");
		this.server.emit('newRoom');
		console.log("room " + body.room_name + " created");
    }
	
    @SubscribeMessage('joinRoom')
    async joinRoom(@MessageBody() body: JoinRoomDTO, @ConnectedSocket() client: Socket) 
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
		return;
		
		// console.log(user)
		const join = this.channelService.addUser(body.id, user, body.password);
		if (join instanceof String)
			return (join);
		this.chatService.joinRoom(client, body.id);

		this.server.to("room-" + body.id).emit('updateRoom');
		// return (this.channelService.getChannel(body.id));
    }

	@SubscribeMessage('leaveRoom')
	async leaveRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			return;

		this.channelService.rmUser(body.id, user);
		this.chatService.leaveRoom(client, body.id);

		this.server.to("room-" + body.id).emit('updateRoom');
	}

	@SubscribeMessage('textMessage')
	async handleMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		const user = await this.chatService.get_ws_user(client);
		if (!user)
			return;

		const test = await this.channelService.newMessage(body.id, user, body.msg);
		this.server.to("room-" + body.id).emit('updateRoom');
	}	
}