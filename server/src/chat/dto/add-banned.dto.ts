import { IsString, IsAlphanumeric, IsNumberString } from "class-validator";

export class BannedDTO 
{
	@IsNumberString()
	readonly id: string;

	@IsNumberString()
	readonly user_id: Number;
}