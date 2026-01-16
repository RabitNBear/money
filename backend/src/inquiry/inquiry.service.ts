import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto, UpdateInquiryDto } from './dto';
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
        answer: true,
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
    const { title, content, category, isPrivate } = createDto;

    return this.prisma.inquiry.create({
      data: {
        userId,
        title,
        content,
        category: category as PrismaInquiryCategory,
        isPrivate: isPrivate ?? false,
      },
    });
  }

  // 문의 수정
  async update(userId: string, id: string, updateDto: UpdateInquiryDto) {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: { id, userId },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    // 이미 답변이 달린 문의는 수정 불가
    if (inquiry.status === 'RESOLVED') {
      throw new ForbiddenException('답변이 완료된 문의는 수정할 수 없습니다.');
    }

    const data: any = {};
    if (updateDto.title !== undefined) data.title = updateDto.title;
    if (updateDto.content !== undefined) data.content = updateDto.content;
    if (updateDto.category !== undefined) data.category = updateDto.category as PrismaInquiryCategory;
    if (updateDto.isPrivate !== undefined) data.isPrivate = updateDto.isPrivate;

    return this.prisma.inquiry.update({
      where: { id },
      data,
    });
  }

  // 문의 삭제
  async delete(userId: string, id: string) {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: { id, userId },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    await this.prisma.inquiry.delete({
      where: { id },
    });

    return { message: '문의가 삭제되었습니다.' };
  }

  // 공개 문의 목록 조회 (전체)
  async findPublic(currentUserId?: string) {
    const inquiries = await this.prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        status: true,
        answer: true,
        createdAt: true,
        answeredAt: true,
        isPrivate: true,
        userId: true,
      },
    });

    // 비공개 문의이고 작성자가 아닌 경우 내용 숨김
    return inquiries.map((inquiry) => {
      if (inquiry.isPrivate && inquiry.userId !== currentUserId) {
        return {
          ...inquiry,
          content: null,
          answer: null,
        };
      }
      return inquiry;
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
