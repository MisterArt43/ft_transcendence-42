import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { accessToken } from '../dto/payload';
import { CredentialService } from './credential.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private jwtService: JwtService,
		private credentialsService: CredentialService,
	) {}

	async logInVisit(login: string, rawPassword: string) {
		console.log(`NEW CONNECTION ===== \nlogin: ${login}\npass: ${rawPassword}`);
		if (login === undefined || rawPassword === undefined)
			throw new UnauthorizedException('Login or Password are empty');
		const user = await this.usersService.findOne(login);
		if (!user) {
			console.log('failed');
			throw new UnauthorizedException();
		}
		const credential = await this.usersService.getCredential(login);
		if (!(await this.credentialsService.compare(rawPassword, credential))) {
			console.log('failed');
			throw new UnauthorizedException();
		}
		console.log('success');
		const payloadToken: accessToken = { login, rawPassword };
		return await this.jwtService.signAsync(payloadToken);
	}

	logIn(login: string, password: string) {
		throw new BadRequestException('WIP');
	}

	async signInVisit(login: string, rawPassword: string) {
		if (login === undefined || rawPassword === undefined)
			throw new UnauthorizedException('Login or Password are empty');
		const payloadToken: accessToken = { login, rawPassword };
		if (await this.usersService.findOne(login))
			return new UnauthorizedException('Login already used');
		const userCredential = await this.credentialsService.create(rawPassword);
		await this.usersService.create(payloadToken.login, true, userCredential);
		return await this.jwtService.signAsync(payloadToken);
	}

	async signIn(login: string, password: string) {
		throw new BadRequestException('WIP');
	}
}
