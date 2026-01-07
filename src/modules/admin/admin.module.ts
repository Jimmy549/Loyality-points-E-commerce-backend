import { Module } from '@nestjs/common';
import { AdminController } from './controller';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    ProductsModule,
    UsersModule,
    OrdersModule,
    RolesModule,
    JwtModule.register(jwtConfig())
  ],
  controllers: [AdminController]
})
export class AdminModule {}