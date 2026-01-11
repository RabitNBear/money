import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum Market {
  US = 'US',
  KR = 'KR',
}

export class AddWatchlistDto {
  @ApiProperty({ description: '종목 티커', example: 'AAPL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  ticker: string;

  @ApiProperty({ description: '종목 이름', example: 'Apple Inc.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '시장 구분', enum: Market, example: 'US' })
  @IsEnum(Market)
  market: Market;
}
