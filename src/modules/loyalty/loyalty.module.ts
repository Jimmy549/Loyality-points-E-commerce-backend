import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyController } from './controller';
import { LoyaltyService } from './service';
import { LoyaltySchema } from './schema';
import { ProductsSchema } from '../products/schema';
import { UsersSchema } from '../users/schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Loyalty', schema: LoyaltySchema },
      { name: 'Product', schema: ProductsSchema },
      { name: 'User', schema: UsersSchema }
    ]),
    JwtModule.register(jwtConfig())
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService]
})
export class LoyaltyModule {}