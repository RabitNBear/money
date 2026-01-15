import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ description: '일정 제목', example: '삼성전자 배당금 입금일' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: '일정 설명',
    example: '예상 배당금: 361원 x 100주',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: '일정 날짜', example: '2025-04-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: '일정 시간 (HH:mm)', example: '14:00' })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: '시간은 HH:mm 형식이어야 합니다.',
  })
  time?: string;

  @ApiPropertyOptional({ description: '종일 일정 여부', default: false })
  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @ApiPropertyOptional({ description: '일정 색상', example: '#FF5733' })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: '색상은 #RRGGBB 형식이어야 합니다.',
  })
  color?: string;
}
