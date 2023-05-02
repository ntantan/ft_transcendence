import { IsString, IsAlphanumeric } from "class-validator";

export class CreateRoomDTO 
{
	@IsAlphanumeric()
	readonly room_name: string;

	@IsAlphanumeric()
	readonly password: string;

	@IsString()
	readonly room_type: string;
}