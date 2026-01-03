import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title') || '껄무새';
    const description = searchParams.get('description') || '배당금 계산기 & 백테스팅';
    const value = searchParams.get('value') || '';
    const change = searchParams.get('change') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#121212',
            padding: '40px',
          }}
        >
          {/* 로고 영역 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
              }}
            >
              🦜
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#3182f6',
              }}
            >
              껄무새
            </div>
          </div>

          {/* 메인 카드 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#1E1E1E',
              borderRadius: '24px',
              padding: '48px 64px',
              border: '1px solid #333',
            }}
          >
            {/* 제목 */}
            <div
              style={{
                fontSize: '28px',
                color: '#888',
                marginBottom: '16px',
              }}
            >
              {title}
            </div>

            {/* 값 (있으면 표시) */}
            {value && (
              <div
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#fff',
                  marginBottom: '12px',
                }}
              >
                {value}
              </div>
            )}

            {/* 변화율 (있으면 표시) */}
            {change && (
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: change.startsWith('-') ? '#2B83F6' : '#F04251',
                }}
              >
                {change.startsWith('-') ? '▼' : '▲'} {change}
              </div>
            )}

            {/* 설명 */}
            <div
              style={{
                fontSize: '20px',
                color: '#666',
                marginTop: value ? '24px' : '0',
                textAlign: 'center',
              }}
            >
              {description}
            </div>
          </div>

          {/* 하단 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '32px',
              color: '#555',
              fontSize: '16px',
            }}
          >
            배당금 계산기 & 백테스팅 도구
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
