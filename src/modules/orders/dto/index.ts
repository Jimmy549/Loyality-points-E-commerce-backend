import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @ApiProperty({ example: '123 Main St', required: false })
  @IsString({ message: 'Street must be a string' })
  @IsOptional()
  street?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsString({ message: 'City must be a string' })
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsString({ message: 'State must be a string' })
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsString({ message: 'Postal code must be a string' })
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsString({ message: 'Country must be a string' })
  @IsOptional()
  country?: string;
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
    required: true
  })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty({ message: 'Shipping address is required' })
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ 
    example: 'stripe', 
    enum: ['stripe', 'points', 'hybrid', 'money'], 
    required: false,
    description: 'Payment method for the order'
  })
  @IsEnum(['stripe', 'points', 'hybrid', 'money'], { message: 'Invalid payment method' })
  @IsOptional()
  paymentMethod?: 'stripe' | 'points' | 'hybrid' | 'money';

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

  @ApiProperty({ 
    example: 'paid', 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    required: false
  })
  @IsEnum(['pending', 'paid', 'failed', 'refunded'], {
    message: 'Invalid payment status'
  })
  @IsOptional()
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';

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