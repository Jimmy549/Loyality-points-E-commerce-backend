import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  getUserOrders(@CurrentUser() user: any) {
    return this.ordersService.getUserOrders(user.sub);
  }

  @Get(':id')
  getOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.getOrder(user.sub, id);
  }

  @Post('checkout')
  checkout(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.checkout(user.sub, createOrderDto);
  }

  @Patch(':id/cancel')
  cancelOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(user.sub, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }
}