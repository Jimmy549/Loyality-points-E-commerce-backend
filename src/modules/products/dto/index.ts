import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, IsEnum, Min, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones', description: 'Product title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ example: 'High-quality wireless headphones with noise cancellation', description: 'Product description' })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({ example: 99.99, description: 'Product price' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price: number;

  @ApiProperty({ example: 100, description: 'Available stock quantity' })
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'Stock must be a valid number' })
  @Min(0, { message: 'Stock must be greater than or equal to 0' })
  stock: number;

  @ApiProperty({ 
    example: ['https://example.com/image1.jpg'], 
    description: 'Product image URLs',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: false, description: 'Whether product is on sale', required: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;

  @ApiProperty({ example: 79.99, description: 'Sale price (required if isOnSale is true)', required: false })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber({}, { message: 'Sale price must be a valid number' })
  @Min(0, { message: 'Sale price must be greater than or equal to 0' })
  @IsOptional()
  salePrice?: number;

  @ApiProperty({ 
    example: 'MONEY', 
    description: 'How the product can be purchased',
    enum: ['MONEY', 'POINTS', 'HYBRID']
  })
  @IsEnum(['MONEY', 'POINTS', 'HYBRID'], { message: 'Loyalty type must be MONEY, POINTS, or HYBRID' })
  @IsNotEmpty({ message: 'Loyalty type is required' })
  loyaltyType: 'MONEY' | 'POINTS' | 'HYBRID';

  @ApiProperty({ example: 500, description: 'Points required to purchase (overrides default rate)', required: false })
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsNumber()
  @Min(0)
  @IsOptional()
  loyaltyPointsCost?: number;

  @ApiProperty({ example: 'Electronics', description: 'Product category', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: ['wireless', 'audio', 'headphones'], description: 'Product tags', required: false, type: [String] })
  @IsOptional()
  tags?: any;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class QueryProductsDto {
  @ApiProperty({ required: false, description: 'Search query for product title or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false, enum: ['MONEY', 'POINTS', 'HYBRID'], description: 'Filter by loyalty type' })
  @IsEnum(['MONEY', 'POINTS', 'HYBRID'])
  @IsOptional()
  loyaltyType?: 'MONEY' | 'POINTS' | 'HYBRID';

  @ApiProperty({ required: false, description: 'Filter to show only products on sale' })
  @IsBoolean()
  @IsOptional()
  onSale?: boolean;

  @ApiProperty({ required: false, description: 'Minimum price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ required: false, description: 'Maximum price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ required: false, default: 1, description: 'Page number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 20, description: 'Items per page' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false, enum: ['price', '-price', 'title', 'createdAt', '-createdAt'], description: 'Sort field' })
  @IsString()
  @IsOptional()
  sortBy?: string;
}