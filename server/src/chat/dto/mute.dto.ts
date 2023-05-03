import { IsString, IsAlphanumeric, IsNumberString, IsNumber} from "class-validator";

export class MuteDTO 
{
	@IsNumberString()
	readonly id: string;

	@IsNumberString()
	readonly user_id: Number;

	@IsNumber()
	readonly muted_time: Number;
}