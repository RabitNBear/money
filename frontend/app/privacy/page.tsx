'use client';

import Link from 'next/link';
import { /*ArrowLeft, */ ShieldCheck, Mail, Info } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans tracking-tight selection:bg-gray-100">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-12 sm:py-24">

        {/* Header - 브랜드 헤더 스타일과 통일 */}
        <div className="mb-12 sm:mb-20">

          <h1 className="text-[36px] sm:text-[56px] font-black leading-[1.1] mb-4 tracking-tighter uppercase">
            <br />개인정보처리방침
          </h1>
          <div className="flex items-center gap-3 mt-6">
            <span className="text-[9px] font-black text-white bg-black px-2 py-0.5 rounded tracking-tighter uppercase">Official</span>
            <p className="text-[13px] sm:text-[14px] text-gray-400 font-bold italic opacity-80 uppercase tracking-widest">
              시행일: 2026년 1월 1일
            </p>
          </div>
        </div>

        {/* Content Card - 시그니처 라운드 컨테이너 */}
        <div className="border-2 border-gray-100 rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 space-y-16 shadow-sm bg-white">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <ShieldCheck size={18} strokeWidth={2.5} />
              <h2 className="text-[16px] font-black uppercase tracking-widest">1. 개인정보의 처리 목적</h2>
            </div>
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
              껄무새(이하 &quot;서비스&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="mt-6 space-y-3">
              {['회원 가입 및 관리: 회원 식별, 서비스 제공', '서비스 제공: 포트폴리오 저장, 관심종목 관리, 개인 일정 관리', '고객 문의 응대: 문의사항 처리 및 답변'].map((item, idx) => (
                <li key={idx} className="flex gap-3 text-[14px] font-bold text-gray-400">
                  <span className="text-black">•</span> {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <Info size={18} strokeWidth={2.5} />
              <h2 className="text-[16px] font-black uppercase tracking-widest">2. 수집하는 개인정보 항목</h2>
            </div>
            <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-[#f9fafb]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">수집 시점</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">필수 항목</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">선택 항목</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] font-bold text-gray-700">
                    <tr className="border-b border-gray-50">
                      <td className="px-6 py-5">회원가입</td>
                      <td className="px-6 py-5 text-black">이메일, 비밀번호</td>
                      <td className="px-6 py-5 text-gray-400 italic">닉네임</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="px-6 py-5">소셜 로그인</td>
                      <td className="px-6 py-5 text-black">소셜 계정 식별자</td>
                      <td className="px-6 py-5 text-gray-400 italic">이메일, 프로필 이미지</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-5">서비스 이용</td>
                      <td className="px-6 py-5 text-gray-300">-</td>
                      <td className="px-6 py-5 text-gray-400 italic">포트폴리오 정보, 관심종목</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3-5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-[13px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                3. 개인정보 처리 및 보유 기간
              </h2>
              <ul className="space-y-4 text-[14px] font-bold text-gray-500 bg-gray-50 p-6 rounded-2xl">
                <li>• 회원 정보: <span className="text-black">회원 탈퇴 시까지</span></li>
                <li>• 로그인 기록: <span className="text-black">1년</span></li>
                <li>• 문의 내역: <span className="text-black">3년</span></li>
              </ul>
            </section>
            <section>
              <h2 className="text-[13px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                4/5. 제3자 제공 및 위탁
              </h2>
              <p className="text-[14px] leading-relaxed text-gray-500 font-medium">
                서비스는 이용자의 개인정보를 명시한 범위 내에서만 처리하며, 이용자의 동의 없이 <span className="text-black underline decoration-2 underline-offset-4">제3자에게 제공하지 않습니다.</span> 현재 개인정보 처리업무를 외부에 위탁하지 않습니다.
              </p>
            </section>
          </div>

          {/* Section 6-8 */}
          <section className="bg-black text-white p-8 sm:p-12 rounded-[32px] space-y-8 shadow-2xl">
            <h2 className="text-[18px] font-black uppercase tracking-[0.2em] border-b border-white/20 pb-4">
              정보주체의 권리 및 안전 조치
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Rights</p>
                <p className="text-[14px] font-medium leading-relaxed opacity-80">
                  이용자는 개인정보 열람, 정정, 삭제, 처리정지 요청 권리를 행사할 수 있으며, 마이페이지 또는 개인정보 보호책임자를 통해 즉시 처리 가능합니다.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Security Measure</p>
                <p className="text-[14px] font-medium leading-relaxed opacity-80">
                  비밀번호 bcrypt 암호화, 접속 기록 위변조 방지, SSL/TLS 암호화 통신 등 최신 보안 표준을 준수합니다.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <Mail size={18} strokeWidth={2.5} />
              <h2 className="text-[16px] font-black uppercase tracking-widest">9. 개인정보 보호책임자</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 bg-[#f3f4f6] p-8 rounded-[24px] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manager</p>
                <p className="text-[20px] font-black mb-1">김성원</p>
                <p className="text-[14px] font-bold text-gray-500 underline underline-offset-4">rabitnbear.official@gmail.com</p>
              </div>
              <div className="flex-1 space-y-4 flex flex-col justify-center">
                <div className="text-[12px] font-bold text-gray-400 space-y-1">
                  <p>• 개인정보침해신고센터: privacy.kisa.or.kr</p>
                  <p>• 개인정보분쟁조정위원회: kopico.go.kr</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 flex items-center justify-center gap-8">
          <Link href="/terms" className="text-[12px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors">이용약관</Link>
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
          <Link href="/" className="text-[12px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors">홈으로</Link>
        </div>
      </div>
    </div>
  );
}