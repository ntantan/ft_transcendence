import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channels/channel.service';
import { ChannelController } from './channels/channel.controller';
import { Channel } from './channels/entities/channel.entity';
import { Messages } from './channels/entities/messages.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelUser } from './channels/entities/channelUser.entity';
import { UsersService } from 'src/users/users.service';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Channel, Messages, ChannelUser])],
    providers: [ChatGateway, ChatService, ChannelService, UsersService],
	controllers: [ChannelController],
})
export class ChatModule {}