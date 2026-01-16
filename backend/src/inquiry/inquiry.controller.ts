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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto, AnswerInquiryDto } from './dto';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/guards';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Inquiry')
@Controller('inquiry')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  // ==================== 공개 API ====================

  @Get('public')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: '공개 문의 목록 조회' })
  @ApiResponse({ status: 200, description: '문의 목록' })
  async findPublic(@Req() req: Request) {
    const user = req.user as { id: string } | undefined;
    return this.inquiryService.findPublic(user?.id);
  }

  // ==================== 로그인 필요 API ====================

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '내 문의 목록 조회' })
  @ApiResponse({ status: 200, description: '문의 목록' })
  async findAll(@CurrentUser() user: { id: string }) {
    return this.inquiryService.findAll(user.id);
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '내 문의 수 조회' })
  @ApiResponse({ status: 200, description: '문의 수' })
  async count(@CurrentUser() user: { id: string }) {
    return this.inquiryService.countByUser(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '문의 상세 조회' })
  @ApiResponse({ status: 200, description: '문의 상세' })
  @ApiResponse({ status: 404, description: '문의를 찾을 수 없음' })
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.inquiryService.findOne(user.id, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '문의 등록' })
  @ApiResponse({ status: 201, description: '문의 등록 성공' })
  async create(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateInquiryDto,
  ) {
    return this.inquiryService.create(user.id, createDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '문의 삭제' })
  @ApiResponse({ status: 200, description: '문의 삭제 성공' })
  @ApiResponse({ status: 404, description: '문의를 찾을 수 없음' })
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.inquiryService.delete(user.id, id);
  }

  // ==================== 관리자 전용 API ====================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '모든 문의 목록 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '문의 목록' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'PENDING, IN_PROGRESS, RESOLVED',
  })
  async findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.inquiryService.findAllAdmin(pageNum, limitNum, status);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '문의 상세 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '문의 상세' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '문의를 찾을 수 없음' })
  async findOneAdmin(@Param('id') id: string) {
    return this.inquiryService.findOneAdmin(id);
  }

  @Patch(':id/answer')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '문의 답변 (관리자)' })
  @ApiResponse({ status: 200, description: '답변 등록 완료' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '문의를 찾을 수 없음' })
  async answer(
    @Param('id') id: string,
    @Body() answerDto: AnswerInquiryDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.inquiryService.answer(id, answerDto.answer, admin.id);
  }
}
