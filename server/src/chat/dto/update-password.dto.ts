import { IsString, IsAlphanumeric, IsNumberString, IsNumber} from "class-validator";

export class UpdatePasswordDTO 
{
	@IsNumberString()
	readonly id: string;

	@IsString()
	readonly password: string;
}