import { History } from '../entities/history.entities';

export class CreateHistoryDto {
	readonly player1: string;
	readonly player2: string;
	readonly player1_score: string;
	readonly player2_score: string;
	readonly winner: string;
	readonly gamemod: string;
	readonly date: Date;
}