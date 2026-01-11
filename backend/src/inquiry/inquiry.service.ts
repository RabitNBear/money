import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto';
import { InquiryCategory as PrismaInquiryCategory } from '@prisma/client';

@Injectable()
export class InquiryService {
  constructor(private readonly prisma: PrismaService) {}

  // 내 문의 목록 조회
  async findAll(userId: string) {
    return this.prisma.inquiry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
        answeredAt: true,
      },
    });
  }

  // 문의 상세 조회
  async findOne(userId: string, id: string) {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: { id, userId },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    return inquiry;
  }

  // 문의 등록
  async create(userId: string, createDto: CreateInquiryDto) {
    const { title, content, category } = createDto;

    return this.prisma.inquiry.create({
      data: {
        userId,
        title,
        content,
        category: category as PrismaInquiryCategory,
      },
    });
  }

  // 문의 수 조회 (사용자별)
  async countByUser(userId: string) {
    const [total, pending, resolved] = await Promise.all([
      this.prisma.inquiry.count({ where: { userId } }),
      this.prisma.inquiry.count({ where: { userId, status: 'PENDING' } }),
      this.prisma.inquiry.count({ where: { userId, status: 'RESOLVED' } }),
    ]);

    return { total, pending, resolved };
  }
}
