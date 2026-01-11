import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

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
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
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
