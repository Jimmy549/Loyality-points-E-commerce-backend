import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsSchema } from './schema';
import { PaymentsService } from './service';
import { PaymentsController } from './controller';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Payment', schema: PaymentsSchema }]),
    JwtModule.register(jwtConfig())
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}