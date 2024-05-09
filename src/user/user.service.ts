import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import mongoose, { Model } from 'mongoose';
import { UserRegisterDto } from './dtos/user-rgister.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { UserSecondStepRegDto } from './dtos/secondstepreg.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly User: Model<User>,
    @Inject(CACHE_MANAGER) private cachManager: Cache,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async createUser(body: UserRegisterDto) {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(body.password, salt, 32)) as Buffer;
    const hashPass = salt + '.' + hash.toString('hex');
    if (await this.findUserByPhone(body.phoneNumber)) {
      throw new BadRequestException(
        'a user with this phoneNumber already signed up',
        { cause: new Error(), description: 'use another phoneNumber' },
      );
    }

    if (await this.findUserByUserName(body.userName)) {
      throw new BadRequestException(
        'a user with this userName already signed up',
        { cause: new Error(), description: 'use another userName' },
      );
    }

    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    this.cachManager.set(
      body.userName,
      {
        phoneNumber: body.phoneNumber,
        password: hashPass,
        otp,
      },
      1000 * 120,
    );

    return otp;
  }

  async createUser2(body: UserSecondStepRegDto, userName: string) {
    const data = (await this.cachManager.get(userName)) as {
      phoneNumber: string;
      password: string;
      otp: string;
    };

    if (body.otp === data.otp) {
      return await this.User.create({
        phoneNumber: data.phoneNumber,
        password: data.password,
        userName,
      });
    }
    throw new BadRequestException('otp code is wrong', {
      cause: new Error(),
      description: 'register again or correct the otp code',
    });
  }

  async updateUser(body: UpdateUserDto, req, file: Express.Multer.File) {
    if (body.phoneNumber !== undefined) {
      if (await this.findUserByPhone(body.phoneNumber)) {
        throw new BadRequestException('this phoneNumber already exist', {
          cause: new Error(),
          description: 'use another phoneNumber',
        });
      }
    }

    if (body.email !== undefined) {
      if (await this.findUserByEmail(body.email)) {
        throw new BadRequestException('this email already exist', {
          cause: new Error(),
          description: 'use another email',
        });
      }
    }

    if (body.userName !== undefined) {
      if (await this.findUserByUserName(body.userName)) {
        throw new BadRequestException('this userName already exist', {
          cause: new Error(),
          description: 'use another userName',
        });
      }
    }
    this.updateUser2(body, req, file);
  }

  async updateUser2(body: UpdateUserDto, req, file: Express.Multer.File) {
    // const jahan = JSON.parse(JSON.stringify(file)).buffer.data;
    // console.log(jahan.toString());
    const user = await this.findUserById(req);
    return await this.User.findOneAndUpdate(
      { _id: req },
      {
        phoneNumber: body?.phoneNumber ?? user.phoneNumber,
        email: body?.email ?? user.email,
        gender: body?.gender ?? user.gender,
        birthDate: body?.birthDate ? new Date(body.birthDate) : user.birthDate,
        userName: body?.userName ?? user.userName,
        fullName: body?.fullName ?? user.fullName,
        profilePic: file ? file.toString() : user.profilePic,
      },
    );
  }

  async followSb(currUserId, targetUserId) {
    const user = await this.findUserById(targetUserId);
    if (!user) {
      throw new BadRequestException('this userId does not exist');
    }
    const user1 = await this.findUserById(currUserId);

    const session = await this.connection.startSession();
    session.withTransaction(async () => {
      await this.User.findOneAndUpdate(
        { _id: currUserId },
        {
          profile: {
            followers: [...user1.profile.followers],
            posts: [...user1.profile.posts],
            followings: [...user1.profile.followings, targetUserId],
          },
        },
      );

      await this.User.findOneAndUpdate(
        { _id: targetUserId },
        {
          profile: {
            followings: [...user.profile.followings],
            posts: [...user.profile.posts],
            followers: [...user.profile.followers, currUserId],
          },
        },
      );

      return user;
    });

    session.endSession();
  }

  async getAllFollowers(id: string) {
    const followers = await this.User.findById(
      { _id: id },
      'profile.followers',
    );

    const array = [];

    const followers2 = followers.profile.followers;

    console.log(followers2);
    this.getAllFollowers2(followers2, array, 0);
  }

  async getAllFollowers2(followers: any, array, i) {
    if (followers.length == array.length) {
      console.log(array.toString());
      return array.toString();
    } else {
      array.push(await this.User.findById({ _id: followers[i] }));
      this.getAllFollowers2(followers, array, i++);
    }
  }

  async findUserByPhone(phoneNumber: string) {
    return await this.User.findOne({ phoneNumber });
  }

  async findUserByUserName(userName: string) {
    return await this.User.findOne({ userName });
  }

  async findUserByEmail(email: string) {
    return await this.User.findOne({ email });
  }

  async findUserById(id: string) {
    return await this.User.findOne({ _id: id });
  }

  async findAllUsers() {
    return await this.User.find({}, 'phoneNumber _id userName');
  }
}
