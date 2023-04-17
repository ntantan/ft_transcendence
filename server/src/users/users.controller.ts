import { Controller, Get, Param, Post, Body, Patch, Delete, Query, Request, UseGuards, UseInterceptors, UploadedFile, StreamableFile } from '@nestjs/common';
import { Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import 'multer';
import * as fs from 'fs';
import { createReadStream } from 'fs';
import { join } from 'path';

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
    update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Post('/avatar/:id')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateAvatar(@UploadedFile() file: Express.Multer.File, @Param('id') id: number) {
        await fs.writeFileSync(process.cwd() + "/public/" + file.originalname, file.buffer);
        return await this.usersService.updateAvatar(file.originalname, id);
        //https://github.dev/oumeimatt/ft_transcendence/tree/main/src/frontend/src
        //settings/avatar
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