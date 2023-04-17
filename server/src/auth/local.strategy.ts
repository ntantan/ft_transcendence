import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super(); // config
    }

    async validate(id: number, password: string = ''): Promise<any> {
        const user = await this.authService.validateUser(id, password);

        console.log("hellooo????");
        if (!user) {
            console.log("HEYYYYY");
            throw new UnauthorizedException();
        }

        return user;
    }
 }