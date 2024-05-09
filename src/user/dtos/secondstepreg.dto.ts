import { IsNotEmpty, IsString } from 'class-validator';

export class UserSecondStepRegDto {
  @IsString()
  @IsNotEmpty()
  otp: string;
}
