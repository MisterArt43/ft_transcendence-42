import { UserStatus } from "src/entities/user.entity";

export class UpdateUserDto {
	nickname?: string;
	avatar?: string;
	has_2fa?: boolean;
	status: UserStatus;
}
