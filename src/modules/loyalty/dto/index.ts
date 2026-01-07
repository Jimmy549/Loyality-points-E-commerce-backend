import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, IsNotEmpty, IsMongoId } from 'class-validator';

export class AdjustPointsDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: 100, description: 'Points to add (positive) or deduct (negative)' })
  @IsNumber()
  points: number;

  @ApiProperty({ example: 'Bonus points for completing survey' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}