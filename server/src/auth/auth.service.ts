import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Injectable, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { Response } from 'express';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { Status } from 'src/users/enum/status.enum';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private readonly configService: ConfigService, 
        private readonly httpService: HttpService,
    ) {}

    async validateUser(id: number, password?:string): Promise<any> {
        const user = await this.usersService.findOne(id);

        if (user) {
            const { authToken, ...rest } = user; 
            return rest;
        }
        console.log("hello in validateUser");
        return null;
    }
    
    async redirectToLogin(@Res() res) {
        const authorizeUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${this.configService.get('API_UID')}&redirect_uri=${this.configService.get('API_REDIRECT_URL')}&response_type=code`;
        
        res.redirect(authorizeUrl);
    }

    async getToken(code: string) : Promise<any> {

        const response = await lastValueFrom(this.httpService.post(
            'https://api.intra.42.fr/oauth/token',
            {
                grant_type : 'authorization_code',
                client_id : `${this.configService.get('API_UID')}`,
                client_secret : `${this.configService.get('API_SECRET')}`,
                code : `${code}`,
                redirect_uri : `${this.configService.get('API_REDIRECT_URL')}`
            },
            {
                headers: {
                    'Content-type': 'application/json',
                    Accept: 'application/json',
                },
            },
        ).pipe(map((res) => res.data.access_token)));
        return response;
    }

    async getInfo(token: string) : Promise<any> {
        const response = await lastValueFrom(this.httpService.get(
            'https://api.intra.42.fr/v2/me',
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        ).pipe(map((res) => (
                        {
                            login: res.data.login,
                            imgUrl: res.data.image.versions.small,
                        }
                    )
                )
            )
        );
        return response;
    }

    generateJwt(user: User, res: Response) : string {
        const payload = { username: user.username, id: user.id };
        const token = this.jwtService.sign(payload);
        res.cookie('jwt', token, { httpOnly: true, secure: true });
        //res.redirect('http://localhost:3000/auth/login');
       // res.send('signed in!');
        return 'signed in!';
    }
 
    async login(@Req() req, @Res() res): Promise<User | void>{
        const jwt = req.cookies['jwt'];
        if (jwt) {
            let user = await this.verifyJwt(jwt).catch((err) => {console.log(err);});
            if (user) {
                user = await this.toggleStatus(user.id, Status.ONLINE).catch((err) => {console.log(err);});
                res.send("logged in successfully");
                return user;
            }
        }
        this.redirectToLogin(res);
    }

    async verifyJwt(token: string) : Promise<User | void> {
		let payload;
		try {
			payload = this.jwtService.verify(token);
		}
		catch {
			console.log("token expired");
			return (null);
		}
        const id = payload.id;
        let user = await this.usersService.findOne(id).catch((err) => {console.log(err);});
        if (!user) {
            // throw new Error('Invalid token');
			return (null)
        }
        return user; 
    }

    async toggleStatus(id: number, newStatus: Status) : Promise<User | void> {
        const updateUserDto : UpdateUserDto = { status: newStatus };
        await this.usersService.update(id, updateUserDto).catch((err) => {console.log(err);});
        const user = await this.usersService.findOne(id).catch((err) => {console.log(err);});
        return user;
    }

    async logout(@Req() req, @Res() res) : Promise<void> {
        const jwt = req.cookies['jwt'];
        const user = await this.verifyJwt(jwt);
        if (user) {
            this.toggleStatus(user.id, Status.OFFLINE);
        }
        res.clearCookie('jwt');
        //res.redirect('http://localhost:3000');
		res.send("logged out successfully");
    }
    //  wrapper function that calls get Token, getInfo, saveUserInfo? and name og wrapper == controller name(get 42-redirect)
}