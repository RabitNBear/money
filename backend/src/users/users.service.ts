import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import { Provider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // 프로필 조회
  async getProfile(userId: string) {
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
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  // 프로필 수정
  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        provider: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // 비밀번호 변경
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 소셜 로그인 계정은 비밀번호 변경 불가
    if (user.provider !== Provider.LOCAL) {
      throw new BadRequestException(
        '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.',
      );
    }

    if (!user.password) {
      throw new BadRequestException('비밀번호가 설정되지 않은 계정입니다.');
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    }

    // 새 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 비밀번호 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // 보안 로그 기록
    await this.prisma.securityLog.create({
      data: {
        action: 'PASSWORD_CHANGE',
        userId,
        ip: '0.0.0.0',
        userAgent: 'Unknown',
        details: '비밀번호 변경 완료',
      },
    });

    return { message: '비밀번호가 변경되었습니다.' };
  }

  // 한국 시간(KST) 기준 날짜 문자열 반환
  private getKSTDateString(date: Date): string {
    const kstOffset = 9 * 60 * 60 * 1000; // UTC+9
    const kstDate = new Date(date.getTime() + kstOffset);
    return kstDate.toISOString().split('T')[0];
  }

  // 한국 시간 기준 오늘 자정 반환
  private getKSTStartOfDay(date: Date = new Date()): Date {
    const kstOffset = 9 * 60; // UTC+9 in minutes
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset() + kstOffset);
    localDate.setHours(0, 0, 0, 0);
    // UTC로 변환해서 반환
    return new Date(localDate.getTime() - kstOffset * 60 * 1000);
  }

  // 회원 통계 (관리자용)
  async getStats() {
    try {
      // 전체 사용자 수 (탈퇴하지 않은)
      const totalUsers = await this.prisma.user.count({
        where: {
          deletedAt: null,
        },
      });

      console.log('[getStats] totalUsers:', totalUsers);

      // 최근 30일간 일별 가입자 수 (KST 기준)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentUsers = await this.prisma.user.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      // 일별로 그룹핑 (KST 기준)
      const dailySignups: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
        const dateStr = this.getKSTDateString(date);
        dailySignups[dateStr] = 0;
      }

      recentUsers.forEach((user) => {
        const dateStr = this.getKSTDateString(user.createdAt);
        if (dailySignups[dateStr] !== undefined) {
          dailySignups[dateStr]++;
        }
      });

      // 오늘/이번주/이번달 가입자 수 (KST 기준)
      const todayStart = this.getKSTStartOfDay();

      const weekStart = this.getKSTStartOfDay();
      const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const dayOfWeek = kstNow.getUTCDay(); // 0=일요일
      weekStart.setTime(weekStart.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);

      const monthStart = this.getKSTStartOfDay();
      const kstDay = new Date(now.getTime() + 9 * 60 * 60 * 1000).getUTCDate();
      monthStart.setTime(monthStart.getTime() - (kstDay - 1) * 24 * 60 * 60 * 1000);

      const [todayCount, weekCount, monthCount] = await Promise.all([
        this.prisma.user.count({
          where: { createdAt: { gte: todayStart }, deletedAt: null },
        }),
        this.prisma.user.count({
          where: { createdAt: { gte: weekStart }, deletedAt: null },
        }),
        this.prisma.user.count({
          where: { createdAt: { gte: monthStart }, deletedAt: null },
        }),
      ]);

      // Provider별 통계
      const providerStats = await this.prisma.user.groupBy({
        by: ['provider'],
        where: { deletedAt: null },
        _count: { provider: true },
      });

      return {
        totalUsers,
        todaySignups: todayCount,
        weekSignups: weekCount,
        monthSignups: monthCount,
        dailySignups: Object.entries(dailySignups).map(([date, count]) => ({
          date,
          count,
        })),
        providerStats: providerStats.map((p) => ({
          provider: p.provider,
          count: p._count.provider,
        })),
      };
    } catch (error) {
      console.error('[getStats] Error:', error);
      throw error;
    }
  }

  // 회원 탈퇴
  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // Soft delete - 개인정보 익명화
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.local`,
        password: null,
        name: null,
        profileImage: null,
        deletedAt: new Date(),
      },
    });

    // 관련 데이터 삭제
    await this.prisma.$transaction([
      this.prisma.portfolio.deleteMany({ where: { userId } }),
      this.prisma.watchlist.deleteMany({ where: { userId } }),
      this.prisma.schedule.deleteMany({ where: { userId } }),
    ]);

    // 보안 로그 기록
    await this.prisma.securityLog.create({
      data: {
        action: 'ACCOUNT_DELETE',
        userId,
        ip: '0.0.0.0',
        userAgent: 'Unknown',
        details: '회원 탈퇴 처리됨',
      },
    });

    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
