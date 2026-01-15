import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePortfolioDto {
  @ApiProperty({ example: 15, description: '보유 수량', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '수량은 1 이상이어야 합니다.' })
  quantity?: number;

  @ApiProperty({ example: 160000, description: '평균 매입가', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  avgPrice?: number;

  @ApiProperty({
    example: '추가 매수 완료',
    description: '메모',
    required: false,
  })
  @IsOptional()
  @IsString()
  memo?: string;
}
