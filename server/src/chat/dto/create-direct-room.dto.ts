import { IsString, IsAlphanumeric } from "class-validator";

export class CreateDirectRoomDTO 
{
	@IsAlphanumeric()
	readonly room_name: string;
}