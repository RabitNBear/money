import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('RESEND_API_KEY');

    console.log(`[EmailService] Resend API Key: ${apiKey ? '있음' : '없음'}`);

    if (apiKey) {
      this.resend = new Resend(apiKey);
      console.log('[EmailService] Resend 클라이언트 생성 완료');
    } else {
      console.log('[EmailService] Resend API Key가 없어서 개발 모드로 동작');
    }
  }

  async sendVerificationCode(
    email: string,
    code: string,
    type: 'SIGNUP' | 'PASSWORD',
  ): Promise<boolean> {
    console.log(`[EmailService] sendVerificationCode 호출 - email: ${email}, type: ${type}`);
    console.log(`[EmailService] Resend 클라이언트 존재 여부: ${!!this.resend}`);

    // Resend 클라이언트가 없으면 콘솔에만 출력 (개발 환경)
    if (!this.resend) {
      console.log(`[DEV] 인증 코드: ${code} (이메일: ${email}, 타입: ${type})`);
      return false;
    }

    const subject =
      type === 'SIGNUP'
        ? '[껄무새] 회원가입 인증 코드'
        : '[껄무새] 비밀번호 재설정 인증 코드';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin: 0 0 8px 0; font-size: 24px;">껄무새</h1>
            <p style="color: #666; margin: 0 0 32px 0; font-size: 14px;">
              ${type === 'SIGNUP' ? '회원가입을 환영합니다!' : '비밀번호 재설정 요청'}
            </p>

            <p style="color: #333; margin: 0 0 16px 0; font-size: 16px;">
              아래 인증 코드를 입력해주세요:
            </p>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white;">
                ${code}
              </span>
            </div>

            <p style="color: #888; font-size: 14px; margin: 24px 0 0 0;">
              ⏰ 이 코드는 <strong>10분 후</strong> 만료됩니다.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

            <p style="color: #999; font-size: 12px; margin: 0;">
              본 메일은 발신 전용이며, 문의사항은 껄무새 앱 내 고객센터를 이용해주세요.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const { error } = await this.resend.emails.send({
        from: '껄무새 <noreply@ggurlms.com>',
        to: email,
        subject,
        html,
      });

      if (error) {
        console.error('이메일 발송 실패:', error);
        console.log(`[BACKUP] 인증 코드: ${code} (이메일: ${email})`);
        return false;
      }

      console.log(`이메일 발송 성공: ${email}`);
      return true;
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      console.log(`[BACKUP] 인증 코드: ${code} (이메일: ${email})`);
      return false;
    }
  }
}
