import { Injectable } from '@nestjs/common';
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: 'supersecuresecret' // protect this, move to env var
		}) // 'validate' process actually goes here (jwt.io)
	}
	
	async validate(payload: any) {
		// const user = await this.usersService.getById(payload.sub);
		// return (user);
		return {
			id: payload.sub,
			username: payload.username,
		};
	}
}