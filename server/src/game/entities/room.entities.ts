import {Game} from '../objects/Game';
import {Game2} from '../objects/Game2';
import {Game3} from '../objects/Game3';
import {Player} from '../objects/Player';

export class Room {
	id: number;
	name: string;
	state: string; // playing or waiting
	game: Game | Game2 | Game3;
	mod: string;
	player_1: string;
	player_2: string;
	p1_copy: string;
	p2_copy: string;
	player1_score: string;
	player2_score: string;
	end_status: string;
}