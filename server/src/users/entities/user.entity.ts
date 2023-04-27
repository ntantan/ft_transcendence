import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Friend } from './friend.entity';
import { Status } from '../enum/status.enum';
import { Blocked } from './blocked.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn() // auto-increment the values
    id: number;

    @Column({ unique: true })
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
    
    @Column({ default: "" })
    secret: string;

    @JoinTable()
    @ManyToMany(
        type => Friend,
        (friend) => friend.users,
        {
            cascade: true, // ['insert']
        },
        )
    friends: Friend[];

    @JoinTable()
    @ManyToMany(
        type => Blocked,
        (blocked) => blocked.users,
        {
            cascade: true,
        }
    )
    blocked: Blocked[];

}