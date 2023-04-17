import { History } from '../entities/history.entities';

export class CreateHistoryDto {
	readonly player1: string;
	readonly player2: string;
	readonly winner: string;
	readonly gamemod: string;
	readonly date: Date;
}