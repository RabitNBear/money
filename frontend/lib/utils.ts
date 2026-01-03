import type { AssetComparison } from '@/types';

// 숫자 포맷팅 (천단위 콤마)
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// 통화 포맷팅
export function formatCurrency(value: number, currency: string = 'KRW'): string {
  if (currency === 'KRW') {
    return `${formatNumber(Math.round(value))}원`;
  } else if (currency === 'USD') {
    return `$${formatNumber(value, 2)}`;
  }
  return `${formatNumber(value, 2)} ${currency}`;
}

// 퍼센트 포맷팅
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

// 날짜 포맷팅 (YYYY-MM-DD → YYYY년 M월 D일)
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 상대 날짜 (오늘, 내일, n일 후 등)
export function getRelativeDate(dateString: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '내일';
  if (diffDays === -1) return '어제';
  if (diffDays > 0 && diffDays <= 7) return `${diffDays}일 후`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}일 전`;

  return formatDate(dateString);
}

// 금액을 자산으로 환산
export function convertToAssets(amountKRW: number): AssetComparison[] {
  const assets = [
    { label: '소나타', value: 35000000, emoji: '🚗' },
    { label: '그랜저', value: 50000000, emoji: '🚘' },
    { label: '강남 아파트', value: 2500000000, emoji: '🏠' },
    { label: '스타벅스 커피', value: 5000, emoji: '☕' },
    { label: '아이폰', value: 1500000, emoji: '📱' },
    { label: '맥북 프로', value: 3000000, emoji: '💻' },
    { label: '테슬라 모델3', value: 60000000, emoji: '⚡' },
  ];

  return assets
    .map((asset) => ({
      ...asset,
      count: Math.round((amountKRW / asset.value) * 100) / 100,
    }))
    .filter((asset) => asset.count >= 0.01) // 0.01개 이상만 표시
    .sort((a, b) => {
      // 1~10 범위의 것을 우선 표시
      const aScore = a.count >= 1 && a.count <= 10 ? 1 : 0;
      const bScore = b.count >= 1 && b.count <= 10 ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, 3); // 상위 3개만
}

// CAGR (연평균 수익률) 계산
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number {
  if (initialValue <= 0 || years <= 0) return 0;
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
}

// 목표 월 배당금을 위한 필요 투자금 계산
export function calculateRequiredInvestment(
  monthlyTarget: number,
  dividendYield: number,
  exchangeRate: number = 1,
  currency: 'USD' | 'KRW' = 'KRW'
): number {
  if (dividendYield <= 0) return 0;

  const annualTarget = monthlyTarget * 12;

  // 원화 기준으로 통일
  const annualTargetKRW = currency === 'USD' ? annualTarget * exchangeRate : annualTarget;
  const requiredKRW = (annualTargetKRW / dividendYield) * 100;

  return Math.round(requiredKRW);
}

// 수익/손실 색상 반환 (한국식: 수익 빨강, 손실 파랑)
export function getProfitColor(value: number): string {
  if (value > 0) return 'text-red-500'; // 수익 - 빨강
  if (value < 0) return 'text-blue-500'; // 손실 - 파랑
  return 'text-gray-500'; // 보합 - 회색
}

// 공포/탐욕 레벨에 따른 색상
export function getFearGreedColor(level: string): string {
  switch (level) {
    case 'greed':
      return 'text-green-500';
    case 'neutral':
      return 'text-gray-500';
    case 'fear':
      return 'text-yellow-500';
    case 'extreme_fear':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

// 클래스명 조합 유틸리티
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
