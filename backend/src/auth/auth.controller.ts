import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  CheckEmailDto,
  SendVerificationDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { JwtAuthGuard, GoogleAuthGuard, KakaoAuthGuard } from './guards';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

// 쿠키 설정 헬퍼 함수
const getCookieOptions = (configService: ConfigService, maxAge: number) => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  return {
    httpOnly: true,
    secure: isProduction, // 프로덕션에서만 HTTPS 필수
    sameSite: isProduction ? ('none' as const) : ('lax' as const), // 크로스 사이트 요청 허용 (OAuth 콜백용)
    maxAge,
    path: '/',
  };
};

// 클라이언트 IP 추출 헬퍼 함수
const getClientIp = (req: Request): string => {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ips = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor.split(',')[0];
    return ips.trim();
  }
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
  }
  return req.socket?.remoteAddress || req.ip || '0.0.0.0';
};

// User-Agent 추출 헬퍼 함수
const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'Unknown';
};

interface OAuthUser {
  providerId: string;
  email?: string;
  name?: string;
  profileImage?: string;
  provider: 'GOOGLE' | 'KAKAO';
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 사용 중인 이메일' })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);
    const result = await this.authService.register(registerDto, ip, userAgent);

    // httpOnly 쿠키로 토큰 설정
    res.cookie(
      'accessToken',
      result.accessToken,
      getCookieOptions(this.configService, 15 * 60 * 1000), // 15분
    );
    res.cookie(
      'refreshToken',
      result.refreshToken,
      getCookieOptions(this.configService, 7 * 24 * 60 * 60 * 1000), // 7일
    );

    // 응답에 토큰 포함 (크로스 도메인 쿠키 설정 실패 대응)
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);
    const result = await this.authService.login(loginDto, ip, userAgent);

    // httpOnly 쿠키로 토큰 설정
    res.cookie(
      'accessToken',
      result.accessToken,
      getCookieOptions(this.configService, 15 * 60 * 1000), // 15분
    );
    res.cookie(
      'refreshToken',
      result.refreshToken,
      getCookieOptions(this.configService, 7 * 24 * 60 * 60 * 1000), // 7일
    );

    // 응답에 토큰 포함 (크로스 도메인 쿠키 설정 실패 대응)
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // 쿠키에서 refreshToken 읽기
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // 쿠키 삭제 (설정한 옵션과 동일하게)
    const clearOptions = getCookieOptions(this.configService, 0);
    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);

    return { message: '로그아웃 되었습니다.' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 쿠키 또는 Authorization 헤더에서 refreshToken 읽기
    let refreshToken = req.cookies?.refreshToken;

    // Authorization 헤더에서도 확인 (크로스 도메인 지원)
    if (!refreshToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.substring(7);
      }
    }

    if (!refreshToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    // 새 토큰을 쿠키에 설정
    res.cookie(
      'accessToken',
      tokens.accessToken,
      getCookieOptions(this.configService, 15 * 60 * 1000),
    );
    res.cookie(
      'refreshToken',
      tokens.refreshToken,
      getCookieOptions(this.configService, 7 * 24 * 60 * 60 * 1000),
    );

    // 응답에 토큰 포함 (크로스 도메인 쿠키 설정 실패 대응)
    return {
      message: '토큰이 갱신되었습니다.',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보 반환' })
  async getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }

  @Public()
  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiResponse({ status: 200, description: '이메일 사용 가능 여부 반환' })
  async checkEmail(@Body() checkEmailDto: CheckEmailDto) {
    return this.authService.checkEmail(checkEmailDto);
  }

  @Public()
  @Post('send-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 코드 발송' })
  @ApiResponse({ status: 200, description: '인증 코드 발송 성공' })
  @ApiResponse({ status: 409, description: '이미 가입된 이메일 (회원가입 시)' })
  async sendVerification(@Body() sendVerificationDto: SendVerificationDto) {
    return this.authService.sendVerification(sendVerificationDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 확인' })
  @ApiResponse({ status: 200, description: '인증 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 인증 코드' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 재설정 요청 (인증 코드 발송)' })
  @ApiResponse({ status: 200, description: '인증 코드 발송 성공' })
  @ApiResponse({ status: 400, description: '가입되지 않은 이메일' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiResponse({ status: 200, description: '비밀번호 재설정 성공' })
  @ApiResponse({ status: 400, description: '인증되지 않은 요청' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Google OAuth
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google 로그인' })
  async googleAuth() {
    // Guard가 리다이렉트 처리
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google 로그인 콜백' })
  async googleAuthCallback(
    @Req() req: Request & { user: OAuthUser },
    @Res() res: Response,
  ) {
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);
    const result = await this.authService.oauthLogin(req.user, ip, userAgent);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // iOS Safari ITP 대응: 토큰을 URL 파라미터로 전달
    // 프론트엔드에서 쿠키를 직접 설정하도록 함
    const params = new URLSearchParams({
      success: 'true',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }

  // Kakao OAuth
  @Public()
  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: 'Kakao 로그인' })
  async kakaoAuth() {
    // Guard가 리다이렉트 처리
  }

  @Public()
  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: 'Kakao 로그인 콜백' })
  async kakaoAuthCallback(
    @Req() req: Request & { user: OAuthUser },
    @Res() res: Response,
  ) {
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);
    const result = await this.authService.oauthLogin(req.user, ip, userAgent);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // iOS Safari ITP 대응: 토큰을 URL 파라미터로 전달
    // 프론트엔드에서 쿠키를 직접 설정하도록 함
    const params = new URLSearchParams({
      success: 'true',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
