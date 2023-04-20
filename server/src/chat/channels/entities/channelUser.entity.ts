import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

import { User } from "src/users/entities/user.entity";
import { Channel } from "./channel.entity";

@Entity()
export class ChannelUser
{
	@PrimaryGeneratedColumn()
	id: number;

	@JoinTable()
	@ManyToOne(() => User)
	user: User;

	@Column({ default: false })
	channel_owner: boolean;

	@Column({ default: false })
	admin: boolean;

	@Column({ default: false })
	banned: boolean;

	// date until unmuted
	@Column({ nullable: true })
	muted: Date;
	
	@ManyToOne(() => Channel, channel => channel.channel_users)
	channel: Channel;
}