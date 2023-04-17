import { IsString } from "class-validator";

export class JoinRoomDTO 
{
	@IsString()
	readonly id: string;

	@IsString()
	readonly password: string;
}