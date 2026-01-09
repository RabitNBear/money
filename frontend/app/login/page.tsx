'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100">

      <main className="max-w-[450px] mx-auto pt-44 pb-20 px-6">
        <div className="mb-12 text-center">
          <h1 className="text-[56px] font-black leading-tight tracking-tighter uppercase mb-2">Login</h1>
          <p className="text-[13px] font-bold text-gray-300 tracking-[0.2em] uppercase italic">Pioneering your investment</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Identity</label>
            <input 
              type="text" 
              placeholder="아이디를 입력하세요"
              className="w-full h-[60px] bg-[#f3f4f6] rounded-xl px-6 font-bold text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Password</label>
            <input 
              type="password" 
              placeholder="비밀번호를 입력하세요"
              className="w-full h-[60px] bg-[#f3f4f6] rounded-xl px-6 font-bold text-[16px] outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300"
            />
          </div>

          <button type="submit" className="w-full h-[64px] bg-[#1a1a1a] text-white rounded-xl font-black text-[16px] hover:bg-black transition-all shadow-xl uppercase tracking-widest mt-6 cursor-pointer">
            Sign In
          </button>

          <div className="flex justify-center gap-8 pt-12 text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">
            <Link href="/findId" className="text-black hover:opacity-50 transition-colors cursor-pointer">Find ID</Link>
            <Link href="/findPw" className="text-black hover:opacity-50 transition-colors cursor-pointer">Find PW</Link>
            <Link href="/signup" className="text-black hover:opacity-50 transition-colors cursor-pointer">Signup</Link>
          </div>

              <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <p style={{ fontSize: '15px', color: '#999', marginBottom: '15px' }}>SNS 계정으로 간편 로그인</p><br></br>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  <button type="button" style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', background: '#03C75A', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>N</button>
                  <button type="button" style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', background: '#FEE500', color: '#3c1e1e', fontWeight: 'bold', cursor: 'pointer' }}>K</button>
                  <button type="button" style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', background: '#ea4335', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>G</button>
                </div>
              </div>
        </form>
      </main>
    </div>
  );
}

function SocialBtn({ icon, color }: { icon: string; color: string }) {
  return (
    <button className={`w-[54px] h-[54px] rounded-full flex items-center justify-center text-xl transition-transform hover:scale-110 shadow-sm ${color}`}>
      <i className={`fa-brands ${icon}`}></i>
    </button>
  );
}