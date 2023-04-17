import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entities';
import { HistoryService } from './history.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [AuthModule, ScheduleModule.forRoot(), TypeOrmModule.forFeature([History])],
	controllers: [GameController],
	providers: [HistoryService, GameService, GameGateway],
})
export class GameGatewayModule {}