import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controller';
import { AuthService } from './service';
import { UsersSchema } from '../users/schema';
import { jwtConfig } from '../../config/jwt.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { DiscordStrategy } from './strategies/discord.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UsersSchema }]),
    JwtModule.register(jwtConfig())
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GithubStrategy, DiscordStrategy],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}