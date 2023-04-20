import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, OneToOne, ManyToMany } from 'typeorm';
import { Messages } from './messages.entity';
import { User } from 'src/users/entities/user.entity';
import { ChannelUser } from './channelUser.entity';

@Entity()
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    password: string;

	// Can be "public", "private" with password, or "direct"
	@Column()
	type: string;

	// @Column()
	// channel_owner: number;

	// // Define who is the admin of the channel
	// @Column("text", {array: true, nullable: true})
	// admin: number[];

	// @Column("jsonb", {nullable: true})
	// muted: {user: number, until: Date}[];
	
	// @Column("text", {array: true, nullable: true})
	// banned: number[];

	@JoinTable()
	@OneToMany(() => ChannelUser, channelUser => channelUser.channel, {cascade: true})
	channel_users: ChannelUser[]

	@JoinTable()
    @OneToMany(() => Messages, messages => messages.channel, {cascade: true})
    messages: Messages[];
}