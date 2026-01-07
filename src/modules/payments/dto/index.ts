import { IsString, IsNumber, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CardDetailsDto {
  @IsString()
  cardNumber: string;

  @IsString()
  cardholderName: string;

  @IsString()
  expiryDate: string;

  @IsString()
  cvv: string;
}

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsEnum(['credit_card', 'debit_card', 'paypal'])
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal';

  @ValidateNested()
  @Type(() => CardDetailsDto)
  cardDetails: CardDetailsDto;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  status?: 'pending' | 'completed' | 'failed' | 'refunded';

  @IsOptional()
  @IsString()
  transactionId?: string;
}