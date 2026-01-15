import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerInquiryDto {
  @ApiProperty({
    description: '답변 내용',
    example: '문의해 주신 내용에 대해 답변드립니다...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  answer: string;
}
