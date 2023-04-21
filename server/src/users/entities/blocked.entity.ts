import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Blocked {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToMany(type => User, user => user.blocked,)
    users: User[];
}