import { IsString, IsAlphanumeric, IsNumberString } from "class-validator";

export class JoinSocketDTO 
{
	@IsNumberString()
	readonly id: string;
}