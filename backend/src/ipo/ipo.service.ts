import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIPODto, UpdateIPODto } from './dto';
import { scrape38Communication, scrapeDart, ScrapedIPO } from './ipo.scraper';

@Injectable()
export class IPOService {
  private readonly logger = new Logger(IPOService.name);

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
    // 날짜 유효성 검사
    if (!start || !end) {
      return [];
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Invalid Date 체크
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return [];
    }

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

  // 매일 자정 IPO 데이터 자동 동기화
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('IPO 데이터 자동 동기화 시작...');
    await this.syncIPOData();
  }

  // IPO 데이터 동기화 (스크래핑)
  async syncIPOData(): Promise<{
    message: string;
    added: number;
    updated: number;
    errors: string[];
  }> {
    this.logger.log('IPO 데이터 동기화 시작...');

    const errors: string[] = [];
    let added = 0;
    let updated = 0;

    try {
      // 38커뮤니케이션에서 스크래핑
      const scraped38 = await scrape38Communication();
      this.logger.log(`38커뮤니케이션에서 ${scraped38.length}개 IPO 수집`);

      // DART에서 스크래핑
      const scrapedDart = await scrapeDart();
      this.logger.log(`DART에서 ${scrapedDart.length}개 IPO 수집`);

      // 중복 제거 (기업명 기준)
      const allScraped = this.mergeIPOData(scraped38, scrapedDart);
      this.logger.log(`중복 제거 후 총 ${allScraped.length}개 IPO`);

      // DB에 upsert
      for (const ipo of allScraped) {
        try {
          const existing = await this.prisma.iPO.findFirst({
            where: { companyName: ipo.companyName },
          });

          if (existing) {
            // 업데이트
            await this.prisma.iPO.update({
              where: { id: existing.id },
              data: {
                subscriptionStart: ipo.subscriptionStart,
                subscriptionEnd: ipo.subscriptionEnd,
                listingDate: ipo.listingDate,
                priceRangeLow: ipo.priceRangeLow,
                priceRangeHigh: ipo.priceRangeHigh,
                finalPrice: ipo.finalPrice,
                leadUnderwriter: ipo.leadUnderwriter,
                status: ipo.status,
              },
            });
            updated++;
          } else {
            // 새로 추가
            await this.prisma.iPO.create({
              data: {
                companyName: ipo.companyName,
                subscriptionStart: ipo.subscriptionStart,
                subscriptionEnd: ipo.subscriptionEnd,
                listingDate: ipo.listingDate,
                priceRangeLow: ipo.priceRangeLow,
                priceRangeHigh: ipo.priceRangeHigh,
                finalPrice: ipo.finalPrice,
                leadUnderwriter: ipo.leadUnderwriter,
                status: ipo.status,
              },
            });
            added++;
          }
        } catch (error) {
          const errorMsg = `${ipo.companyName} 처리 실패: ${error.message}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      this.logger.log(
        `IPO 동기화 완료: ${added}개 추가, ${updated}개 업데이트`,
      );
    } catch (error) {
      const errorMsg = `IPO 동기화 실패: ${error.message}`;
      this.logger.error(errorMsg);
      errors.push(errorMsg);
    }

    return {
      message: `IPO 데이터 동기화 완료`,
      added,
      updated,
      errors,
    };
  }

  // 두 소스의 IPO 데이터 병합 (38커뮤니케이션 우선)
  private mergeIPOData(
    primary: ScrapedIPO[],
    secondary: ScrapedIPO[],
  ): ScrapedIPO[] {
    const merged = new Map<string, ScrapedIPO>();

    // primary 데이터 먼저 추가
    for (const ipo of primary) {
      merged.set(ipo.companyName, ipo);
    }

    // secondary 데이터 추가 (중복 아닌 것만)
    for (const ipo of secondary) {
      if (!merged.has(ipo.companyName)) {
        merged.set(ipo.companyName, ipo);
      }
    }

    return Array.from(merged.values());
  }
}
