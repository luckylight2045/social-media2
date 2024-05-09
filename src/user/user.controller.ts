import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserRegisterDto } from './dtos/user-rgister.dto';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserSecondStepRegDto } from './dtos/secondstepreg.dto';
import { CurrentUser } from './decorators/current-user.decoratorl';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('file'))
  async createUser(@Body() body: UserRegisterDto) {
    return this.userService.createUser(body);
  }

  @Post('register/:userName')
  async userRegistration(
    @Body() body: UserSecondStepRegDto,
    @Param('userName') userName,
  ) {
    return this.userService.createUser2(body, userName);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('update')
  async updateUser(
    @Body() body: UpdateUserDto,
    @CurrentUser() user,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateUser(body, user, file);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async getAllUsers() {
    return this.userService.findAllUsers();
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log(body);
    return file;
  }

  @Get('getUser/:userName')
  async getUser(@Param('userName') userName: string) {
    return await this.userService.findUserByUserName(userName);
  }

  @UseGuards(AuthGuard)
  @Post('profile/:targetId')
  async followSb(
    @Param('targetId') targetId: string,
    @CurrentUser() user: any,
  ) {
    return await this.userService.followSb(user, targetId);
  }

  @Get('followers/:id')
  async getFollowers(@Param('id') id: string) {
    return this.userService.getAllFollowers(id);
  }
}
