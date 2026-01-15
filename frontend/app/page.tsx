'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatNumber, formatPercent, getProfitColor } from '@/lib/utils';
import EconomicCalendar from '@/components/EconomicCalendar';
import ExchangeRateChart from '@/components/ExchangeRateChart';
import type { MarketIndex, FearGreedIndex } from '@/types';
import { TrendingUp, Calculator, Bookmark, Search, Bell, CalendarDays, RefreshCw, AlertTriangle } from 'lucide-react';

// 지수 이름 매핑 상수
const MARKET_NAMES: Record<string, string> = {
    '^GSPC': 'S&P 500',
    '^IXIC': '나스닥',
    '^DJI': '다우존스',
    '^KS11': 'KOSPI',
    '^KQ11': 'KOSDAQ',
};

// 공지사항 데이터
const MOCK_NOTICES = [
    { id: 1, type: '점검', title: '시스템 정기 점검 및 해외 주식 서비스 일시 중단 안내', date: '2026.01.07' },
    { id: 2, type: '배당', title: '2026년 1분기 주요 배당주 지급 일정 안내 (AAPL, MSFT 등)', date: '2026.01.05' },
    { id: 3, type: '업데이트', title: '모바일 앱 버전 2.4.0 업데이트 안내 (백테스트 기능 강화)', date: '2026.01.02' },
    { id: 4, type: '시장', title: '미국 증시 휴장일 안내 (Martin Luther King Jr. Day)', date: '2025.12.24' },
];

interface MarketData {
    us: MarketIndex[];
    kr: MarketIndex[];
    fearGreedUS: FearGreedIndex | null;
    fearGreedKR: FearGreedIndex | null;
    exchangeRate: number | null;
    updatedAt: string;
}

// 컴포넌트 Props 타입 정의
interface MarketCardProps {
    title: string;
    flag: string;
    indices: MarketIndex[];
    fearGreed: FearGreedIndex | null | undefined;
    active?: boolean;
}

interface ToolCardProps {
    href: string;
    icon: React.ReactNode;
    title: string;
    desc: string;
}

