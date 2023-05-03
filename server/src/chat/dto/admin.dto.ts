import { IsString, IsAlphanumeric, IsNumberString } from "class-validator";

export class AdminDTO 
{
	@IsNumberString()
	readonly id: string;

	@IsNumberString()
	readonly user_id: Number;
}