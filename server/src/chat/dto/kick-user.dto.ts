import { IsString, IsAlphanumeric, IsNumberString, IsNumber } from "class-validator";

export class KickUserDTO 
{
	@IsNumberString()
	readonly id: string;

	@IsNumber()
	readonly user_id: Number;
}