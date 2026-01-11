import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Schedule')
@Controller('schedule')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: '일정 목록 조회' })
  @ApiResponse({ status: 200, description: '일정 목록' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    const monthNum = month ? parseInt(month, 10) : undefined;
    return this.scheduleService.findAll(user.id, yearNum, monthNum);
  }

  @Get('upcoming')
  @ApiOperation({ summary: '다가오는 일정 조회' })
  @ApiResponse({ status: 200, description: '다가오는 일정 목록' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: '일수 (기본: 7)' })
  async findUpcoming(
    @CurrentUser() user: { id: string },
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.scheduleService.findUpcoming(user.id, daysNum);
  }

  @Get('date/:date')
  @ApiOperation({ summary: '특정 날짜 일정 조회' })
  @ApiResponse({ status: 200, description: '해당 날짜 일정 목록' })
  async findByDate(
    @CurrentUser() user: { id: string },
    @Param('date') date: string,
  ) {
    return this.scheduleService.findByDate(user.id, date);
  }

  @Get(':id')
  @ApiOperation({ summary: '일정 상세 조회' })
  @ApiResponse({ status: 200, description: '일정 상세 정보' })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없음' })
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.scheduleService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: '일정 추가' })
  @ApiResponse({ status: 201, description: '일정 추가 성공' })
  async create(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateScheduleDto,
  ) {
    return this.scheduleService.create(user.id, createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '일정 수정' })
  @ApiResponse({ status: 200, description: '일정 수정 성공' })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없음' })
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() updateDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '일정 삭제' })
  @ApiResponse({ status: 200, description: '일정 삭제 성공' })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없음' })
  async delete(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.scheduleService.delete(user.id, id);
  }
}
