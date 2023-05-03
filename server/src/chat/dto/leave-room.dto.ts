import { IsString, IsAlphanumeric, IsNumberString } from "class-validator";

export class LeaveRoomDTO 
{
	@IsNumberString()
	readonly id: string;
}