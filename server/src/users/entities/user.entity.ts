import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany } from 'typeorm';
import { Friend } from './friend.entity';
import { Status } from '../enum/status.enum';

@Entity()
export class User {
    @PrimaryGeneratedColumn() // auto-increment the values
    id: number;

    @Column()
    username: string;

    @Column()
    authToken: string;

    @Column()
    avatar: string;

    @Column({ default: 1 })
    level: number;

    @Column({ default: true })
    status: Status; // on/off/playing?(enum)

    @Column({ default: 0 })
    win: number;

    @Column({ default: 0 })
    lose: number;

    @Column({ default: false })
    two_fa: boolean;

    @JoinTable()
    @ManyToMany(
        type => Friend,
        (friend) => friend.users,
        {
            cascade: true, // ['insert']
        },
        )
    friends: Friend[];

}