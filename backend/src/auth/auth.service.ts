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
import {
  RegisterDto,
  LoginDto,
  CheckEmailDto,
  SendVerificationDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { Provider, VerificationType } from '@prisma/client';

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
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  // 이메일 중복 확인
  async checkEmail(checkEmailDto: CheckEmailDto) {
    const { email } = checkEmailDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    return {
      available: !existingUser,
      message: existingUser ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.',
    };
  }

  // 인증 코드 발송
  async sendVerification(sendVerificationDto: SendVerificationDto) {
    const { email, type } = sendVerificationDto;

    // 회원가입 인증 시 이미 가입된 이메일 확인
    if (type === 'SIGNUP') {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('이미 가입된 이메일입니다.');
      }
    }

    // 비밀번호 재설정 시 가입된 이메일인지 확인
    if (type === 'PASSWORD') {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        throw new BadRequestException('가입되지 않은 이메일입니다.');
      }

      if (existingUser.provider !== Provider.LOCAL) {
        throw new BadRequestException(
          `${existingUser.provider} 계정으로 가입된 이메일입니다. 소셜 로그인을 이용해주세요.`,
        );
      }
    }

    // 기존 인증 코드 삭제
    await this.prisma.emailVerification.deleteMany({
      where: {
        email,
        type: type as VerificationType,
      },
    });

    // 6자리 인증 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 인증 코드 저장 (10분 유효)
    await this.prisma.emailVerification.create({
      data: {
        email,
        code,
        type: type as VerificationType,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // TODO: 실제 이메일 발송 로직 (현재는 개발용으로 코드 반환)
    // 프로덕션에서는 Nodemailer, SendGrid 등으로 이메일 발송
    console.log(`[DEV] 인증 코드: ${code} (이메일: ${email})`);

    return {
      message: '인증 코드가 발송되었습니다.',
      // 개발 환경에서만 코드 반환 (프로덕션에서는 제거)
      ...(process.env.NODE_ENV !== 'production' && { code }),
    };
  }

  // 이메일 인증 확인
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, code, type } = verifyEmailDto;

    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        email,
        code,
        type: type as VerificationType,
        verified: false,
      },
    });

    if (!verification) {
      throw new BadRequestException('유효하지 않은 인증 코드입니다.');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('인증 코드가 만료되었습니다.');
    }

    // 인증 완료 처리
    await this.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    return {
      verified: true,
      message: '이메일 인증이 완료되었습니다.',
    };
  }

  // 비밀번호 재설정 요청
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // sendVerification과 동일하게 PASSWORD 타입으로 발송
    return this.sendVerification({
      email: forgotPasswordDto.email,
      type: 'PASSWORD' as any,
    });
  }

  // 비밀번호 재설정
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, newPassword } = resetPasswordDto;

    // 인증 코드 확인
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        email,
        code,
        type: VerificationType.PASSWORD,
        verified: true,
      },
    });

    if (!verification) {
      throw new BadRequestException('인증되지 않은 요청입니다. 이메일 인증을 먼저 완료해주세요.');
    }

    // 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 해싱 및 업데이트
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 사용된 인증 코드 삭제
    await this.prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    // 보안 로그 기록
    await this.prisma.securityLog.create({
      data: {
        action: 'PASSWORD_RESET',
        userId: user.id,
        ip: '0.0.0.0',
        userAgent: 'Unknown',
        details: '비밀번호 재설정 완료',
      },
    });

    return { message: '비밀번호가 재설정되었습니다.' };
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
