import { IsString, IsNotEmpty } from 'class-validator';
import { Status } from '../enum/status.enum';

export class CreateFriendDto {
    @IsNotEmpty()
    @IsString()
    readonly username: string;

    @IsNotEmpty()
    readonly userId: number;

    @IsNotEmpty()
    readonly status: Status;

    @IsNotEmpty()
    @IsString()
    readonly avatar: string;

    @IsNotEmpty()
    readonly level: number;

}