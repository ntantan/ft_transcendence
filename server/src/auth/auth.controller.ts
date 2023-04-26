import { User } from 'src/users/entities/user.entity';
import { UsersService } from './../users/users.service';
import { Controller, Get, Req, Post, UseGuards, Res, HttpException, HttpStatus, Param, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { HttpAdapterHost } from '@nestjs/core';

@Controller('auth')
export class AuthController {
    constructor(
		private readonly authService: AuthService,
		private readonly usersService: UsersService
		) {}

	@Get()
	async redirectToLogin(@Res() res) {
		await this.authService.redirectToLogin(res);
	}

	@Get('42-redirect')
	async getToken(@Req() req, @Res() res: Response) {
		const code = req.query.code;
		try {
			const token = await this.authService.getToken(code);
			// Handle the response from the API
			// 1. use the token to retrieve id & profil photo
			// 2. save the individual token, id & photo into the user's repo
			// 3. return some info and especially the signed(generated) jwt for cookies(in a cookie or in the response body) as a "session token" in a response !
			const info = await this.authService.getInfo(token);
			const user = await this.usersService.saveUserInfo(token, info);
			this.authService.generateJwt(user, res);
			console.log("redirecting to localhost:3000");
			res.redirect('http://localhost:3000/auth/login');
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	@Get('login')
	async login(@Req() req: Request, @Res() res: Response): Promise<User | void> {
		return await this.authService.login(req, res);
	}

	@Get('logout')
	async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
		await this.authService.logout(req, res);
	}

	@Get('route_guard')
	async is_logged(@Req() req: Request, @Res() res: Response)
	{
		if (!req.cookies['jwt'])
			return(res.status(401).send("no jwt provided"));

		const verify = await this.authService.verifyJwt(req.cookies['jwt']);
		if (!verify)
			return(res.status(401).send("jwt verification failed"));
		return(res.status(200).send(verify));
	}

	@Get(':id/2faSecret')
    async get2faSecret(@Param('id') id: number): Promise<User> {
        return await this.authService.get2faSecret(id);
    }

    @Post(':id/verify2fa')
    async verify2fa(@Param('id') id: number, @Body() code: string): Promise<any> {
        return await this.authService.verify2fa(id, code);
    }
}