import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NoticeCategory {
  NOTICE = 'NOTICE',
  UPDATE = 'UPDATE',
  EVENT = 'EVENT',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateNoticeDto {
  @ApiProperty({ description: '공지사항 제목', example: '서비스 점검 안내' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '공지사항 내용', example: '2025년 1월 15일 02:00 ~ 06:00 서비스 점검이 진행됩니다.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @ApiProperty({ description: '공지사항 카테고리', enum: NoticeCategory, example: 'MAINTENANCE' })
  @IsEnum(NoticeCategory)
  category: NoticeCategory;

  @ApiPropertyOptional({ description: '상단 고정 여부', default: false })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @ApiPropertyOptional({ description: '공개 여부', default: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
