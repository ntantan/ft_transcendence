import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';
import { ConfigService } from '@nestjs/config';
import { Status } from './enum/status.enum';
import { createReadStream } from 'fs';
import { join} from 'path';

const URL = 'http://localhost:3000/';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Friend)
        private readonly friendRepository: Repository<Friend>,
        private readonly connection: DataSource,
        private readonly configService: ConfigService,
    ) {}

    findAll(paginationQuery: PaginationQueryDto) {
        return this.userRepository.find({
            relations: ['friends'],
        });
    }

    async findOne(id: number) {
        const user = await this.userRepository.findOne({
            where: [ {id : id } ],
            relations: ['friends'],
        });
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        return user;
    }

    async create(createUserDto: CreateUserDto) : Promise<User> {
        const friends = await Promise.all(
          createUserDto.friends.map(username => this.preloadFriendByName(username)),  
        );
        const user = this.userRepository.create({
            ...createUserDto,
            friends,
        });
        return this.userRepository.save(user);
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const friends = updateUserDto.friends &&
        (await Promise.all(
            updateUserDto.friends.map(username => this.preloadFriendByName(username)),
        ));
        const user = await this.userRepository.preload({
            //username: (await this.findOne(id)).username,
            id: id,
            ...updateUserDto,
            friends
        });
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        return this.userRepository.save(user);
    }

    async updateAvatar(fileName: string, id: number) {
        const avatar = fileName;
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        user.avatar = avatar;
        console.log("the user avatar path is: " + user.avatar);

        return await this.userRepository.save(user);
    }

    async getAvatar(avatar: string) : Promise<StreamableFile> {
        const file = await createReadStream(join(process.cwd(), "public", avatar));
        return new StreamableFile(file);
    }
    
    async remove(id: number) {
        const user = await this.findOne(id);
        return this.userRepository.remove(user);
    }

    async levelUp(user: User) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            user.level++;

            const levelUpEvent = new Event();
            levelUpEvent.name = 'level_up_user';
            levelUpEvent.type = 'level';
            levelUpEvent.payload = { userId: user.id };

            await queryRunner.manager.save(user);
            await queryRunner.manager.save(levelUpEvent);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async winUp(user: User) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            user.win++;

            const winUpEvent = new Event();
            winUpEvent.name = 'win_up_user';
            winUpEvent.type = 'win';
            winUpEvent.payload = { userId: user.id };

            await queryRunner.manager.save(user);
            await queryRunner.manager.save(winUpEvent);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    private async preloadFriendByName(username: string): Promise<Friend> {
        const existingFriend = await this.friendRepository.findOne({ where: [{username:username}]});
        if (existingFriend) {
            return existingFriend;
        }
        return this.friendRepository.create({ username });
    }

    async saveUserInfo(token : string, info : { login: string, imgUrl: string}) : Promise<User> {
        const user = await this.userRepository.findOne({
            where: [ {username : info.login } ],
            relations: ['friends'],
        });
        if (!user) {
            const createUserDto : CreateUserDto = {
                username: info.login,
                authToken: token,
                avatar: info.imgUrl,
                level: 1,
                status: Status.OFFLINE,
                win: 0,
                lose: 0,
                two_fa: false,
                friends: [],
            };
            return this.create(createUserDto);
        }
        return user;
    }
 }