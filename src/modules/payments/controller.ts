import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './service';
import { CreatePaymentDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPayment(@CurrentUser('id') userId: string, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(userId, createPaymentDto);
  }

  @Get('order/:orderId')
  async getPaymentByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  @Get('my-payments')
  async getUserPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.findUserPayments(userId);
  }
}