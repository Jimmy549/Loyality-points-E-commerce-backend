import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductsService } from '../products/service';
import { UsersService } from '../users/service';
import { OrdersService } from '../orders/service';
import { PaymentsService } from '../payments/service';
import { CreateProductDto, UpdateProductDto } from '../products/dto';
import { UpdateOrderDto } from '../orders/dto';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService
  ) {}

  // Product Management
  @Post('products')
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Put('products/:id/sale')
  async toggleSale(@Param('id') id: string, @Body() saleData: { isOnSale: boolean; salePrice?: number }) {
    return this.productsService.update(id, saleData);
  }

  // User Management
  @Get('users')
  async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.usersService.getAllUsers({ page, limit });
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // Order Management
  @Get('orders')
  async getAllOrders(@Query('status') status?: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.ordersService.findAll({ status, page, limit });
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Put('orders/:id')
  async updateOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  @Patch('orders/:id')
  async patchOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  @Post('orders/:id/refund')
  async refundOrder(@Param('id') id: string, @Body() body: { reason?: string }) {
    const order = await this.ordersService.findById(id);
    if (!order) throw new Error('Order not found');
    return this.paymentsService.refundPayment(id, order.userId.toString(), body.reason);
  }

  // Analytics
  @Get('analytics/dashboard')
  async getDashboardStats() {
    return {
      totalUsers: await this.usersService.getTotalCount(),
      totalOrders: await this.ordersService.getTotalCount(),
      totalProducts: await this.productsService.getTotalCount(),
      totalRevenue: await this.ordersService.getTotalRevenue()
    };
  }

  @Get('analytics/sales')
  async getSalesAnalytics(@Query('period') period: string = 'monthly') {
    return {
      period,
      data: [
        { date: '2024-01', sales: 12500 },
        { date: '2024-02', sales: 15000 },
        { date: '2024-03', sales: 18000 },
      ]
    };
  }
}