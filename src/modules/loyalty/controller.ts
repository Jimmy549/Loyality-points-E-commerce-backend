import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { LoyaltyService } from './service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UpdateLoyaltySettingsDto } from './dto/update-settings.dto';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Get('rates')
  getConversionRates() {
    return this.loyaltyService.getConversionRates();
  }

  @Put('settings')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateSettings(@Body() dto: UpdateLoyaltySettingsDto) {
    return this.loyaltyService.updateSettings(dto);
  }

  @Get('balance')
  @UseGuards(AuthGuard)
  async getUserBalance(@CurrentUser() user: any) {
    // This will be handled by user service, just return user points
    return { loyaltyPoints: user.loyaltyPoints || 0 };
  }
}