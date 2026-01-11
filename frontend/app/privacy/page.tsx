'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">개인정보처리방침</h1>
        </div>

        {/* Content */}
        <div className="bg-[var(--card)] rounded-2xl p-6 space-y-8">
          <p className="text-sm text-[var(--text-secondary)]">
            시행일: 2025년 1월 1일
          </p>

          <section>
            <h2 className="text-lg font-semibold mb-3">1. 개인정보의 처리 목적</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              껄무새(이하 &quot;서비스&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="mt-3 space-y-2 text-[var(--text-secondary)]">
              <li>• 회원 가입 및 관리: 회원 식별, 서비스 제공</li>
              <li>• 서비스 제공: 포트폴리오 저장, 관심종목 관리, 개인 일정 관리</li>
              <li>• 고객 문의 응대: 문의사항 처리 및 답변</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. 수집하는 개인정보 항목</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-4">수집 시점</th>
                    <th className="text-left py-2 pr-4">필수 항목</th>
                    <th className="text-left py-2">선택 항목</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text-secondary)]">
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4">회원가입</td>
                    <td className="py-3 pr-4">이메일, 비밀번호</td>
                    <td className="py-3">닉네임</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4">소셜 로그인</td>
                    <td className="py-3 pr-4">소셜 계정 식별자</td>
                    <td className="py-3">이메일, 프로필 이미지</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">서비스 이용</td>
                    <td className="py-3 pr-4">-</td>
                    <td className="py-3">포트폴리오 정보, 관심종목</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. 개인정보의 처리 및 보유 기간</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>• 회원 정보: <strong>회원 탈퇴 시까지</strong> (탈퇴 후 30일 이내 완전 삭제)</li>
              <li>• 로그인 기록: <strong>1년</strong></li>
              <li>• 문의 내역: <strong>3년</strong> (전자상거래법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. 개인정보의 제3자 제공</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              서비스는 이용자의 개인정보를 &quot;1. 개인정보의 처리 목적&quot;에서 명시한 범위 내에서만 처리하며,
              이용자의 동의 없이 제3자에게 제공하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. 개인정보 처리의 위탁</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              서비스는 현재 개인정보 처리업무를 외부에 위탁하지 않습니다.
              향후 위탁이 필요한 경우, 위탁받는 자와 위탁 업무 내용을 본 방침에 공개하겠습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. 정보주체의 권리·의무 및 행사방법</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
            </p>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>• 개인정보 열람 요청</li>
              <li>• 오류 등이 있을 경우 정정 요청</li>
              <li>• 삭제 요청</li>
              <li>• 처리정지 요청</li>
            </ul>
            <p className="mt-3 text-[var(--text-secondary)]">
              위 권리는 마이페이지에서 직접 수정/탈퇴하거나, 아래 개인정보 보호책임자에게 연락하여 행사할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. 개인정보의 파기 절차 및 방법</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>• <strong>파기 절차</strong>: 회원 탈퇴 시 30일간 복구 가능 기간 후 완전 삭제</li>
              <li>• <strong>파기 방법</strong>: 전자적 파일은 복구 불가능한 방법으로 영구 삭제</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. 개인정보의 안전성 확보조치</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>• 비밀번호 암호화 저장 (bcrypt)</li>
              <li>• 접속 기록 보관 및 위변조 방지</li>
              <li>• 개인정보 접근 제한</li>
              <li>• SSL/TLS 암호화 통신</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. 개인정보 보호책임자</h2>
            <div className="bg-[var(--background)] rounded-lg p-4 text-[var(--text-secondary)]">
              <p>• 이름: 김성원</p>
              <p>• 이메일: s413625@gmail.com</p>
            </div>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다.
            </p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
              <li>• 개인정보침해신고센터: privacy.kisa.or.kr (국번없이 118)</li>
              <li>• 개인정보분쟁조정위원회: kopico.go.kr (1833-6972)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. 개인정보처리방침 변경</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              이 개인정보처리방침은 2025년 1월 1일부터 적용됩니다.
              변경사항이 있을 경우 시행 7일 전에 공지사항을 통해 고지하겠습니다.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex gap-4 text-sm text-[var(--text-secondary)]">
          <Link href="/terms" className="hover:underline">
            이용약관
          </Link>
          <span>|</span>
          <Link href="/" className="hover:underline">
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
