import { IsString } from "class-validator";

export class createMessageDTO
{
	@IsString()
	readonly id: string;

	@IsString()
	readonly message: string;
}