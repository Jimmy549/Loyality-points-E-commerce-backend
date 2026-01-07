import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateLoyaltySettingsDto {
  @ApiProperty({ example: 10, description: 'Points earned per dollar spent' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pointsPerDollar?: number;

  @ApiProperty({ example: 0.1, description: 'Value of one point in currency (e.g. 0.1 = 10 cents)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pointsToMoneyRate?: number;

  @ApiProperty({ example: true, description: 'Enable/Disable loyalty system' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
