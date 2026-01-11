import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NoticeService } from './notice.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Notice')
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '공지사항 목록 조회' })
  @ApiResponse({ status: 200, description: '공지사항 목록' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.noticeService.findAll(pageNum, limitNum);
  }

  @Get('latest')
  @Public()
  @ApiOperation({ summary: '최신 공지사항 조회' })
  @ApiResponse({ status: 200, description: '최신 공지사항 목록' })
  @ApiQuery({ name: 'count', required: false, type: Number })
  async findLatest(@Query('count') count?: string) {
    const countNum = count ? parseInt(count, 10) : 5;
    return this.noticeService.findLatest(countNum);
  }

  @Get('pinned')
  @Public()
  @ApiOperation({ summary: '고정 공지사항 조회' })
  @ApiResponse({ status: 200, description: '고정 공지사항 목록' })
  async findPinned() {
    return this.noticeService.findPinned();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '공지사항 상세 조회' })
  @ApiResponse({ status: 200, description: '공지사항 상세' })
  @ApiResponse({ status: 404, description: '공지사항을 찾을 수 없음' })
  async findOne(@Param('id') id: string) {
    return this.noticeService.findOne(id);
  }
}
