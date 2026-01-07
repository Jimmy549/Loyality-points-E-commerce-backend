import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './controller';
import { OrdersService } from './service';
import { OrdersSchema } from './schema';
import { CartSchema } from '../cart/schema';
import { ProductsSchema } from '../products/schema';
import { UsersSchema } from '../users/schema';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrdersSchema },
      { name: 'Cart', schema: CartSchema },
      { name: 'Product', schema: ProductsSchema },
      { name: 'User', schema: UsersSchema }
    ]),
    LoyaltyModule,
    NotificationsModule,
    PaymentsModule,
    JwtModule.register(jwtConfig())
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}