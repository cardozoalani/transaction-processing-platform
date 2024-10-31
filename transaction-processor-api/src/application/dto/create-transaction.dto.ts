import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  TRANSACTION_TYPES,
  TransactionType,
} from '../../domain/types/transaction.types';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEnum(TRANSACTION_TYPES)
  transactionType: TransactionType;
}
