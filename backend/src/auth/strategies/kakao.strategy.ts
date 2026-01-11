import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('KAKAO_CLIENT_ID');
    const clientSecret = configService.get<string>('KAKAO_CLIENT_SECRET');
    const callbackURL = configService.get<string>('KAKAO_CALLBACK_URL');

    if (!clientID || !callbackURL) {
      throw new Error('Kakao OAuth credentials are not defined');
    }

    super({
      clientID,
      clientSecret: clientSecret || '',
      callbackURL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: object) => void,
  ) {
    const { id, _json } = profile;

    const user = {
      providerId: String(id),
      email: _json?.kakao_account?.email,
      name: _json?.properties?.nickname,
      profileImage: _json?.properties?.profile_image,
      provider: 'KAKAO' as const,
    };

    done(null, user);
  }
}
