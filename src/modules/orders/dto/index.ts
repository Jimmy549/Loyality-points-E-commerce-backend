import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty({ message: 'Street address is required' })
  street: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @IsNotEmpty({ message: 'Postal code is required' })
  postalCode: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country: string;
}

class PaymentDetailsDto {
  @IsString()
  cardNumber: string;

  @IsString()
  cardholderName: string;

  @IsString()
  expiryDate: string;

  @IsString()
  cvv: string;
}

export class CreateOrderDto {
  @ApiProperty({ 
    example: 100, 
    description: 'Loyalty points to use for this order',
    required: false 
  })
  @IsNumber({}, { message: 'Points to use must be a number' })
  @Min(0, { message: 'Points to use must be greater than or equal to 0' })
  @IsOptional()
  pointsToUse?: number;

  @ApiProperty({ 
    description: 'Shipping address',
    type: ShippingAddressDto,
    required: false
  })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsOptional()
  shippingAddress?: ShippingAddressDto;

  @ApiProperty({ example: 'credit_card', enum: ['credit_card', 'debit_card', 'paypal'], required: false })
  @IsEnum(['credit_card', 'debit_card', 'paypal'])
  @IsOptional()
  paymentMethod?: 'credit_card' | 'debit_card' | 'paypal';

  @ApiProperty({ description: 'Payment details', type: PaymentDetailsDto, required: false })
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  @IsOptional()
  paymentDetails?: PaymentDetailsDto;

  @ApiProperty({ example: 'Leave at door', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderDto {
  @ApiProperty({ 
    example: 'CONFIRMED', 
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    required: false
  })
  @IsEnum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    message: 'Invalid order status'
  })
  @IsOptional()
  status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

  @ApiProperty({ example: 'TRK123456789', description: 'Tracking number', required: false })
  @IsString()
  @IsOptional()
  trackingNumber?: string;
}

export class QueryOrdersDto {
  @ApiProperty({ required: false, enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] })
  @IsEnum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false, description: 'Start date (ISO string)' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date (ISO string)' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}