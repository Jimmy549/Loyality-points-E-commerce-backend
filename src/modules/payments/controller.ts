import { Controller, Post, Get, Body, Param, UseGuards, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  @UseGuards(AuthGuard)
  async createCheckoutSession(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string; amount: number }
  ) {
    return this.paymentsService.createCheckoutSession(body.orderId, userId, body.amount);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string
  ) {
    const rawBody = req.body;
    return this.paymentsService.handleWebhook(rawBody, signature);
  }

  @Get('verify/:sessionId')
  @UseGuards(AuthGuard)
  async verifySession(@Param('sessionId') sessionId: string) {
    return this.paymentsService.verifySession(sessionId);
  }
}