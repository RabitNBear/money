import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '비밀번호를 재설정할 이메일 주소',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '이메일 주소',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: '6자리 인증 코드',
  })
  @IsString()
  @Length(6, 6, { message: '인증 코드는 6자리입니다.' })
  code: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: '새 비밀번호 (8자 이상, 대소문자/숫자/특수문자 포함)',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(100, { message: '비밀번호는 100자를 초과할 수 없습니다.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.',
    },
  )
  newPassword: string;
}
