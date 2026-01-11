import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { Market, Currency } from '@prisma/client';

export class CreatePortfolioDto {
  @ApiProperty({ example: 'AAPL', description: '종목 티커' })
  @IsString()
  ticker: string;

  @ApiProperty({ example: '애플', description: '종목명' })
  @IsString()
  name: string;

  @ApiProperty({ enum: Market, example: 'US', description: '시장 (US/KR)' })
  @IsEnum(Market)
  market: Market;

  @ApiProperty({ example: 10, description: '보유 수량' })
  @IsNumber()
  @Min(1, { message: '수량은 1 이상이어야 합니다.' })
  quantity: number;

  @ApiProperty({ example: 150000, description: '평균 매입가 (원화)' })
  @IsNumber()
  @Min(0)
  avgPrice: number;

  @ApiProperty({ enum: Currency, example: 'KRW', description: '통화', required: false })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({ example: '장기 투자 목적', description: '메모', required: false })
  @IsOptional()
  @IsString()
  memo?: string;
}
