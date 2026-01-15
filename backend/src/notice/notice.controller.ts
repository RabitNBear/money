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
import { NoticeService } from './notice.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateNoticeDto, UpdateNoticeDto } from './dto';

@ApiTags('Notice')
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지사항 작성 (관리자)' })
  @ApiResponse({ status: 201, description: '공지사항 생성 완료' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async create(
    @Body() createNoticeDto: CreateNoticeDto,
    @CurrentUser() user: any,
  ) {
    return this.noticeService.create(createNoticeDto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지사항 수정 (관리자)' })
  @ApiResponse({ status: 200, description: '공지사항 수정 완료' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '공지사항을 찾을 수 없음' })
  async update(
    @Param('id') id: string,
    @Body() updateNoticeDto: UpdateNoticeDto,
  ) {
    return this.noticeService.update(id, updateNoticeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지사항 삭제 (관리자)' })
  @ApiResponse({ status: 200, description: '공지사항 삭제 완료' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '공지사항을 찾을 수 없음' })
  async delete(@Param('id') id: string) {
    return this.noticeService.delete(id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '공지사항 목록 조회' })
  @ApiResponse({ status: 200, description: '공지사항 목록' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
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
