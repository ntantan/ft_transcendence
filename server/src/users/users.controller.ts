import { Controller, Get, Param, Post, Body, Patch, Delete, Query, UseInterceptors, UploadedFile, StreamableFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';
import { Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import 'multer';
import * as fs from 'fs';
import { User } from './entities/user.entity';
import { FileIsDefinedValidator } from './validator/FileIsDefinedValidator';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto) {
        // const { limit, offset } = paginationQuery;
        return this.usersService.findAll(paginationQuery);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersService.findOne(id);
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }
    // put : replaces all the resource
    // patch : modifies partially
    @Patch(':id')
    async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @Res() res: Response): Promise<User> {
        return await this.usersService.update(id, updateUserDto);
    }

    @Post('/avatar/:id')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateAvatar(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                new MaxFileSizeValidator({ maxSize: 100000 }), // 100000 bytes = 100 kilobytes = 1 megabyte
                new FileIsDefinedValidator(),
            ],
            fileIsRequired: true,
        })
    ) file: Express.Multer.File, @Param('id') id: number) {
        await fs.writeFileSync(process.cwd() + "/public/" + file.originalname, file.buffer);
        return await this.usersService.updateAvatar(file.originalname, id);
    }

    @Post(':id/addFriend/:friendId')
    async addFriend(@Param('id') id: number, @Param('friendId') friendId: number): Promise<User> {
        return await this.usersService.addFriend(id, friendId);
    }

    @Post(':id/block/:blockedId')
    async blockUser(@Param('id') id: number, @Param('blockedId') blockedId: number): Promise<User> {
        return await this.usersService.blockUser(id, blockedId);
    }

    @Post(':id/unblock/:blockedId')
    async unblockUser(@Param('id') id: number, @Param('blockedId') blockedId: number): Promise<User> {
        return await this.usersService.unblockUser(id, blockedId);
    }

    @Post(':id/deleteFriend/:friendId')
    async deleteFriend(@Param('id') id: number, @Param('friendId') friendId: number): Promise<User> {
        return await this.usersService.deleteFriend(id, friendId);
    }

    @Get('/avatar/:filename')
    async getAvatar(@Param('filename') filename: string): Promise<StreamableFile> {
        return await this.usersService.getAvatar(filename);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.usersService.remove(id);
    }

}