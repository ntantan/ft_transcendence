import { IsString, IsAlphanumeric, IsAlpha, IsInt } from "class-validator";

export class CreateRoomDTO 
{
	@IsAlphanumeric()
	readonly room_name: string;

	@IsString()
	readonly password: string;

	@IsAlphanumeric()
	readonly room_type: string;
}