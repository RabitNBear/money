import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Portfolio')
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: '포트폴리오 목록 조회' })
  @ApiResponse({ status: 200, description: '포트폴리오 목록' })
  async findAll(@CurrentUser() user: { id: string }) {
    return this.portfolioService.findAll(user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: '포트폴리오 요약 조회' })
  @ApiResponse({ status: 200, description: '포트폴리오 요약 정보' })
  async getSummary(@CurrentUser() user: { id: string }) {
    return this.portfolioService.getSummary(user.id);
  }

  @Post()
  @ApiOperation({ summary: '종목 추가' })
  @ApiResponse({ status: 201, description: '종목 추가 성공' })
  @ApiResponse({ status: 409, description: '이미 등록된 종목' })
  async create(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreatePortfolioDto,
  ) {
    return this.portfolioService.create(user.id, createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '종목 수정' })
  @ApiResponse({ status: 200, description: '종목 수정 성공' })
  @ApiResponse({ status: 404, description: '종목을 찾을 수 없음' })
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() updateDto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '종목 삭제' })
  @ApiResponse({ status: 200, description: '종목 삭제 성공' })
  @ApiResponse({ status: 404, description: '종목을 찾을 수 없음' })
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.portfolioService.delete(user.id, id);
  }
}