export default function Home() {
    const [data, setData] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMarketData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 타임아웃 로직 추가
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃
            const res = await fetch(`/api/market?_t=${new Date().getTime()}`, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const json = await res.json();
            if (json.success) {
                setData(json.data);
            } else {
                setError(json.error || '데이터 로드에 실패했습니다.');
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                setError('서버에서 응답이 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            } else if (err instanceof Error) {
                setError(`네트워크 오류: ${err.message}`);
            } else {
                setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
    }, []);

    if (loading) return <HomeSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20 relative overflow-hidden">
                {/* 배경에 은은한 붉은빛 효과 */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black">
                    <div className="h-[300px] w-[300px] bg-red-500/20 blur-[100px] rounded-full opacity-50"></div>
                </div>

                <div className="bg-zinc-900/80 border border-white/10 p-8 sm:p-12 rounded-[32px] max-w-lg w-full text-center shadow-2xl animate-fade-in relative z-10 backdrop-blur-lg">

                    {/* 아이콘 영역 */}
                    <div className="inline-flex p-5 bg-white/5 rounded-full border border-white/10 mb-8 backdrop-blur-md shadow-inner-light">
                        <AlertTriangle size={48} strokeWidth={1.5} className="text-red-500 opacity-90" />
                    </div>

                    {/* 메인 타이틀 */}
                    <h2 className="text-[28px] sm:text-[34px] font-black uppercase tracking-tighter text-white mb-4 leading-none">
                        Connection<br />Failed
                    </h2>

                    {/* 에러 메시지 */}
                    <div className="space-y-2 mb-10">
                        <p className="text-gray-300 text-[14px] sm:text-[15px] font-bold leading-relaxed break-keep px-4">
                            {error}
                        </p>
                        <p className="text-white/30 text-[12px] font-medium uppercase tracking-wider">
                            Please check your network status
                        </p>
                    </div>

                    {/* 재시도 버튼 */}
                    <button
                        onClick={fetchMarketData}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-black rounded-[24px] font-black uppercase tracking-widest hover:bg-gray-200 hover:scale-[1.02] transition-all group shadow-lg"
                    >
                        <RefreshCw size={18} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform duration-500" />
                        Retry Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            <section className="bg-black text-white pt-32 sm:pt-48 pb-20 sm:pb-32 overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-16 sm:mb-20">
                        <div className="lg:col-span-5 animate-fade-in">
                            <div className="flex items-center gap-4 mb-8 sm:mb-10">
                                <div className="h-[1px] w-8 bg-white/40" />
                                <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-white/40">
                                    Empowering Your Strategy
                                </p>
                            </div>

                            <div className="relative mb-8 sm:mb-12 font-logo">
                                <div className="flex items-end relative z-10">
                                    <Image
                                        src="/icon-192.png"
                                        alt="G"
                                        width={100}
                                        height={100}
                                        // translate-y-[10px] 추가. 숫자를 키울수록 더 내려감.
                                        className="w-[40px] h-[50px] sm:w-[80px] sm:h-[100px] lg:w-[100px] lg:h-[120px] mr-1 sm:mr-2 translate-y-[12px] translate-x-[3px] sm:translate-y-[22px] sm:translate-x-[7px] lg:translate-y-[27px] lg:translate-x-[7px]"
                                    />
                                    <h1 className="text-[50px] sm:text-[100px] lg:text-[120px] font-black leading-[0.8] tracking-tighter uppercase">
                                        GURL
                                    </h1>
                                </div>
                                <h1 className="text-[50px] sm:text-[100px] lg:text-[120px] font-black leading-[0.8] tracking-tighter uppercase text-white/10 mt-[-5px] sm:mt-[-20px]">
                                    MOOSAE
                                </h1>
                            </div>

                            <p className="text-[14px] sm:text-[18px] font-medium text-gray-400 max-w-2xl leading-relaxed italic mb-12">
                                데이터는 차갑지만, 당신의 투자는 뜨겁기를.<br className="hidden sm:block" />
                                앱 설치 없이 누리는 프리미엄 투자 시뮬레이터.
                            </p>

                            <div className="flex flex-row items-center gap-2 mb-10 w-full">
                                <HeroStatusWidget label="KR" fearGreed={data?.fearGreedKR} />
                                <HeroStatusWidget label="US" fearGreed={data?.fearGreedUS} />
                            </div>
                        </div>

                        <div className="lg:col-span-7 animate-fade-in">
                            <div className="h-[430px] sm:h-[470px] w-full bg-black/20 rounded-[32px] overflow-hidden">
                                <ExchangeRateChart />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 animate-fade-in">
                        <HeroMarketCard title="한국 시장" flag="🇰🇷" indices={data?.kr || []} fearGreed={data?.fearGreedKR} />
                        <HeroMarketCard title="미국 시장" flag="🇺🇸" indices={data?.us || []} fearGreed={data?.fearGreedUS} />
                    </div>
                </div>
            </section>

            <section className="bg-white text-black py-16 sm:py-24">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-24 sm:mb-32">
                        <ToolCard href="/calculator" icon={<Calculator size={24} strokeWidth={2.5} />} title="배당금 계산기" desc="월 배당 목표 시뮬레이션 돌려보기" />
                        <ToolCard href="/backtest" icon={<TrendingUp size={24} strokeWidth={2.5} />} title="그때 살 껄" desc="껄무새... 그때 살 껄! 그때 팔 껄!" />
                        <ToolCard href="/mystock" icon={<Bookmark size={24} strokeWidth={2.5} />} title="나의 종목" desc="보유 종목 저장하여 수시로 확인하기" />
                        <ToolCard href="/stock" icon={<Search size={24} strokeWidth={2.5} />} title="주식 시세" desc="국내외 주식 시세 확인 및 관심 종목 저장하기" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 mb-20 sm:mb-24">
                        <div className="lg:col-span-5 flex flex-col">
                            <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                                <div className="flex items-center gap-3">
                                    <Bell size={18} strokeWidth={2.5} />
                                    <h4 className="text-[16px] font-black tracking-widest">공지사항</h4>
                                </div>
                                <Link href="/notice" className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors">돋보기 〉</Link>
                            </div>
                            <div className="space-y-1">
                                {MOCK_NOTICES.map((notice) => (
                                    <Link href={`/notice/${notice.id}`} key={notice.id} className="flex flex-col py-5 sm:py-6 border-b border-gray-100 hover:bg-gray-50 px-2 sm:px-4 rounded-2xl transition-all group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[8px] font-black px-2 py-0.5 bg-black text-white rounded tracking-tighter">{notice.type}</span>
                                            <span className="text-[11px] font-bold text-gray-300 italic">{notice.date}</span>
                                        </div>
                                        <span className="text-[14px] sm:text-[16px] font-bold text-gray-800 group-hover:text-black transition-colors truncate">{notice.title}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col">
                            <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                                <div className="flex items-center gap-3">
                                    <CalendarDays size={18} strokeWidth={2.5} />
                                    <h4 className="text-[16px] font-black tracking-widest">주식 달력</h4>
                                </div>
                                <Link href="/calendar" className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors">돋보기 〉</Link>
                            </div>
                            <div className="bg-white border-2 border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm flex-1">
                                <EconomicCalendar />
                            </div>
                        </div>
                    </div>

                    {data?.updatedAt && (
                        <div className="mt-8 text-center">
                            <span className="text-[13px] font-bold text-gray-300 tracking-widest">
                                {new Date(data.updatedAt).toLocaleString('ko-KR', {
                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                })} 기준
                            </span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function HeroStatusWidget({ label, fearGreed }: { label: string, fearGreed: FearGreedIndex | null | undefined }) {
    const isGreed = fearGreed?.level?.includes('greed');
    const isFear = fearGreed?.level?.includes('fear');

    return (
        <div className="flex-1 flex items-center gap-2 sm:gap-6 py-3 px-2.5 sm:py-4 sm:px-6 bg-white/5 rounded-[50px] border border-white/10 backdrop-blur-md min-w-0">
            <div className="flex flex-col shrink-0">
                <span className="text-[16px] sm:text-[24px] font-black tracking-tighter">{label}</span>
            </div>
            <div className="w-[1px] h-7 sm:h-10 bg-white/10 shrink-0" />
            <div className="flex flex-col min-w-0">
                <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5 sm:mb-1">Status</span>
                <span className={`text-[9px] sm:text-[12px] font-bold uppercase whitespace-nowrap truncate ${isGreed ? 'text-green-500' : isFear ? 'text-red-500' : 'text-gray-400'
                    }`}>
                    {fearGreed ? (fearGreed.message || fearGreed.level.replace('_', ' ')) : 'Loading...'}
                </span>
            </div>
        </div>
    );
}

function HeroMarketCard({ title, flag, indices, fearGreed }: MarketCardProps) {
    return (
        <div className="bg-zinc-900 border border-white/10 p-8 sm:p-10 rounded-[32px] flex flex-col justify-between min-h-[320px] transition-all hover:border-white/30 shadow-2xl">
            <div>
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{flag}</span>
                        <h3 className="text-[18px] sm:text-[22px] font-black tracking-tight text-white">{title}</h3>
                    </div>
                    {fearGreed && <FearGreedBadge fearGreed={fearGreed} invert />}
                </div>
                <div className="space-y-8 sm:space-y-10">
                    {indices.map((index: MarketIndex) => (
                        <div key={index.symbol} className="flex justify-between items-center group/row">
                            <div>
                                <p className="text-[16px] sm:text-[19px] font-black text-white leading-tight mb-1">
                                    {MARKET_NAMES[index.symbol] || index.name}
                                </p>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{index.symbol}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[22px] sm:text-[28px] font-black tracking-tighter text-white leading-none mb-2">
                                    {formatNumber(index.price, 2)}
                                </div>
                                <div className={`text-[11px] sm:text-[13px] font-black ${getProfitColor(index.changePercent)} tracking-tighter`}>
                                    {index.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(index.changePercent))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ToolCard({ href, icon, title, desc }: ToolCardProps) {
    return (
        <Link href={href} className="group p-8 rounded-[32px] border-2 border-gray-100 hover:border-black bg-white flex flex-col justify-between min-h-[220px] sm:min-h-[260px] transition-all duration-500 shadow-sm">
            <div className="w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-sm">
                {icon}
            </div>
            <div>
                <h3 className="text-[18px] sm:text-[22px] font-black mb-2 tracking-tighter uppercase">{title}</h3>
                <p className="text-[12px] sm:text-[13px] text-gray-400 leading-tight font-bold group-hover:text-gray-600 transition-colors">{desc}</p>
            </div>
        </Link>
    );
}

function FearGreedBadge({ fearGreed, invert }: { fearGreed: FearGreedIndex, invert?: boolean }) {
    const levelColor = fearGreed.level.includes('greed') ? 'text-green-500' :
        fearGreed.level.includes('fear') ? 'text-red-500' : 'text-gray-500';
    return (
        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border rounded-full ${invert ? 'border-white/20 bg-white/5' : 'border-black/10 bg-black/5'} ${levelColor}`}>
            {fearGreed.message || fearGreed.level.replace('_', ' ')}
        </span>
    );
}

function HomeSkeleton() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1400px] mx-auto px-6 pt-48 pb-32">
                <div className="animate-pulse space-y-12">
                    <div className="h-20 w-1/3 bg-white/10 rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-5 h-[300px] bg-white/5 rounded-[40px]" />
                        <div className="lg:col-span-7 h-[450px] bg-white/5 rounded-[40px]" />
                    </div>
                </div>
            </div>
        </div>
    );
}