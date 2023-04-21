import { IsString, IsNotEmpty } from 'class-validator';
import { isNumberObject } from 'util/types';
import { Status } from '../enum/status.enum';
import { Friend } from '../entities/friend.entity';
import { Blocked } from '../entities/blocked.entity';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    readonly username: string;

    @IsNotEmpty()    
    @IsString()
    readonly authToken: string;

    @IsNotEmpty()
    @IsString()
    readonly avatar: string;

    @IsNotEmpty()
    readonly level: number;

    @IsNotEmpty()
    readonly status: Status;

    @IsNotEmpty()
    readonly win: number;

    @IsNotEmpty()
    readonly lose: number;

    @IsNotEmpty()
    readonly two_fa: boolean;

    @IsNotEmpty()
    readonly friends: Friend[];

    @IsNotEmpty()
    readonly blocked: Blocked[];
}