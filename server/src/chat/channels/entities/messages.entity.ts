import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinTable, ManyToMany, OneToOne} from 'typeorm';
import { Channel } from './channel.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Messages {
    @PrimaryGeneratedColumn()
    id: number;
 
    @Column()
	message: string;

	// @Column()
	// user: string;
	@JoinTable()
	@ManyToOne(() => User)
	user: User;

	@Column()
	date: Date;

	@ManyToOne(type => Channel, channel => channel.messages)
	channel: Channel
}	

