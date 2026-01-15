'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 토큰 갱신 로직 (쿠키 기반)
async function refreshAccessToken(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
    });

    if (!response.ok) {
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        throw new Error('Session expired.');
    }
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * 인증이 필요한 fetch 요청을 위한 래퍼 함수
 * httpOnly 쿠키 기반 인증 사용
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    // 헤더를 일반 객체로 구성
    const getHeaders = (): Record<string, string> => {
        const baseHeaders: Record<string, string> = {};

        // 기존 headers가 있으면 복사
        if (options.headers) {
            const tempHeaders = new Headers(options.headers);
            tempHeaders.forEach((value, key) => {
                baseHeaders[key] = value;
            });
        }

        return baseHeaders;
    };

    // 1. 초기 요청 설정 (credentials: include로 쿠키 포함)
    const currentOptions: RequestInit = {
        ...options,
        credentials: 'include',
        headers: getHeaders(),
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
            await refreshPromise;

            // 4. 토큰 갱신 후 재요청
            response = await fetch(url, currentOptions);
        } catch {
            // 토큰 갱신 실패 시 원래의 401 응답 반환
            return response;
        }
    }

    return response;
};

/**
 * 로그아웃 함수
 */
export const logout = async (): Promise<void> => {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('Logout failed:', error);
    }

    // authChange 이벤트 발생
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChange'));
    }
};