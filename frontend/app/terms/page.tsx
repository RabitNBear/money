'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, Info, AlertTriangle, Gavel } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans tracking-tight selection:bg-gray-100">
      {/* PrivacyPage와 동일한 창 크기 설정 */}
      <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-12 sm:py-24">

        {/* Header - PrivacyPage와 위치, 크기, 간격 일치 */}
        <div className="mb-12 sm:mb-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-all group mb-8"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-widest">Back to Home</span>
          </Link>

          <h1 className="text-[36px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase">
            Terms of<br />Service
          </h1>
          <div className="flex items-center gap-3 mt-6">
            <span className="text-[9px] font-black text-white bg-black px-2 py-0.5 rounded tracking-tighter uppercase">Legal</span>
            <p className="text-[13px] sm:text-[14px] text-gray-400 font-bold italic opacity-80 uppercase tracking-widest">
              시행일: 2025년 1월 1일
            </p>
          </div>
        </div>

        {/* Content Card - PrivacyPage와 동일한 컨테이너 디자인 */}
        <div className="border-2 border-gray-100 rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 space-y-16 shadow-sm bg-white">

          {/* 제1조 (목적) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <FileText size={18} strokeWidth={2.5} />
              <h2 className="text-[16px] font-black uppercase tracking-widest">제1조 (목적)</h2>
            </div>
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
              이 약관은 껄무새(이하 &quot;서비스&quot;)가 제공하는 주식 배당금 계산 및 백테스팅 서비스의
              이용조건 및 절차, 이용자와 서비스 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조 (정의) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <CheckCircle size={18} strokeWidth={2.5} />
              <h2 className="text-[16px] font-black uppercase tracking-widest">제2조 (정의)</h2>
            </div>
            <ul className="space-y-2 text-[15px] text-gray-600 font-medium">
              <li>1. &quot;서비스&quot;란 껄무새가 제공하는 웹 기반 주식 정보 및 계산 도구를 말합니다.</li>
              <li>2. &quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li>3. &quot;회원&quot;이란 서비스에 가입하여 계정을 보유한 자를 말합니다.</li>
            </ul>
          </section>

          {/* 제3조 (약관의 효력 및 변경) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <Info size={18} strokeWidth={2.5} />
              <h2 className="text-[16px] font-black uppercase tracking-widest">제3조 (약관의 효력 및 변경)</h2>
            </div>
            <ul className="space-y-4 text-[15px] text-gray-600 font-medium">
              <li>1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
              <li>2. 서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과한 후부터 효력을 발생합니다.</li>
              <li>3. 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ul>
          </section>

          {/* 제4조 (서비스의 제공) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <h2 className="text-[16px] font-black uppercase tracking-widest">제4조 (서비스의 제공)</h2>
            </div>
            <p className="text-[15px] text-gray-600 leading-relaxed mb-3 font-medium">
              서비스는 다음과 같은 기능을 제공합니다.
            </p>
            <ul className="space-y-2 text-[15px] text-gray-600 font-medium">
              <li>1. 한국/미국 주식 시장 정보 조회</li>
              <li>2. 배당금 계산기</li>
              <li>3. 과거 투자 시뮬레이션 (백테스팅)</li>
              <li>4. 경제 캘린더</li>
              <li>5. 포트폴리오 및 관심종목 관리 (회원 전용)</li>
              <li>6. 개인 일정 관리 (회원 전용)</li>
            </ul>
          </section>

          {/* 제5조 (서비스 이용) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <h2 className="text-[16px] font-black uppercase tracking-widest">제5조 (서비스 이용)</h2>
            </div>
            <ul className="space-y-2 text-[15px] text-gray-600 font-medium">
              <li>1. 서비스는 연중무휴 24시간 제공을 원칙으로 합니다.</li>
              <li>2. 시스템 점검, 장애, 기타 불가피한 사유로 서비스가 중단될 수 있습니다.</li>
              <li>3. 서비스는 무료로 제공되며, 향후 유료 서비스가 추가될 경우 별도로 안내합니다.</li>
            </ul>
          </section>

          {/* 제6조 (회원가입) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <h2 className="text-[16px] font-black uppercase tracking-widest">제6조 (회원가입)</h2>
            </div>
            <ul className="space-y-2 text-[15px] text-gray-600 font-medium">
              <li>1. 이용자는 서비스가 정한 가입 양식에 따라 회원가입을 신청합니다.</li>
              <li>2. 서비스는 다음 각 호에 해당하는 경우 가입을 거부할 수 있습니다.
                <ul className="ml-4 mt-1 space-y-1 opacity-80">
                  <li>• 타인의 정보를 도용한 경우</li>
                  <li>• 허위 정보를 기재한 경우</li>
                  <li>• 기타 서비스 운영에 지장을 초래할 우려가 있는 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* 제7조 (회원의 의무) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <h2 className="text-[16px] font-black uppercase tracking-widest">제7조 (회원의 의무)</h2>
            </div>
            <p className="text-[15px] text-gray-600 leading-relaxed mb-3 font-medium">
              회원은 다음 행위를 하여서는 안 됩니다.
            </p>
            <ul className="space-y-2 text-[15px] text-gray-600 font-medium">
              <li>1. 타인의 정보 도용</li>
              <li>2. 서비스 운영을 방해하는 행위</li>
              <li>3. 서비스를 이용한 영리 목적의 정보 수집</li>
              <li>4. 서비스의 정보를 무단으로 복제, 배포하는 행위</li>
              <li>5. 기타 법령 또는 공공질서, 미풍양속에 반하는 행위</li>
            </ul>
          </section>

          {/* 제8조 (서비스 이용 제한) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <h2 className="text-[16px] font-black uppercase tracking-widest">제8조 (서비스 이용 제한)</h2>
            </div>
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
              서비스는 회원이 제7조의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우,
              경고, 일시정지, 영구정지 등으로 서비스 이용을 제한할 수 있습니다.
            </p>
          </section>

          {/* 제9조 (회원 탈퇴 및 자격 상실) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <h2 className="text-[16px] font-black uppercase tracking-widest">제9조 (회원 탈퇴 및 자격 상실)</h2>
            </div>
            <ul className="space-y-2 text-[15px] text-gray-600 font-medium">
              <li>1. 회원은 언제든지 마이페이지를 통해 탈퇴를 요청할 수 있습니다.</li>
              <li>2. 탈퇴 시 회원의 개인정보는 30일간 보관 후 완전히 삭제됩니다.</li>
              <li>3. 탈퇴 후 동일 이메일로 재가입이 가능합니다.</li>
            </ul>
          </section>

          {/* 제10조 (면책조항) - 시그니처 디자인 적용 */}
          <section className="bg-[#F04251] text-white p-8 sm:p-12 rounded-[32px] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <AlertTriangle size={120} strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-white/20 pb-4">
                <AlertTriangle size={20} strokeWidth={2.5} />
                <h2 className="text-[18px] font-black uppercase tracking-widest">제10조 (면책조항) - 중요</h2>
              </div>
              <div className="space-y-6">
                <p className="text-[15px] sm:text-[16px] font-black leading-relaxed">
                  본 서비스에서 제공하는 모든 정보는 <strong>투자 권유나 금융 조언이 아닙니다.</strong>
                </p>
                <ul className="space-y-3 text-[14px] font-bold opacity-90">
                  <li>1. 서비스에서 제공하는 주식 정보, 배당금 계산 결과, 백테스팅 결과는 참고용이며, 실제와 다를 수 있습니다.</li>
                  <li>2. <strong>과거 수익률이 미래 수익을 보장하지 않습니다.</strong></li>
                  <li>3. 투자에 대한 최종 결정과 그에 따른 책임은 전적으로 이용자 본인에게 있습니다.</li>
                  <li>4. 서비스는 이용자의 투자 결과에 대해 어떠한 법적 책임도 지지 않습니다.</li>
                  <li>5. 데이터 제공처(yahoo-finance2 등)의 오류나 지연으로 인한 손해에 대해 책임지지 않습니다.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제11조 (지적재산권) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <h2 className="text-[16px] font-black uppercase tracking-widest">제11조 (지적재산권)</h2>
            </div>
            <ul className="space-y-2 text-[15px] text-gray-600 font-medium">
              <li>1. 서비스가 제공하는 콘텐츠에 대한 저작권은 서비스에 귀속됩니다.</li>
              <li>2. 이용자가 서비스 내에서 작성한 데이터(포트폴리오, 메모 등)에 대한 권리는 해당 이용자에게 있습니다.</li>
            </ul>
          </section>

          {/* 제12조 (개인정보보호) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <Gavel size={18} strokeWidth={2.5} />
              <h2 className="text-[16px] font-black uppercase tracking-widest">제12조 (개인정보보호)</h2>
            </div>
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
              서비스는 이용자의 개인정보를 보호하기 위해 노력하며, 개인정보의 수집, 이용, 관리에 관한 사항은
              별도의 <Link href="/privacy" className="text-black underline underline-offset-4 font-black">개인정보처리방침</Link>에 따릅니다.
            </p>
          </section>

          {/* 제13조 (분쟁 해결) */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <h2 className="text-[16px] font-black uppercase tracking-widest">제13조 (분쟁 해결)</h2>
            </div>
            <ul className="space-y-2 text-[15px] text-gray-600 font-medium">
              <li>1. 서비스와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법원을 관할법원으로 합니다.</li>
              <li>2. 서비스와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.</li>
            </ul>
          </section>

          {/* 부칙 */}
          <section className="pt-8 border-t border-gray-100">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">Addendum</h2>
            <p className="text-[14px] font-bold text-gray-400 italic">
              이 약관은 2025년 1월 1일부터 시행합니다.
            </p>
          </section>
        </div>

        {/* Footer Links - PrivacyPage와 동일 */}
        <div className="mt-12 flex items-center justify-center gap-8">
          <Link href="/privacy" className="text-[12px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors">개인정보처리방침</Link>
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
          <Link href="/" className="text-[12px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors">홈으로</Link>
        </div>
      </div>
    </div>
  );
}