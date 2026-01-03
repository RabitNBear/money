import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system', // 기본값: 시스템 설정 따라가기

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        applyTheme(newTheme);
      },

      getEffectiveTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
          }
          return 'light';
        }
        return theme;
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // 스토어가 복원된 후 테마 적용
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

// DOM에 테마 클래스 적용
function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// 시스템 테마 변경 감지
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      applyTheme('system');
    }
  });
}
