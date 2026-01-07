import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateWebsiteContentDto {
  @ApiProperty({ example: 'hero', enum: ['hero', 'brands', 'new-arrivals', 'top-selling', 'dress-style', 'reviews', 'footer', 'about', 'contact'] })
  @IsEnum(['hero', 'brands', 'new-arrivals', 'top-selling', 'dress-style', 'reviews', 'footer', 'about', 'contact'])
  @IsNotEmpty()
  section: string;

  @ApiProperty({ example: 'text', enum: ['text', 'image', 'list', 'object', 'array'] })
  @IsEnum(['text', 'image', 'list', 'object', 'array'])
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'main-title' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'FIND CLOTHES THAT MATCHES YOUR STYLE' })
  value: any;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: {
    title?: string;
    description?: string;
    alt?: string;
    link?: string;
  };
}

export class UpdateWebsiteContentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  value?: any;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: {
    title?: string;
    description?: string;
    alt?: string;
    link?: string;
  };
}

export class QueryWebsiteContentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}