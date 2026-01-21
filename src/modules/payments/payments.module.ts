import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsSchema } from './schema';
import { OrdersSchema } from '../orders/schema';
import { UsersSchema } from '../users/schema';
import { CartSchema } from '../cart/schema';
import { ProductsSchema } from '../products/schema';
import { PaymentsService } from './service';
import { PaymentsController } from './controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Payment', schema: PaymentsSchema },
      { name: 'Order', schema: OrdersSchema },
      { name: 'User', schema: UsersSchema },
      { name: 'Cart', schema: CartSchema },
      { name: 'Product', schema: ProductsSchema }
    ]),
    NotificationsModule,
    EmailModule,
    JwtModule.register(jwtConfig())
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}