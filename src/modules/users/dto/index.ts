import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsNumber, MinLength, Min, IsNotEmpty, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces' })
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password (min 8 characters, must contain letters, numbers, and special characters)' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password: string;

  @ApiProperty({ example: 'USER', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], required: false, description: 'User role' })
  @IsEnum(['USER', 'ADMIN', 'SUPER_ADMIN'], { message: 'Role must be USER, ADMIN, or SUPER_ADMIN' })
  @IsOptional()
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false, description: 'User full name' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'user@example.com', required: false, description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'ADMIN', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], required: false, description: 'User role' })
  @IsEnum(['USER', 'ADMIN', 'SUPER_ADMIN'], { message: 'Role must be USER, ADMIN, or SUPER_ADMIN' })
  @IsOptional()
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';

  @ApiProperty({ example: 1000, required: false, description: 'User loyalty points' })
  @IsNumber({}, { message: 'Loyalty points must be a number' })
  @Min(0, { message: 'Loyalty points cannot be negative' })
  @IsOptional()
  loyaltyPoints?: number;
}