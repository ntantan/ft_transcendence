import { Injectable, NotFoundException, StreamableFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';
import { Status } from './enum/status.enum';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Blocked } from './entities/blocked.entity';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Friend)
        private readonly friendRepository: Repository<Friend>,
        @InjectRepository(Blocked)
        private readonly blockedRepository: Repository<Blocked>,
        private readonly connection: DataSource,
    ) { }

    findAll(paginationQuery: PaginationQueryDto) {
        return this.userRepository.find({
            relations: ['friends', 'blocked'],
        });
    }

    async findOne(id: number) {
        const user = await this.userRepository.findOne({
            where: [{ id: id }],
            relations: ['friends', 'blocked'],
        });
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        return user;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const friends = await Promise.all(
            createUserDto.friends.map(friend => this.preloadFriend(friend)),
        );
        const blocked = await Promise.all(
            createUserDto.blocked.map(blocked => this.preloadBlocked(blocked)),
        );
        const user = this.userRepository.create({
            ...createUserDto,
            friends,
            blocked,
        });
        return this.userRepository.save(user);
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const friends = updateUserDto.friends &&
            (await Promise.all(
                updateUserDto.friends.map(friend => this.preloadFriend(friend)),
            ));
        const blocked = updateUserDto.blocked &&
            (await Promise.all(
                updateUserDto.blocked.map(blocked => this.preloadBlocked(blocked)),
            ));
        let user = await this.userRepository.preload({
            id: id,
            ...updateUserDto,
            friends,
            blocked,
        });
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        try {
            user = await this.userRepository.save(user);
        } catch (error) {
            if (error.code === '23505') {
                throw new BadRequestException("Username already exists");
            }
            else {
                console.log(error + " in usersService update");
                throw new InternalServerErrorException();
            }
        }
        return user;
    }

    async updateAvatar(fileName: string, id: number) {
        const avatar = fileName;
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        user.avatar = avatar;

        return await this.userRepository.save(user);
    }

    async getAvatar(avatar: string): Promise<StreamableFile> {
        const file = await createReadStream(join(process.cwd(), "public", avatar));
        return new StreamableFile(file);
    }

    async addFriend(id: number, friendId: number): Promise<User> {
        const user = await this.findOne(id);
        const friendAsUser = await this.findOne(friendId);

        if (!user || !friendAsUser) {
            throw new NotFoundException(`User(s) not found`);
        }
        let friend = await this.friendRepository.findOne({ where: [{ userId: friendId }] });
        if (!friend) {
            friend = new Friend();
            friend.userId = friendAsUser.id;
            this.friendRepository.save(friend);
        }
        if (user.friends.find(oldFriend => oldFriend.userId === friendId) === undefined)
            user.friends.push(friend);
        return await this.userRepository.save(user);
    }

    async blockUser(id: number, friendId: number): Promise<User> {
        const user = await this.deleteFriend(id, friendId);
        let blocked = await this.blockedRepository.findOne({ where: [{ userId: friendId }] });
        if (!blocked) {
            blocked = new Blocked();
            blocked.userId = friendId;
            this.blockedRepository.save(blocked);
        }
        user.blocked.push(blocked);
        return await this.userRepository.save(user);
    }

    async unblockUser(id: number, friendId: number): Promise<User> {
        const user = await this.findOne(id);
        const blockedToDelete = await this.findOne(friendId);

        if (!user || !blockedToDelete) {
            throw new NotFoundException(`User(s) not found`);
        }
        const blocked = await this.blockedRepository.findOne({ where: [{ userId: friendId }] });
        if (blocked) {
            user.blocked = user.blocked.filter(blocked => blocked.userId !== friendId);
        }
        return await this.userRepository.save(user);
    }

    async deleteFriend(id: number, friendId: number): Promise<User> {
        const user = await this.findOne(id);
        const friendToDelete = await this.findOne(friendId);

        if (!user || !friendToDelete) {
            throw new NotFoundException(`User(s) not found`);
        }
        const friend = await this.friendRepository.findOne({ where: [{ userId: friendId }] });
        if (friend) {
            user.friends = user.friends.filter(friend => friend.userId !== friendId);
        }
        return await this.userRepository.save(user);
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

    async loseUp(user: User) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            user.lose++;

            const loseUpEvent = new Event();
            loseUpEvent.name = 'lose_up_user';
            loseUpEvent.type = 'lose';
            loseUpEvent.payload = { userId: user.id };

            await queryRunner.manager.save(user);
            await queryRunner.manager.save(loseUpEvent);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    private async preloadFriend(friend: Friend): Promise<Friend> {
        const existingFriend = await this.friendRepository.findOne({ where: [{ userId: friend.userId }] });
        if (existingFriend) {
            return existingFriend;
        }
        return this.friendRepository.create({ ...friend, });
    }

    private async preloadBlocked(blocked: Blocked): Promise<Blocked> {
        const existingBlocked = await this.blockedRepository.findOne({ where: [{ userId: blocked.userId }] });
        if (existingBlocked) {
            return existingBlocked;
        }
        return this.blockedRepository.create({ ...blocked, });
    }

    async saveUserInfo(token: string, info: { login: string, imgUrl: string }): Promise<User> {
        const user = await this.userRepository.findOne({
            where: [{ login: info.login }],
            relations: ['friends', 'blocked'],
        });
        if (!user) {
            const createUserDto: CreateUserDto = {
                login: info.login,
                username: info.login,
                authToken: token,
                avatar: info.imgUrl,
                level: 1,
                status: Status.OFFLINE,
                win: 0,
                lose: 0,
                two_fa: false,
                secret: "",
                two_fa_logged: false,
                friends: [],
                blocked: [],
                firstLogin: true,
            };
            return await this.create(createUserDto);
        }
        return user;
    }

    async getBlockedUsers(user: User): Promise<User[]> {
        if (user.blocked === undefined) {
            return [];
        }
        const blockedUsers = [];
        for (const blocked of user.blocked) {
            const blockedUser = await this.findOne(blocked.userId);
            if (blockedUser) {
                blockedUsers.push(blockedUser);
            }
        }
        return blockedUsers;
    }
}