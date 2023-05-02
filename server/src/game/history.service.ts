import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateHistoryDto } from "./dto/create-history.dto";
import { History } from "./entities/history.entities";
import { UsersService } from "src/users/users.service";

@Injectable()
export class HistoryService {

	constructor(
		@InjectRepository(History)
		private historyRepository: Repository<History>,
		private userService: UsersService,
	) {}

	findAll() 
	{
		return (this.historyRepository.find());
	}

	async findByUserId(id: string)
	{
		const data = await this.historyRepository.find({
			where: [
				{ player1: id},
				{ player2: id},
			],
		});
		return (data);
	}

	// async findOne(id: number)
	// {
	// 	const history = await this.historyRepository.findOne(id);
	// 	if (!history)
	// 		throw new Error("History not found");
	// 	return (history);
	// }

	async create(history: CreateHistoryDto)
	{
		const newHistory = await this.historyRepository.create(history);
		return (this.historyRepository.save(newHistory));
	}
}