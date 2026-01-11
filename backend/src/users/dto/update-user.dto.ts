import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '이름은 50자를 초과할 수 없습니다.' })
  name?: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: '프로필 이미지 URL',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: '올바른 URL 형식이 아닙니다.' })
  profileImage?: string;
}
