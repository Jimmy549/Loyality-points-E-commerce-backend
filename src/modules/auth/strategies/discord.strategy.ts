import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      clientID: process.env.DISCORD_CLIENT_ID || 'dummy',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || 'dummy',
      callbackURL: `${process.env.BACKEND_URL}/auth/discord/callback`,
      scope: ['identify', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
    const { id, username, email, avatar } = profile;
    const user = {
      provider: 'discord',
      providerId: id,
      email: email,
      name: username,
      avatar: avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : null,
    };
    done(null, user);
  }
}
