import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IPOService } from './ipo.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateIPODto, UpdateIPODto } from './dto';

@ApiTags('IPO')
@Controller('ipo')
export class IPOController {
  constructor(private readonly ipoService: IPOService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'IPO 등록 (관리자)' })
  @ApiResponse({ status: 201, description: 'IPO 등록 완료' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async create(@Body() createIPODto: CreateIPODto) {
    return this.ipoService.create(createIPODto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'IPO 수정 (관리자)' })
  @ApiResponse({ status: 200, description: 'IPO 수정 완료' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: 'IPO를 찾을 수 없음' })
  async update(@Param('id') id: string, @Body() updateIPODto: UpdateIPODto) {
    return this.ipoService.update(id, updateIPODto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'IPO 삭제 (관리자)' })
  @ApiResponse({ status: 200, description: 'IPO 삭제 완료' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: 'IPO를 찾을 수 없음' })
  async delete(@Param('id') id: string) {
    return this.ipoService.delete(id);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'IPO 데이터 동기화 (관리자) - 웹에서 스크래핑' })
  @ApiResponse({ status: 200, description: 'IPO 동기화 완료' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async syncIPOData() {
    return this.ipoService.syncIPOData();
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'IPO 목록 조회' })
  @ApiResponse({ status: 200, description: 'IPO 목록' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ipoService.findAll(pageNum, limitNum);
  }

  @Get('upcoming')
  @Public()
  @ApiOperation({ summary: '다가오는 IPO 조회' })
  @ApiResponse({ status: 200, description: '다가오는 IPO 목록' })
  async findUpcoming() {
    return this.ipoService.findUpcoming();
  }

  @Get('calendar')
  @Public()
  @ApiOperation({ summary: '날짜 범위로 IPO 조회 (캘린더용)' })
  @ApiResponse({ status: 200, description: 'IPO 목록' })
  @ApiQuery({ name: 'start', required: true, type: String, description: '시작일 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', required: true, type: String, description: '종료일 (YYYY-MM-DD)' })
  async findByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.ipoService.findByDateRange(start, end);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'IPO 상세 조회' })
  @ApiResponse({ status: 200, description: 'IPO 상세' })
  @ApiResponse({ status: 404, description: 'IPO를 찾을 수 없음' })
  async findOne(@Param('id') id: string) {
    return this.ipoService.findOne(id);
  }
}
