import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  // 공지사항 목록 조회 (공개된 것만)
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      this.prisma.notice.findMany({
        where: { isPublished: true },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          isPinned: true,
          createdAt: true,
        },
      }),
      this.prisma.notice.count({
        where: { isPublished: true },
      }),
    ]);

    return {
      notices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 공지사항 상세 조회
  async findOne(id: string) {
    const notice = await this.prisma.notice.findFirst({
      where: { id, isPublished: true },
    });

    if (!notice) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    return notice;
  }

  // 최신 공지사항 조회 (메인 페이지용)
  async findLatest(count: number = 5) {
    return this.prisma.notice.findMany({
      where: { isPublished: true },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: count,
      select: {
        id: true,
        title: true,
        category: true,
        isPinned: true,
        createdAt: true,
      },
    });
  }

  // 고정 공지사항 조회
  async findPinned() {
    return this.prisma.notice.findMany({
      where: {
        isPublished: true,
        isPinned: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
      },
    });
  }
}
