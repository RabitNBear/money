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
