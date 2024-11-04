import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAccountDto {
  @IsNumber()
  balance: number;
  @IsNumber()
  dailyLimit: number;
  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
