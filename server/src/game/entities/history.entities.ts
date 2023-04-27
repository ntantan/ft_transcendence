import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class History {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	player1: string;

	@Column()
	player2: string;

	@Column({nullable: true})
	player1_score: string;

	@Column({nullable: true})
	player2_score: string;

	@Column()
	winner: string;

	@Column()
	date: Date;
}