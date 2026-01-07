import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { WebsiteController } from './controller';
import { WebsiteService } from './service';
import { WebsiteContentSchema } from './schema';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'WebsiteContent', schema: WebsiteContentSchema }]),
    JwtModule.register(jwtConfig())
  ],
  controllers: [WebsiteController],
  providers: [WebsiteService],
  exports: [WebsiteService]
})
export class WebsiteModule {}