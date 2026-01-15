import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Provider } from '@prisma/client';

// 외부 모듈 모킹
jest.mock(
  '@nestjs/schedule',
  () => ({
    Cron: () => () => {},
    CronExpression: {
      EVERY_DAY_AT_3AM: '0 0 3 * * *',
    },
  }),
  { virtual: true },
);

jest.mock(
  'nodemailer',
  () => ({
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test' }),
    }),
  }),
  { virtual: true },
);

// bcrypt 모킹
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// 모킹 후 import
import { AuthService } from './auth.service';
import { EmailService } from '../common/email/email.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  // Mock 데이터
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: '테스트유저',
    password: 'hashedPassword',
    profileImage: null,
    provider: Provider.LOCAL,
    providerId: null,
    role: 'USER',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock 서비스들
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    tokenBlacklist: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    loginHistory: {
      create: jest.fn(),
    },
    emailVerification: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    securityLog: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    verify: jest.fn().mockReturnValue({
      sub: 'user-123',
      email: 'test@example.com',
      exp: Date.now() / 1000 + 3600,
    }),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockEmailService = {
    sendVerificationCode: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);

    // 각 테스트 전에 mock 초기화
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      name: '신규유저',
    };

    it('새 사용자를 성공적으로 등록해야 함', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        name: registerDto.name,
      });

      const result = await service.register(
        registerDto,
        '127.0.0.1',
        'Mozilla',
      );

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.loginHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ip: '127.0.0.1',
            userAgent: 'Mozilla',
            success: true,
          }),
        }),
      );
    });

    it('이미 존재하는 이메일로 등록 시 ConflictException 발생', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('올바른 자격증명으로 로그인 성공', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.login(loginDto, '127.0.0.1', 'Mozilla');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.loginHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ip: '127.0.0.1',
            success: true,
          }),
        }),
      );
    });

    it('존재하지 않는 사용자로 로그인 시 UnauthorizedException 발생', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('탈퇴한 계정으로 로그인 시 UnauthorizedException 발생', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('소셜 계정으로 이메일 로그인 시 BadRequestException 발생', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        provider: Provider.GOOGLE,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('잘못된 비밀번호로 로그인 시 UnauthorizedException 발생', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.login(loginDto, '127.0.0.1', 'Mozilla'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrismaService.loginHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            success: false,
          }),
        }),
      );
    });
  });

  describe('logout', () => {
    it('유효한 토큰으로 로그아웃 성공', async () => {
      const result = await service.logout('valid-refresh-token');

      expect(result).toEqual({ message: '로그아웃 되었습니다.' });
      expect(mockPrismaService.tokenBlacklist.create).toHaveBeenCalled();
    });

    it('유효하지 않은 토큰도 로그아웃 성공 메시지 반환', async () => {
      mockJwtService.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = await service.logout('invalid-token');

      expect(result).toEqual({ message: '로그아웃 되었습니다.' });
    });
  });

  describe('refreshTokens', () => {
    it('유효한 리프레시 토큰으로 새 토큰 발급', async () => {
      mockPrismaService.tokenBlacklist.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('블랙리스트에 있는 토큰으로 갱신 시 UnauthorizedException 발생', async () => {
      mockPrismaService.tokenBlacklist.findUnique.mockResolvedValue({
        token: 'blacklisted-token',
        expiresAt: new Date(),
      });

      await expect(service.refreshTokens('blacklisted-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('checkEmail', () => {
    it('사용 가능한 이메일 확인', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.checkEmail({ email: 'new@example.com' });

      expect(result.available).toBe(true);
      expect(result.message).toBe('사용 가능한 이메일입니다.');
    });

    it('이미 사용 중인 이메일 확인', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.checkEmail({ email: 'test@example.com' });

      expect(result.available).toBe(false);
      expect(result.message).toBe('이미 사용 중인 이메일입니다.');
    });
  });

  describe('sendVerification', () => {
    it('회원가입 인증 코드 발송 성공', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.emailVerification.deleteMany.mockResolvedValue({
        count: 0,
      });
      mockPrismaService.emailVerification.create.mockResolvedValue({});

      const result = await service.sendVerification({
        email: 'new@example.com',
        type: 'SIGNUP',
      });

      expect(result.message).toContain('인증 코드');
      expect(mockEmailService.sendVerificationCode).toHaveBeenCalled();
    });

    it('이미 가입된 이메일로 회원가입 인증 시 ConflictException 발생', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.sendVerification({ email: 'test@example.com', type: 'SIGNUP' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyEmail', () => {
    it('유효한 인증 코드로 인증 성공', async () => {
      mockPrismaService.emailVerification.findFirst.mockResolvedValue({
        id: 'verification-123',
        email: 'test@example.com',
        code: '123456',
        type: 'SIGNUP',
        verified: false,
        expiresAt: new Date(Date.now() + 600000),
      });

      const result = await service.verifyEmail({
        email: 'test@example.com',
        code: '123456',
        type: 'SIGNUP',
      });

      expect(result.verified).toBe(true);
      expect(mockPrismaService.emailVerification.update).toHaveBeenCalled();
    });

    it('유효하지 않은 인증 코드로 BadRequestException 발생', async () => {
      mockPrismaService.emailVerification.findFirst.mockResolvedValue(null);

      await expect(
        service.verifyEmail({
          email: 'test@example.com',
          code: 'wrong',
          type: 'SIGNUP',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('만료된 인증 코드로 BadRequestException 발생', async () => {
      mockPrismaService.emailVerification.findFirst.mockResolvedValue({
        id: 'verification-123',
        email: 'test@example.com',
        code: '123456',
        type: 'SIGNUP',
        verified: false,
        expiresAt: new Date(Date.now() - 600000), // 만료됨
      });

      await expect(
        service.verifyEmail({
          email: 'test@example.com',
          code: '123456',
          type: 'SIGNUP',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('만료된 토큰을 정리해야 함', async () => {
      mockPrismaService.tokenBlacklist.deleteMany.mockResolvedValue({
        count: 5,
      });

      await service.cleanupExpiredTokens();

      expect(mockPrismaService.tokenBlacklist.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });

  describe('cleanupExpiredVerifications', () => {
    it('만료된 인증 코드를 정리해야 함', async () => {
      mockPrismaService.emailVerification.deleteMany.mockResolvedValue({
        count: 3,
      });

      await service.cleanupExpiredVerifications();

      expect(
        mockPrismaService.emailVerification.deleteMany,
      ).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });

  describe('getMe', () => {
    it('현재 사용자 정보를 반환해야 함', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe('user-123');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      });
    });

    it('존재하지 않는 사용자로 UnauthorizedException 발생', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
