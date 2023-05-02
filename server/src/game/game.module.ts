import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entities';
import { HistoryService } from './history.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Friend } from 'src/users/entities/friend.entity';
import { Blocked } from 'src/users/entities/blocked.entity';

@Module({
	imports: [AuthModule, ScheduleModule.forRoot(), TypeOrmModule.forFeature([History, User, Friend, Blocked])],
	controllers: [GameController],
	providers: [HistoryService, GameService, GameGateway, UsersService],
})
export class GameGatewayModule {}