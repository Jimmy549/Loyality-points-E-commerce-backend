import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
    const { id, username, emails, photos } = profile;
    const user = {
      provider: 'github',
      providerId: id,
      email: emails && emails[0] ? emails[0].value : `${username}@github.com`,
      name: profile.displayName || username,
      avatar: photos && photos[0] ? photos[0].value : profile._json.avatar_url,
    };
    done(null, user);
  }
}
