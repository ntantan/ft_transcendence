import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { Status } from '../enum/status.enum';
import { Friend } from '../entities/friend.entity';
import { Blocked } from '../entities/blocked.entity';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    readonly login: string;

    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    @Matches(/^[a-zA-Z0-9]+$/, { message: "Only letters, numbers and underscores allowed" })
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

    // @IsNotEmpty()
    @IsString()
    readonly secret: string;

    @IsNotEmpty()
    readonly two_fa_logged: boolean;

    @IsNotEmpty()
    readonly friends: Friend[];

    @IsNotEmpty()
    readonly blocked: Blocked[];
    
    @IsNotEmpty()
    readonly firstLogin: boolean;
}