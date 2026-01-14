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

  // 모든 문의 목록 조회 (관리자용)
  async findAllAdmin(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [inquiries, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return {
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 문의 상세 조회 (관리자용 - userId 체크 없음)
  async findOneAdmin(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    return inquiry;
  }

  // 문의 답변 (관리자)
  async answer(id: string, answer: string, adminId: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    return this.prisma.inquiry.update({
      where: { id },
      data: {
        answer,
        answeredAt: new Date(),
        answeredBy: adminId,
        status: 'RESOLVED',
      },
    });
  }
}
