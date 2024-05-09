import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/user/dtos/login-user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(body: LoginUserDto) {
    let user = await this.userService.findUserByPhone(body.field);
    if (!user) {
      user = await this.userService.findUserByUserName(body.field);
      if (!user) {
        throw new UnauthorizedException('userName or phoneNumber is wrong');
      }
    }
    const [salt, hashPass] = user.password.split('.');
    const hash = (await scrypt(body.password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== hashPass) {
      throw new BadRequestException('password is not correct');
    }

    const payload = { sub: user._id, field: body.field };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
