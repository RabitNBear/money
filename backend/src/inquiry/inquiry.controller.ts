import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Inquiry')
@Controller('inquiry')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Get()
  @ApiOperation({ summary: '내 문의 목록 조회' })
  @ApiResponse({ status: 200, description: '문의 목록' })
  async findAll(@CurrentUser() user: { id: string }) {
    return this.inquiryService.findAll(user.id);
  }

  @Get('count')
  @ApiOperation({ summary: '내 문의 수 조회' })
  @ApiResponse({ status: 200, description: '문의 수' })
  async count(@CurrentUser() user: { id: string }) {
    return this.inquiryService.countByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '문의 상세 조회' })
  @ApiResponse({ status: 200, description: '문의 상세' })
  @ApiResponse({ status: 404, description: '문의를 찾을 수 없음' })
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.inquiryService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: '문의 등록' })
  @ApiResponse({ status: 201, description: '문의 등록 성공' })
  async create(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateInquiryDto,
  ) {
    return this.inquiryService.create(user.id, createDto);
  }
}
