import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsEnum } from 'class-validator';
import { VerificationType } from './send-verification.dto';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '인증할 이메일 주소',
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
    example: 'SIGNUP',
    description: '인증 타입 (SIGNUP: 회원가입, PASSWORD: 비밀번호 재설정)',
    enum: VerificationType,
  })
  @IsEnum(VerificationType, { message: '올바른 인증 타입이 아닙니다.' })
  type: VerificationType;
}
