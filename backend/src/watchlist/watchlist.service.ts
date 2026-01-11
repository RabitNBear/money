import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddWatchlistDto } from './dto';
import { Market } from '@prisma/client';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  // 관심종목 목록 조회
  async findAll(userId: string) {
    return this.prisma.watchlist.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });
  }

  // 관심종목 추가
  async add(userId: string, addDto: AddWatchlistDto) {
    const { ticker, name, market } = addDto;

    // 중복 확인
    const existing = await this.prisma.watchlist.findUnique({
      where: {
        userId_ticker: { userId, ticker },
      },
    });

    if (existing) {
      throw new ConflictException('이미 관심종목에 등록된 종목입니다.');
    }

    return this.prisma.watchlist.create({
      data: {
        userId,
        ticker,
        name,
        market: market as Market,
      },
    });
  }

  // 관심종목 삭제
  async remove(userId: string, ticker: string) {
    const watchlist = await this.prisma.watchlist.findUnique({
      where: {
        userId_ticker: { userId, ticker },
      },
    });

    if (!watchlist) {
      throw new NotFoundException('관심종목을 찾을 수 없습니다.');
    }

    await this.prisma.watchlist.delete({
      where: {
        userId_ticker: { userId, ticker },
      },
    });

    return { message: '관심종목에서 삭제되었습니다.' };
  }

  // 관심종목 여부 확인
  async isWatching(userId: string, ticker: string): Promise<boolean> {
    const watchlist = await this.prisma.watchlist.findUnique({
      where: {
        userId_ticker: { userId, ticker },
      },
    });

    return !!watchlist;
  }

  // 관심종목 수 조회
  async count(userId: string): Promise<number> {
    return this.prisma.watchlist.count({
      where: { userId },
    });
  }
}
