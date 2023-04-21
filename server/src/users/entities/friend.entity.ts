import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { Status } from '../enum/status.enum';

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToMany(type => User, user => user.friends,)
    users: User[];
}