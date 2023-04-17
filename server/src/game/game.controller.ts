import { Controller, Get, Req, Res } from '@nestjs/common';
import { Room } from './entities/room.entities';
import { GameService } from './game.service';
import { HistoryService } from './history.service';
import { AuthService } from 'src/auth/auth.service';

@Controller()
export class GameController {

	constructor(private readonly gameService: GameService, 
				private readonly historyService: HistoryService,
				private readonly authService: AuthService) 
	{};

	@Get('rooms')
	getRooms(): Room[] 
	{
		return (this.gameService.findAllGame());
	}

	@Get('history')
	async getHistory(@Req() req) 
	{
		// const user = await this.authService.verifyJwt(req.cookies['jwt']);
		// replace by find history with matching user
		return (this.historyService.findAll());
	}
}
