import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';

export enum VerificationType {
  SIGNUP = 'SIGNUP',
  PASSWORD = 'PASSWORD',
}

export class SendVerificationDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '인증 코드를 받을 이메일 주소',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    example: 'SIGNUP',
    description: '인증 타입 (SIGNUP: 회원가입, PASSWORD: 비밀번호 재설정)',
    enum: VerificationType,
  })
  @IsEnum(VerificationType, { message: '올바른 인증 타입이 아닙니다.' })
  type: VerificationType;
}
