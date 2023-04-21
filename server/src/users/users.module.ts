import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { Event } from '../events/entities/event.entity';
import { MulterModule } from '@nestjs/platform-express';
import { Blocked } from './entities/blocked.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Friend, Event, Blocked]), ConfigModule,
        MulterModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}