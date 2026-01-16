'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 쿠키에서 특정 토큰 읽기
const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
};

// 토큰 갱신 로직
async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${refreshToken}`,
        },
    });

    if (!response.ok) {
        // 쿠키 삭제
        if (typeof document !== 'undefined') {
            const isProduction = window.location.hostname !== 'localhost';
            const cookieOptions = isProduction
                ? 'path=/; max-age=0; secure; samesite=none'
                : 'path=/; max-age=0; samesite=lax';
            document.cookie = `accessToken=; ${cookieOptions}`;
            document.cookie = `refreshToken=; ${cookieOptions}`;
        }
        throw new Error('Session expired.');
    }

    const data = await response.json();
    const responseData = data.data || data;

    // 새 토큰을 쿠키에 저장
    if (responseData.accessToken && responseData.refreshToken) {
        const isProduction = window.location.hostname !== 'localhost';
        const cookieOptions = isProduction
            ? 'path=/; secure; samesite=none'
            : 'path=/; samesite=lax';
        document.cookie = `accessToken=${responseData.accessToken}; max-age=900; ${cookieOptions}`;
        document.cookie = `refreshToken=${responseData.refreshToken}; max-age=604800; ${cookieOptions}`;
    }

    return responseData.accessToken || null;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * 인증이 필요한 fetch 요청을 위한 래퍼 함수
 * Authorization 헤더로 토큰 전송 (크로스 도메인 지원)
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    // 헤더를 일반 객체로 구성 (Authorization 헤더 추가)
    const getHeaders = (token?: string | null): Record<string, string> => {
        const baseHeaders: Record<string, string> = {};

        // 기존 headers가 있으면 복사
        if (options.headers) {
            const tempHeaders = new Headers(options.headers);
            tempHeaders.forEach((value, key) => {
                baseHeaders[key] = value;
            });
        }

        // Authorization 헤더 추가
        const accessToken = token || getCookie('accessToken');
        if (accessToken) {
            baseHeaders['Authorization'] = `Bearer ${accessToken}`;
        }

        return baseHeaders;
    };

    // 1. 초기 요청 설정
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
            const newToken = await refreshPromise;

            // 4. 토큰 갱신 후 재요청 (새 토큰으로)
            const retryOptions: RequestInit = {
                ...options,
                credentials: 'include',
                headers: getHeaders(newToken),
            };
            response = await fetch(url, retryOptions);
        } catch {
            // 토큰 갱신 실패 시 원래의 401 응답 반환
            return response;
        }
    }

    return response;
};

/**
 * 인증 시도는 하지만, 실패 시 리다이렉트하지 않는 fetch
 * 로그인 여부 확인 또는 옵셔널 인증이 필요한 경우 사용
 * (비로그인 사용자도 접근 가능한 페이지에서 관리자/로그인 체크 시 사용)
 * Authorization 헤더로 토큰 전송 (크로스 도메인 지원)
 */
export const tryFetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const getHeaders = (): Record<string, string> => {
        const baseHeaders: Record<string, string> = {};
        if (options.headers) {
            const tempHeaders = new Headers(options.headers);
            tempHeaders.forEach((value, key) => {
                baseHeaders[key] = value;
            });
        }

        // Authorization 헤더 추가
        const accessToken = getCookie('accessToken');
        if (accessToken) {
            baseHeaders['Authorization'] = `Bearer ${accessToken}`;
        }

        return baseHeaders;
    };

    const currentOptions: RequestInit = {
        ...options,
        credentials: 'include',
        headers: getHeaders(),
    };

    // 401이어도 리다이렉트하지 않고 그대로 반환
    return await fetch(url, currentOptions);
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