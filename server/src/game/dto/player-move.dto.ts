import { IsNumber, IsNumberString, IsString, IsAlphanumeric, IsAlpha } from "class-validator";

export class playerMoveDTO
{
	@IsAlphanumeric()
	readonly roomName: string;

	@IsAlpha()
	readonly direction: string;
}