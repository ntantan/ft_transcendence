import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channels/channel.service';
import { ChannelController } from './channels/channel.controller';
import { Channel } from './channels/entities/channel.entity';
import { Messages } from './channels/entities/messages.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Channel, Messages])],
    providers: [ChatGateway, ChatService, ChannelService],
	controllers: [ChannelController],
})
export class ChatModule {}