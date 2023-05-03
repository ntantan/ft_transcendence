import { IsNumber, IsNumberString, IsString, IsAlphanumeric } from "class-validator";

export class joinRoomDTO
{
	@IsAlphanumeric()
	readonly roomName: string;
}