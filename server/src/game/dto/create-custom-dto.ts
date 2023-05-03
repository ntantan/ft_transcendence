import { IsNumber, IsNumberString } from "class-validator";

export class createCustomDTO
{
	@IsNumber()
	readonly mod: Number;

	@IsNumberString()
	readonly invite_id: string;
}