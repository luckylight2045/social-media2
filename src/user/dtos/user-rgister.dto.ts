import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UserRegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(11)
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}
