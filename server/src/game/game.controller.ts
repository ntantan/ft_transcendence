import { BadRequestException, Controller, Get, Param, Req, Res, UnauthorizedException } from '@nestjs/common';
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
	async getRooms(@Req() req)
	{
		if (!req.cookies['jwt'])
			throw new BadRequestException('No jwt provided');
		const user = await this.authService.verifyJwt(req.cookies['jwt']);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');
		return (this.gameService.findAllGame());
	}

	@Get('history')
	async getHistory(@Req() req) 
	{
		if (!req.cookies['jwt'])
			throw new BadRequestException('No jwt provided');
		const user = await this.authService.verifyJwt(req.cookies['jwt']);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		return (this.historyService.findAll());
	}

	@Get('history/:id')
	async getHistoryById(@Param('id') id: string, @Req() req) 
	{
		if (!req.cookies['jwt'])
			throw new BadRequestException('No jwt provided');
		const user = await this.authService.verifyJwt(req.cookies['jwt']);
		if (!user)
			throw new UnauthorizedException('Jwt verification failed');

		return (this.historyService.findByUserId(id));
	}
}
