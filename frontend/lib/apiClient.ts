'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 토큰 관리 유틸리티
export const getAuthToken = (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

export const getRefreshToken = (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

export const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

// 토큰 갱신 로직
async function refreshAccessToken(): Promise<string> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available.');

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Session expired.');
    }

    const newTokens = await response.json();
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', newTokens.accessToken);
        if (newTokens.refreshToken) {
            localStorage.setItem('refreshToken', newTokens.refreshToken);
        }
    }
    return newTokens.accessToken;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * 인증이 필요한 fetch 요청을 위한 래퍼 함수
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getAuthToken();

    // 헤더를 일반 객체로 구성하여 타입 에러 방지
    const getHeaders = (token: string | null): Record<string, string> => {
        const baseHeaders: Record<string, string> = {};

        // 기존 headers가 있으면 복사 (Record나 [string, string][] 형태 대응)
        if (options.headers) {
            const tempHeaders = new Headers(options.headers);
            tempHeaders.forEach((value, key) => {
                baseHeaders[key] = value;
            });
        }

        if (token) {
            baseHeaders['Authorization'] = `Bearer ${token}`;
        }

        return baseHeaders;
    };

    // 1. 초기 요청 설정
    let currentOptions: RequestInit = {
        ...options,
        headers: getHeaders(token),
    };

    // 2. 첫 번째 시도
    let response = await fetch(url, currentOptions);

    // 3. 401 에러 발생 시 (토큰 만료)
    if (response.status === 401) {
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = refreshAccessToken().finally(() => {
                isRefreshing = false;
                refreshPromise = null;
            });
        }

        try {
            const newToken = await refreshPromise;

            // 4. 새 토큰으로 헤더를 다시 구성하여 재요청
            currentOptions = {
                ...options,
                headers: getHeaders(newToken),
            };
            response = await fetch(url, currentOptions);
        } catch (error) {
            // 토큰 갱신 실패 시 원래의 401 응답 반환
            return response;
        }
    }

    return response;
};