import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IPOStatus {
  UPCOMING = 'UPCOMING',
  SUBSCRIPTION = 'SUBSCRIPTION',
  COMPLETED = 'COMPLETED',
  LISTED = 'LISTED',
}

export class CreateIPODto {
  @ApiProperty({ description: '기업명', example: '삼성전자' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiPropertyOptional({ description: '종목코드 (상장 후)', example: '005930' })
  @IsString()
  @IsOptional()
  ticker?: string;

  @ApiPropertyOptional({
    description: '수요예측 시작일',
    example: '2025-01-20',
  })
  @IsDateString()
  @IsOptional()
  demandForecastStart?: string;

  @ApiPropertyOptional({
    description: '수요예측 종료일',
    example: '2025-01-21',
  })
  @IsDateString()
  @IsOptional()
  demandForecastEnd?: string;

  @ApiPropertyOptional({ description: '청약 시작일', example: '2025-01-27' })
  @IsDateString()
  @IsOptional()
  subscriptionStart?: string;

  @ApiPropertyOptional({ description: '청약 종료일', example: '2025-01-28' })
  @IsDateString()
  @IsOptional()
  subscriptionEnd?: string;

  @ApiPropertyOptional({ description: '환불일', example: '2025-01-30' })
  @IsDateString()
  @IsOptional()
  refundDate?: string;

  @ApiPropertyOptional({ description: '상장일', example: '2025-02-05' })
  @IsDateString()
  @IsOptional()
  listingDate?: string;

  @ApiPropertyOptional({ description: '공모가 밴드 하단', example: 30000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  priceRangeLow?: number;

  @ApiPropertyOptional({ description: '공모가 밴드 상단', example: 35000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  priceRangeHigh?: number;

  @ApiPropertyOptional({ description: '확정 공모가', example: 33000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  finalPrice?: number;

  @ApiPropertyOptional({ description: '공모 주식수', example: 1000000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalShares?: number;

  @ApiPropertyOptional({ description: '대표 주간사', example: '한국투자증권' })
  @IsString()
  @IsOptional()
  leadUnderwriter?: string;

  @ApiPropertyOptional({
    enum: IPOStatus,
    description: '상태',
    default: 'UPCOMING',
  })
  @IsEnum(IPOStatus)
  @IsOptional()
  status?: IPOStatus;
}
