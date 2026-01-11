import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  // 포트폴리오 목록 조회
  async findAll(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 포트폴리오 요약 (총 평가액 등)
  async getSummary(userId: string) {
    const portfolios = await this.prisma.portfolio.findMany({
      where: { userId },
    });

    const totalInvestment = portfolios.reduce(
      (sum, p) => sum + p.avgPrice * p.quantity,
      0,
    );

    const stockCount = portfolios.length;
    const totalQuantity = portfolios.reduce((sum, p) => sum + p.quantity, 0);

    return {
      stockCount,
      totalQuantity,
      totalInvestment,
      portfolios,
    };
  }

  // 종목 추가
  async create(userId: string, createDto: CreatePortfolioDto) {
    // 이미 등록된 종목인지 확인
    const existing = await this.prisma.portfolio.findUnique({
      where: {
        userId_ticker: {
          userId,
          ticker: createDto.ticker,
        },
      },
    });

    if (existing) {
      throw new ConflictException('이미 포트폴리오에 등록된 종목입니다.');
    }

    return this.prisma.portfolio.create({
      data: {
        userId,
        ...createDto,
      },
    });
  }

  // 종목 수정
  async update(userId: string, id: string, updateDto: UpdatePortfolioDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio) {
      throw new NotFoundException('포트폴리오를 찾을 수 없습니다.');
    }

    if (portfolio.userId !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return this.prisma.portfolio.update({
      where: { id },
      data: updateDto,
    });
  }

  // 종목 삭제
  async delete(userId: string, id: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio) {
      throw new NotFoundException('포트폴리오를 찾을 수 없습니다.');
    }

    if (portfolio.userId !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    await this.prisma.portfolio.delete({
      where: { id },
    });

    return { message: '포트폴리오에서 삭제되었습니다.' };
  }
}
