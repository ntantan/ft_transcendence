import { IsString, IsAlphanumeric, IsNumberString } from "class-validator";

export class CreateMessageDTO 
{
	@IsNumberString()
	readonly id: string;

	@IsString()
	readonly msg: string;
}