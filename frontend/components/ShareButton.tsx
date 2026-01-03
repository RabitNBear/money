'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: KakaoShareOptions) => void;
      };
    };
  }
}

interface KakaoShareOptions {
  objectType: 'feed';
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  buttons?: Array<{
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }>;
}

interface ShareButtonProps {
  title: string;
  description: string;
  imageUrl?: string;
  buttonText?: string;
}

export default function ShareButton({
  title,
  description,
  imageUrl,
  buttonText = '공유하기',
}: ShareButtonProps) {
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // 카카오 SDK 로드
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js';
    script.integrity = 'sha384-6MFdIr0zOira1CHQkedUqJVql0YtcZA1P0nbPrQYJXVJZUkTk/oX4U9GhLYEAFmg';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        // 카카오 앱 키 (JavaScript 키)
        // 실제 배포 시 환경변수로 관리 권장
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_KEY || '';
        if (kakaoKey) {
          window.Kakao.init(kakaoKey);
          setIsKakaoReady(true);
        }
      } else if (window.Kakao?.isInitialized()) {
        setIsKakaoReady(true);
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const getImageUrl = () => {
    if (imageUrl) return imageUrl;
    // OG 이미지 API 사용
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;
  };

  const handleKakaoShare = () => {
    if (!isKakaoReady || !window.Kakao) {
      alert('카카오 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const shareUrl = getShareUrl();

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: getImageUrl(),
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: '결과 확인하기',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });

    setShowOptions(false);
  };

  const handleClipboardShare = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      alert('링크가 복사되었습니다!');
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = getShareUrl();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('링크가 복사되었습니다!');
    }
    setShowOptions(false);
  };

  const handleTwitterShare = () => {
    const shareUrl = getShareUrl();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${title}\n${description}`
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="btn btn-secondary flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {buttonText}
      </button>

      {/* 공유 옵션 드롭다운 */}
      {showOptions && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-elevated overflow-hidden z-50">
          {isKakaoReady && (
            <button
              onClick={handleKakaoShare}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--card-hover)] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FEE500] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#3C1E1E"
                    d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.84 5.18 4.59 6.55-.15.53-.96 3.41-1 3.58 0 .05.02.1.05.14.04.04.09.06.14.06.08 0 .16-.03.22-.09l4.17-2.78c.6.08 1.21.12 1.83.12 5.52 0 10-3.48 10-7.78S17.52 3 12 3z"
                  />
                </svg>
              </div>
              <span className="font-medium">카카오톡</span>
            </button>
          )}

          <button
            onClick={handleTwitterShare}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--card-hover)] transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="font-medium">X (트위터)</span>
          </button>

          <button
            onClick={handleClipboardShare}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--card-hover)] transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--neutral)] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <span className="font-medium">링크 복사</span>
          </button>
        </div>
      )}

      {/* 배경 클릭 시 닫기 */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
