import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const databaseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: () => ({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  }),
});