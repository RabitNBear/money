import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { Provider } from '@prisma/client';

interface OAuthUser {
  providerId: string;
  email?: string;
  name?: string;
  profileImage?: string;
  provider: 'GOOGLE' | 'KAKAO';
}

interface TokenPayload {
  sub: string;
  email: string;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 회원가입
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: Provider.LOCAL,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        provider: true,
        createdAt: true,
      },
    });

    // 토큰 생성
    const tokens = await this.generateTokens(user.id, user.email);

    // 로그인 기록 저장 (성공)
    await this.saveLoginHistory(user.id, true);

    return {
      user,
      ...tokens,
    };
  }

  // 로그인
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('탈퇴한 계정입니다.');
    }

    // 소셜 로그인 계정인 경우
    if (user.provider !== Provider.LOCAL) {
      throw new BadRequestException(
        `${user.provider} 계정으로 가입된 이메일입니다. 소셜 로그인을 이용해주세요.`,
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // 로그인 실패 기록
      await this.saveLoginHistory(user.id, false);
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 토큰 생성
    const tokens = await this.generateTokens(user.id, user.email);

    // 로그인 성공 기록
    await this.saveLoginHistory(user.id, true);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        provider: user.provider,
      },
      ...tokens,
    };
  }

  // OAuth 로그인/회원가입
  async oauthLogin(oauthUser: OAuthUser) {
    const { providerId, email, name, profileImage, provider } = oauthUser;

    // 기존 OAuth 사용자 찾기
    let user = await this.prisma.user.findFirst({
      where: {
        provider: provider as Provider,
        providerId,
      },
    });

    // 신규 사용자면 생성
    if (!user) {
      // 이메일로 기존 계정 확인
      if (email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new ConflictException(
            `이미 ${existingUser.provider} 계정으로 가입된 이메일입니다.`,
          );
        }
      }

      user = await this.prisma.user.create({
        data: {
          email: email || `${provider.toLowerCase()}_${providerId}@oauth.local`,
          name,
          profileImage,
          provider: provider as Provider,
          providerId,
        },
      });
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('탈퇴한 계정입니다.');
    }

    // 토큰 생성
    const tokens = await this.generateTokens(user.id, user.email);

    // 로그인 기록
    await this.saveLoginHistory(user.id, true);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        provider: user.provider,
      },
      ...tokens,
    };
  }

  // 토큰 갱신
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 블랙리스트 확인
      const blacklisted = await this.prisma.tokenBlacklist.findUnique({
        where: { token: refreshToken },
      });

      if (blacklisted) {
        throw new UnauthorizedException('만료된 토큰입니다.');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedException('유효하지 않은 사용자입니다.');
      }

      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  // 로그아웃
  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 토큰 블랙리스트에 추가
      const expiresAt = payload.exp ? new Date(payload.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.prisma.tokenBlacklist.create({
        data: {
          token: refreshToken,
          expiresAt,
        },
      });

      return { message: '로그아웃 되었습니다.' };
    } catch {
      return { message: '로그아웃 되었습니다.' };
    }
  }

  // 현재 사용자 정보
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        provider: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  // 토큰 생성
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const secret = this.configService.get<string>('JWT_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: 15 * 60, // 15분 (초 단위)
      }),
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: 7 * 24 * 60 * 60, // 7일 (초 단위)
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // 로그인 기록 저장
  private async saveLoginHistory(userId: string, success: boolean) {
    try {
      await this.prisma.loginHistory.create({
        data: {
          userId,
          ip: '0.0.0.0', // 실제로는 request에서 가져옴
          userAgent: 'Unknown',
          success,
        },
      });
    } catch (error) {
      console.error('Failed to save login history:', error);
    }
  }
}
