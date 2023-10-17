import {BadRequestException, Injectable} from '@nestjs/common';
import {UpdateUserDto} from '../dto/user/update-user.dto';
import {UserEntity, UserStatus} from '../entities/user.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UserCredentialEntity} from '../entities/credential.entity';
import {ChannelService} from "../module.channels/channel.service";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		private readonly channelService: ChannelService,
	) {
	}

	/**
	 * Todo: update with new thing in table
	 */
	/**
	 * Create and save the new user
	 * @param newLogin login of the user
	 * @param newInvite if true the person is treated not has a member of 42
	 * @param newCredential his credential
	 */
	async create(
		newLogin: string,
		newInvite: boolean,
		newCredential: UserCredentialEntity,
	) {
		let nickname: string;
		nickname = newLogin;
		if (newInvite)
			nickname = this.generateNickname();
		while (await this.nicknameUsed(nickname))
			nickname = this.generateNickname();
		const channel = await this.channelService.createGenerale(await this.getAdmin());
		const user = this.usersRepository.create({
			login: newLogin,
			nickname: nickname,
			visit: newInvite,
			channelJoined: [channel],
		});
		user.credential = newCredential;
		await user.save();
		console.log(`New User \`${user.login}\` with ID ${user.UserID}`);
		return user;
	}

	async findAll() {
		return this.usersRepository.find();
	}

	/**
	 * @return UserEntity Or Undefined if user not in db
	 */
	async findOne(userID: number, relations?: string[]) {
		let user: UserEntity;
		if (!relations)
			user = await this.usersRepository.findOneBy({UserID: userID});
		else
			user = await this.usersRepository.findOne({
				where: {UserID: userID},
				relations,
			});
		if (user == null) throw new BadRequestException("this user doesn't exist");
		return user;
	}

	async update(user: UserEntity, updateUser: UpdateUserDto) {
		if (!await this.nicknameUsed(updateUser.nickname)) user.nickname = updateUser.nickname
		if (updateUser.avatar !== undefined) user.avatar_path = updateUser.avatar;
		if (updateUser.has_2fa !== undefined) user.has_2fa = updateUser.has_2fa;
		await user.save();
		return user;
	}

	async getCredential(userID: number) {
		const target = await this.usersRepository.findOne({
			where: {UserID: userID},
			relations: ['credential'],
		});
		return target.credential;
	}

	/**
	 * Need to call a emit to notify other User (Followers) that they change status on 'user.${user.userID}`
	 */
	async userStatus(user: UserEntity, newStatus: UserStatus) {
		user.status = newStatus;
		await user.save();
	}

	private generateNickname() {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < 12) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
			counter += 1;
		}
		return result;
	}

	/**
	 * return false if nickname is not used
	 */
	async nicknameUsed(nickname: string) {
		return !!await this.usersRepository.findOneBy({nickname: nickname});
	}

	blockUser(user: UserEntity, target: UserEntity) {
		user.blocked.push(target);
		return user.save();
	}

	unBlockUser(user: UserEntity, target: UserEntity) {
		user.blocked = user.blocked.filter(block => block.UserID != target.UserID);
		return user.save();
	}

	async getAdmin(cred?: UserCredentialEntity) {
		let admin = await this.usersRepository.findOneBy({login: 'admin'});
		if (!admin)
			admin = await this.create('admin', true, cred);
		return admin;

	}
}
