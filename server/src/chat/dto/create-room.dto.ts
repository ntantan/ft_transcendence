import { IsString } from "class-validator";

export class CreateRoomDTO 
{
	@IsString()
	readonly room_name: string;

	@IsString()
	readonly password: string;

	@IsString()
	readonly room_type: string;
}