import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIPODto, UpdateIPODto } from './dto';

@Injectable()
export class IPOService {
  constructor(private readonly prisma: PrismaService) {}

  // IPO 생성 (관리자)
  async create(createIPODto: CreateIPODto) {
    return this.prisma.iPO.create({
      data: {
        companyName: createIPODto.companyName,
        ticker: createIPODto.ticker,
        demandForecastStart: createIPODto.demandForecastStart
          ? new Date(createIPODto.demandForecastStart)
          : null,
        demandForecastEnd: createIPODto.demandForecastEnd
          ? new Date(createIPODto.demandForecastEnd)
          : null,
        subscriptionStart: createIPODto.subscriptionStart
          ? new Date(createIPODto.subscriptionStart)
          : null,
        subscriptionEnd: createIPODto.subscriptionEnd
          ? new Date(createIPODto.subscriptionEnd)
          : null,
        refundDate: createIPODto.refundDate
          ? new Date(createIPODto.refundDate)
          : null,
        listingDate: createIPODto.listingDate
          ? new Date(createIPODto.listingDate)
          : null,
        priceRangeLow: createIPODto.priceRangeLow,
        priceRangeHigh: createIPODto.priceRangeHigh,
        finalPrice: createIPODto.finalPrice,
        totalShares: createIPODto.totalShares,
        leadUnderwriter: createIPODto.leadUnderwriter,
        status: (createIPODto.status as any) || 'UPCOMING',
      },
    });
  }

  // IPO 수정 (관리자)
  async update(id: string, updateIPODto: UpdateIPODto) {
    const ipo = await this.prisma.iPO.findUnique({
      where: { id },
    });

    if (!ipo) {
      throw new NotFoundException('IPO 정보를 찾을 수 없습니다.');
    }

    const data: any = {};

    if (updateIPODto.companyName) data.companyName = updateIPODto.companyName;
    if (updateIPODto.ticker !== undefined) data.ticker = updateIPODto.ticker;
    if (updateIPODto.demandForecastStart !== undefined)
      data.demandForecastStart = updateIPODto.demandForecastStart
        ? new Date(updateIPODto.demandForecastStart)
        : null;
    if (updateIPODto.demandForecastEnd !== undefined)
      data.demandForecastEnd = updateIPODto.demandForecastEnd
        ? new Date(updateIPODto.demandForecastEnd)
        : null;
    if (updateIPODto.subscriptionStart !== undefined)
      data.subscriptionStart = updateIPODto.subscriptionStart
        ? new Date(updateIPODto.subscriptionStart)
        : null;
    if (updateIPODto.subscriptionEnd !== undefined)
      data.subscriptionEnd = updateIPODto.subscriptionEnd
        ? new Date(updateIPODto.subscriptionEnd)
        : null;
    if (updateIPODto.refundDate !== undefined)
      data.refundDate = updateIPODto.refundDate
        ? new Date(updateIPODto.refundDate)
        : null;
    if (updateIPODto.listingDate !== undefined)
      data.listingDate = updateIPODto.listingDate
        ? new Date(updateIPODto.listingDate)
        : null;
    if (updateIPODto.priceRangeLow !== undefined)
      data.priceRangeLow = updateIPODto.priceRangeLow;
    if (updateIPODto.priceRangeHigh !== undefined)
      data.priceRangeHigh = updateIPODto.priceRangeHigh;
    if (updateIPODto.finalPrice !== undefined)
      data.finalPrice = updateIPODto.finalPrice;
    if (updateIPODto.totalShares !== undefined)
      data.totalShares = updateIPODto.totalShares;
    if (updateIPODto.leadUnderwriter !== undefined)
      data.leadUnderwriter = updateIPODto.leadUnderwriter;
    if (updateIPODto.status) data.status = updateIPODto.status;

    return this.prisma.iPO.update({
      where: { id },
      data,
    });
  }

  // IPO 삭제 (관리자)
  async delete(id: string) {
    const ipo = await this.prisma.iPO.findUnique({
      where: { id },
    });

    if (!ipo) {
      throw new NotFoundException('IPO 정보를 찾을 수 없습니다.');
    }

    await this.prisma.iPO.delete({
      where: { id },
    });

    return { message: 'IPO 정보가 삭제되었습니다.' };
  }

  // IPO 목록 조회
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [ipos, total] = await Promise.all([
      this.prisma.iPO.findMany({
        orderBy: [{ subscriptionStart: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.iPO.count(),
    ]);

    return {
      ipos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 다가오는 IPO 조회
  async findUpcoming() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.iPO.findMany({
      where: {
        OR: [
          { status: 'UPCOMING' },
          { status: 'SUBSCRIPTION' },
          {
            subscriptionStart: { gte: today },
          },
          {
            listingDate: { gte: today },
          },
        ],
      },
      orderBy: { subscriptionStart: 'asc' },
      take: 20,
    });
  }

  // IPO 상세 조회
  async findOne(id: string) {
    const ipo = await this.prisma.iPO.findUnique({
      where: { id },
    });

    if (!ipo) {
      throw new NotFoundException('IPO 정보를 찾을 수 없습니다.');
    }

    return ipo;
  }

  // 날짜 범위로 IPO 조회 (캘린더용)
  async findByDateRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return this.prisma.iPO.findMany({
      where: {
        OR: [
          {
            subscriptionStart: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            subscriptionEnd: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            listingDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      orderBy: { subscriptionStart: 'asc' },
    });
  }
}
