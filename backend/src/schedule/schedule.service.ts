import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  // 일정 목록 조회 (월별 필터)
  async findAll(userId: string, year?: number, month?: number) {
    const where: { userId: string; date?: { gte: Date; lt: Date } } = { userId };

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    return this.prisma.schedule.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  // 일정 상세 조회
  async findOne(userId: string, id: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, userId },
    });

    if (!schedule) {
      throw new NotFoundException('일정을 찾을 수 없습니다.');
    }

    return schedule;
  }

  // 일정 생성
  async create(userId: string, createDto: CreateScheduleDto) {
    const { title, description, date, time, isAllDay, color } = createDto;

    return this.prisma.schedule.create({
      data: {
        userId,
        title,
        description,
        date: new Date(date),
        time,
        isAllDay: isAllDay ?? false,
        color,
      },
    });
  }

  // 일정 수정
  async update(userId: string, id: string, updateDto: UpdateScheduleDto) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, userId },
    });

    if (!schedule) {
      throw new NotFoundException('일정을 찾을 수 없습니다.');
    }

    const { date, ...rest } = updateDto;

    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...rest,
        ...(date && { date: new Date(date) }),
      },
    });
  }

  // 일정 삭제
  async delete(userId: string, id: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, userId },
    });

    if (!schedule) {
      throw new NotFoundException('일정을 찾을 수 없습니다.');
    }

    await this.prisma.schedule.delete({
      where: { id },
    });

    return { message: '일정이 삭제되었습니다.' };
  }

  // 다가오는 일정 조회 (N일 이내)
  async findUpcoming(userId: string, days: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.schedule.findMany({
      where: {
        userId,
        date: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  // 특정 날짜 일정 조회
  async findByDate(userId: string, date: string) {
    const targetDate = new Date(date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    return this.prisma.schedule.findMany({
      where: {
        userId,
        date: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      orderBy: { time: 'asc' },
    });
  }
}
