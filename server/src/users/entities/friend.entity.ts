import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @ManyToMany(type => User, user => user.friends,)
    users: User[];
}