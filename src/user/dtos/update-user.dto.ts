import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '../schema/user.schema';

export class UpdateUserDto {
  @IsOptional()
  fullName: {
    firstName: string;
    lastName: string;
  };

  @IsEmail()
  @IsString()
  @IsOptional()
  email: string;

  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @IsString()
  @IsOptional()
  @MinLength(11)
  @MaxLength(11)
  phoneNumber: string;

  @IsDateString()
  @IsOptional()
  birthDate: Date;

  @IsString()
  @IsOptional()
  userName: string;
}
