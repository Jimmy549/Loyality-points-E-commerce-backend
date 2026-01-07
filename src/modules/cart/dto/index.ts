import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Product ID' })
  @IsString()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity to add' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(100, { message: 'Quantity cannot exceed 100' })
  quantity: number;
}

export class RemoveFromCartDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Product ID' })
  @IsString()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @ApiProperty({ example: 1, description: 'Quantity to remove (optional, removes all if not specified)', required: false })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @IsOptional()
  quantity?: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Product ID' })
  @IsString()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @ApiProperty({ example: 3, description: 'New quantity' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(100, { message: 'Quantity cannot exceed 100' })
  quantity: number;
}