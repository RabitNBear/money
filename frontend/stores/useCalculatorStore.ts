import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PortfolioItem } from '@/types';

interface CalculatorState {
  // 목표 월 배당금 (원화)
  targetMonthlyIncome: number;
  setTargetMonthlyIncome: (amount: number) => void;

  // 포트폴리오 종목 리스트
  portfolio: PortfolioItem[];
  addToPortfolio: (item: PortfolioItem) => void;
  removeFromPortfolio: (symbol: string) => void;
  updatePortfolioItem: (symbol: string, updates: Partial<PortfolioItem>) => void;
  clearPortfolio: () => void;

  // 계산된 값
  getTotalAnnualDividend: () => number;
  getTotalMonthlyDividend: () => number;
  getRequiredInvestment: () => number;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      targetMonthlyIncome: 1000000, // 기본값: 월 100만원

      setTargetMonthlyIncome: (amount) => {
        set({ targetMonthlyIncome: amount });
      },

      portfolio: [],

      addToPortfolio: (item) => {
        set((state) => {
          // 이미 있는 종목이면 업데이트
          const existingIndex = state.portfolio.findIndex(
            (p) => p.symbol === item.symbol
          );

          if (existingIndex >= 0) {
            const newPortfolio = [...state.portfolio];
            newPortfolio[existingIndex] = {
              ...newPortfolio[existingIndex],
              ...item,
            };
            return { portfolio: newPortfolio };
          }

          return { portfolio: [...state.portfolio, item] };
        });
      },

      removeFromPortfolio: (symbol) => {
        set((state) => ({
          portfolio: state.portfolio.filter((p) => p.symbol !== symbol),
        }));
      },

      updatePortfolioItem: (symbol, updates) => {
        set((state) => ({
          portfolio: state.portfolio.map((p) =>
            p.symbol === symbol ? { ...p, ...updates } : p
          ),
        }));
      },

      clearPortfolio: () => {
        set({ portfolio: [] });
      },

      getTotalAnnualDividend: () => {
        const { portfolio } = get();
        return portfolio.reduce((sum, item) => sum + item.annualDividend, 0);
      },

      getTotalMonthlyDividend: () => {
        return get().getTotalAnnualDividend() / 12;
      },

      getRequiredInvestment: () => {
        const { portfolio, targetMonthlyIncome } = get();
        if (portfolio.length === 0) return 0;

        // 평균 배당률 계산
        const avgYield =
          portfolio.reduce((sum, item) => sum + item.dividendYield, 0) /
          portfolio.length;

        if (avgYield <= 0) return 0;

        const annualTarget = targetMonthlyIncome * 12;
        return Math.round((annualTarget / avgYield) * 100);
      },
    }),
    {
      name: 'calculator-storage', // localStorage 키
    }
  )
);
