'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold">이용약관</h1>
        </div>

        {/* Content */}
        <div className="bg-[var(--card)] rounded-2xl p-6 space-y-8">
          <p className="text-sm text-[var(--text-secondary)]">
            시행일: 2025년 1월 1일
          </p>

          <section>
            <h2 className="text-lg font-semibold mb-3">제1조 (목적)</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              이 약관은 껄무새(이하 &quot;서비스&quot;)가 제공하는 주식 배당금 계산 및 백테스팅 서비스의
              이용조건 및 절차, 이용자와 서비스 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제2조 (정의)</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>1. &quot;서비스&quot;란 껄무새가 제공하는 웹 기반 주식 정보 및 계산 도구를 말합니다.</li>
              <li>2. &quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li>3. &quot;회원&quot;이란 서비스에 가입하여 계정을 보유한 자를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
              <li>2. 서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과한 후부터 효력을 발생합니다.</li>
              <li>3. 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제4조 (서비스의 제공)</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              서비스는 다음과 같은 기능을 제공합니다.
            </p>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>1. 한국/미국 주식 시장 정보 조회</li>
              <li>2. 배당금 계산기</li>
              <li>3. 과거 투자 시뮬레이션 (백테스팅)</li>
              <li>4. 경제 캘린더</li>
              <li>5. 포트폴리오 및 관심종목 관리 (회원 전용)</li>
              <li>6. 개인 일정 관리 (회원 전용)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제5조 (서비스 이용)</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>1. 서비스는 연중무휴 24시간 제공을 원칙으로 합니다.</li>
              <li>2. 시스템 점검, 장애, 기타 불가피한 사유로 서비스가 중단될 수 있습니다.</li>
              <li>3. 서비스는 무료로 제공되며, 향후 유료 서비스가 추가될 경우 별도로 안내합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제6조 (회원가입)</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>1. 이용자는 서비스가 정한 가입 양식에 따라 회원가입을 신청합니다.</li>
              <li>2. 서비스는 다음 각 호에 해당하는 경우 가입을 거부할 수 있습니다.
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• 타인의 정보를 도용한 경우</li>
                  <li>• 허위 정보를 기재한 경우</li>
                  <li>• 기타 서비스 운영에 지장을 초래할 우려가 있는 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제7조 (회원의 의무)</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              회원은 다음 행위를 하여서는 안 됩니다.
            </p>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>1. 타인의 정보 도용</li>
              <li>2. 서비스 운영을 방해하는 행위</li>
              <li>3. 서비스를 이용한 영리 목적의 정보 수집</li>
              <li>4. 서비스의 정보를 무단으로 복제, 배포하는 행위</li>
              <li>5. 기타 법령 또는 공공질서, 미풍양속에 반하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제8조 (서비스 이용 제한)</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              서비스는 회원이 제7조의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우,
              경고, 일시정지, 영구정지 등으로 서비스 이용을 제한할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제9조 (회원 탈퇴 및 자격 상실)</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>1. 회원은 언제든지 마이페이지를 통해 탈퇴를 요청할 수 있습니다.</li>
              <li>2. 탈퇴 시 회원의 개인정보는 30일간 보관 후 완전히 삭제됩니다.</li>
              <li>3. 탈퇴 후 동일 이메일로 재가입이 가능합니다.</li>
            </ul>
          </section>

          <section className="bg-[var(--background)] rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-[#F04251]">제10조 (면책조항) - 중요</h2>
            <div className="space-y-3 text-[var(--text-secondary)]">
              <p className="font-medium">
                본 서비스에서 제공하는 모든 정보는 <strong>투자 권유나 금융 조언이 아닙니다.</strong>
              </p>
              <ul className="space-y-2">
                <li>1. 서비스에서 제공하는 주식 정보, 배당금 계산 결과, 백테스팅 결과는 참고용이며, 실제와 다를 수 있습니다.</li>
                <li>2. <strong>과거 수익률이 미래 수익을 보장하지 않습니다.</strong></li>
                <li>3. 투자에 대한 최종 결정과 그에 따른 책임은 전적으로 이용자 본인에게 있습니다.</li>
                <li>4. 서비스는 이용자의 투자 결과에 대해 어떠한 법적 책임도 지지 않습니다.</li>
                <li>5. 데이터 제공처(yahoo-finance2 등)의 오류나 지연으로 인한 손해에 대해 책임지지 않습니다.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제11조 (지적재산권)</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>1. 서비스가 제공하는 콘텐츠에 대한 저작권은 서비스에 귀속됩니다.</li>
              <li>2. 이용자가 서비스 내에서 작성한 데이터(포트폴리오, 메모 등)에 대한 권리는 해당 이용자에게 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제12조 (개인정보보호)</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              서비스는 이용자의 개인정보를 보호하기 위해 노력하며, 개인정보의 수집, 이용, 관리에 관한 사항은
              별도의 <Link href="/privacy" className="text-blue-500 hover:underline">개인정보처리방침</Link>에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제13조 (분쟁 해결)</h2>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>1. 서비스와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법원을 관할법원으로 합니다.</li>
              <li>2. 서비스와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">부칙</h2>
            <p className="text-[var(--text-secondary)]">
              이 약관은 2025년 1월 1일부터 시행합니다.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex gap-4 text-sm text-[var(--text-secondary)]">
          <Link href="/privacy" className="hover:underline">
            개인정보처리방침
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
