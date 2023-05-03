import { IsNumber, IsNumberString, IsString, IsAlphanumeric } from "class-validator";

export class leaveRoomDTO
{
	@IsAlphanumeric()
	readonly roomName: string;
}