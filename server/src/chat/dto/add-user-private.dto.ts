import { IsString, IsAlphanumeric, IsNumberString } from "class-validator";

export class AddUserPrivateDTO 
{
	@IsNumberString()
	readonly id: string;

	@IsNumberString()
	readonly user_id: string;
}