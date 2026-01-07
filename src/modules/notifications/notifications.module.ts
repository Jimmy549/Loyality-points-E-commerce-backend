import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController, AdminNotificationsController } from './controller';
import { NotificationsService } from './service';
import { NotificationGateway } from './notification.gateway';
import { NotificationsSchema } from './schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationsSchema }]),
    JwtModule.register(jwtConfig())
  ],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [NotificationsService, NotificationGateway],
  exports: [NotificationsService, NotificationGateway]
})
export class NotificationsModule {}