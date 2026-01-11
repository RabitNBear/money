import {
  Controller,
  Get,
  Post,
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
import { WatchlistService } from './watchlist.service';
import { AddWatchlistDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Watchlist')
@Controller('watchlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: '관심종목 목록 조회' })
  @ApiResponse({ status: 200, description: '관심종목 목록' })
  async findAll(@CurrentUser() user: { id: string }) {
    return this.watchlistService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: '관심종목 추가' })
  @ApiResponse({ status: 201, description: '관심종목 추가 성공' })
  @ApiResponse({ status: 409, description: '이미 등록된 종목' })
  async add(
    @CurrentUser() user: { id: string },
    @Body() addDto: AddWatchlistDto,
  ) {
    return this.watchlistService.add(user.id, addDto);
  }

  @Delete(':ticker')
  @ApiOperation({ summary: '관심종목 삭제' })
  @ApiResponse({ status: 200, description: '관심종목 삭제 성공' })
  @ApiResponse({ status: 404, description: '종목을 찾을 수 없음' })
  async remove(
    @CurrentUser() user: { id: string },
    @Param('ticker') ticker: string,
  ) {
    return this.watchlistService.remove(user.id, ticker);
  }

  @Get(':ticker/check')
  @ApiOperation({ summary: '관심종목 여부 확인' })
  @ApiResponse({ status: 200, description: '관심종목 여부' })
  async isWatching(
    @CurrentUser() user: { id: string },
    @Param('ticker') ticker: string,
  ) {
    const isWatching = await this.watchlistService.isWatching(user.id, ticker);
    return { isWatching };
  }

  @Get('count')
  @ApiOperation({ summary: '관심종목 수 조회' })
  @ApiResponse({ status: 200, description: '관심종목 수' })
  async count(@CurrentUser() user: { id: string }) {
    const count = await this.watchlistService.count(user.id);
    return { count };
  }
}
