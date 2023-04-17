import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Event } from './../events/entities/event.entity';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Friend } from 'src/users/entities/friend.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { Axios } from 'axios';

@Module({
    imports: [UsersModule, PassportModule, TypeOrmModule.forFeature([User, Friend, Event]), JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '36000s' },
    }), ConfigModule, HttpModule, Axios],
    providers: [AuthService, LocalStrategy, UsersService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule { }