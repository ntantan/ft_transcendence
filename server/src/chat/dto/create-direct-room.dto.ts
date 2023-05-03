import { IsString, IsAlphanumeric, IsNumber } from "class-validator";

export class CreateDirectRoomDTO 
{
	@IsNumber()
	readonly user_id: Number;
}