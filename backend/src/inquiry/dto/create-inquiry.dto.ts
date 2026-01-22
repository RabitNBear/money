import { IsString, IsNotEmpty, IsEnum, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InquiryCategory {
  GENERAL = '일반',
  BUG = '오류',
  FEATURE = '제안',
  ACCOUNT = '계정',
  OTHER = '기타',
}

export class CreateInquiryDto {
  @ApiProperty({ description: '문의 제목', example: '배당금 계산이 안 됩니다' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: '문의 내용',
    example: '삼성전자 종목을 추가했는데 배당금이 0원으로 표시됩니다.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @ApiProperty({
    description: '문의 카테고리',
    enum: InquiryCategory,
    example: 'BUG',
  })
  @IsEnum(InquiryCategory)
  category: InquiryCategory;

  @ApiProperty({
    description: '비공개 여부',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
