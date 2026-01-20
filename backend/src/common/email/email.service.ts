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

<body style="margin: 0; padding: 0; background-color: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa;">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                <div
                    style="max-width: 600px; background: #ffffff; border: 1px solid #f0f0f0; border-radius: 32px; padding: 50px; text-align: left; font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;">

                    <h1
                        style="color: #000000; margin: 0 0 10px 0; font-size: 22px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase;">
                        GGURLMOOSAE
                    </h1>

                    <p
                        style="color: #000000; margin: 0 0 40px 0; font-size: 15px; font-weight: 700; letter-spacing: -0.02em;">
                        ${type === 'SIGNUP' ? '회원가입을 환영합니다.' : '비밀번호 재설정을 위한 인증 코드입니다.'}
                    </p>

                    <div style="height: 1px; background-color: #000000; margin-bottom: 40px; opacity: 0.1;"></div>

                    <p
                        style="color: #888888; margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em;">
                        Verification Code
                    </p>

                    <div
                        style="background-color: #000000; border-radius: 20px; padding: 32px; text-align: center; margin: 20px 0;">
                        <span
                            style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #ffffff; font-family: monospace;">
                            ${code}
                        </span>
                    </div>

                    <p
                        style="color: #ff4d4f; font-size: 13px; font-weight: 700; margin: 24px 0 0 0; display: flex; align-items: center;">
                        <span style="margin-right: 4px;">!</span> 이 코드는 10분 후 만료됩니다.
                    </p>

                    <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #f0f0f0;">
                        <p style="color: #bcbcbc; font-size: 12px; line-height: 1.6; margin: 0; font-weight: 500;">
                            본 메일은 발신 전용이며, 관련 문의사항은 껄무새 내 고객센터를 이용해 주시기 바랍니다.<br>
                            © 2026 GGURLMOOSAE. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
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
