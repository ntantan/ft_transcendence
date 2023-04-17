import { IsString } from "class-validator";

export class UpdateUserDTO 
{
	@IsString()
	readonly requester: string;

	@IsString()
	readonly id: string;

	@IsString()
	readonly user: string;
}