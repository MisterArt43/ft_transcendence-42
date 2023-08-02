import {
	BaseEntity,
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { MessageEntity } from './message.entity';

export enum ChannelType {
	PUBLIC,
	PROTECTED,
	PRIVATE,
	DIRECT,
}

@Entity('TestChannels')
export class ChannelEntity extends BaseEntity {
	@PrimaryColumn()
	channelID: number;

	@ManyToOne(() => UserEntity)
	owner: UserEntity;

	/** Only Used if it's a Direct Channel*/
	@ManyToOne(() => UserEntity)
	owner2: UserEntity;

	@Column({
		type: 'varchar',
		length: 20,
	})
	name: string;

	@Column({
		type: 'enum',
		enum: ChannelType,
	})
	type: ChannelType;

	@ManyToMany(() => UserEntity)
	@JoinTable()
	adminList: UserEntity[];

	@ManyToMany(() => UserEntity)
	@JoinTable()
	userList: UserEntity[];

	@OneToMany(() => MessageEntity, (MessageEntity) => MessageEntity.channel)
	messages: MessageEntity[];
}
