import { IsNumber } from "class-validator";

export class joinQueueDTO
{
	@IsNumber()
	readonly mod: Number;
}