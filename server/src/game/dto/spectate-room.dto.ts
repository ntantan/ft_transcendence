import { IsNumber, IsNumberString, IsString, IsAlphanumeric } from "class-validator";

export class spectateRoomDTO
{
	@IsAlphanumeric()
	readonly roomName: string;
}