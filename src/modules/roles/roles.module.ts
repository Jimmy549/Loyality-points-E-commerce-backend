import { Module } from '@nestjs/common';
import { RolesController } from './controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    JwtModule.register(jwtConfig())
  ],
  controllers: [RolesController]
})
export class RolesModule {}