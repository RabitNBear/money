import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto';

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  // 공지사항 생성 (관리자)
  async create(createNoticeDto: CreateNoticeDto, authorId: string) {
    return this.prisma.notice.create({
      data: {
        title: createNoticeDto.title,
        content: createNoticeDto.content,
        category: createNoticeDto.category as any,
        isPinned: createNoticeDto.isPinned ?? false,
        isPublished: createNoticeDto.isPublished ?? true,
        authorId,
      },
    });
  }

  // 공지사항 수정 (관리자)
  async update(id: string, updateNoticeDto: UpdateNoticeDto) {
    const notice = await this.prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    return this.prisma.notice.update({
      where: { id },
      data: {
        ...(updateNoticeDto.title && { title: updateNoticeDto.title }),
        ...(updateNoticeDto.content && { content: updateNoticeDto.content }),
        ...(updateNoticeDto.category && { category: updateNoticeDto.category as any }),
        ...(updateNoticeDto.isPinned !== undefined && { isPinned: updateNoticeDto.isPinned }),
        ...(updateNoticeDto.isPublished !== undefined && { isPublished: updateNoticeDto.isPublished }),
      },
    });
  }

  // 공지사항 삭제 (관리자)
  async delete(id: string) {
    const notice = await this.prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    await this.prisma.notice.delete({
      where: { id },
    });

    return { message: '공지사항이 삭제되었습니다.' };
  }

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
