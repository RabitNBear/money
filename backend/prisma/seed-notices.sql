-- 껄무새 공지사항 초기 데이터 등록 SQL
-- 실행 방법: psql -d ggeulmuse -f seed-notices.sql
-- 또는 Railway 콘솔에서 직접 실행

-- 1. 껄무새 서비스 정식 오픈 안내 (상단 고정)
INSERT INTO "Notice" (id, title, content, category, "isPinned", "isPublished", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    '껄무새 서비스 정식 오픈 안내',
    '안녕하세요, 껄무새입니다.

한국/미국 주식 투자자를 위한 배당금 계산기 및 백테스팅 서비스를 정식 오픈했습니다.

주요 기능:
- 배당금 계산기: 월 배당 목표 시뮬레이션
- 그때 살 껄: 과거 투자 수익률 백테스팅
- 나의 종목: 관심 종목 저장 및 관리
- 주식 시세: 국내외 실시간 시세 확인

많은 이용 부탁드립니다.',
    'NOTICE',
    true,
    true,
    NOW(),
    NOW()
);

-- 2. 공모주(IPO) 페이지 신규 오픈
INSERT INTO "Notice" (id, title, content, category, "isPinned", "isPublished", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    '공모주(IPO) 페이지 신규 오픈',
    '공모주 청약 일정을 확인할 수 있는 IPO 페이지가 새롭게 오픈되었습니다.

주식 달력에서 공모주 청약 일정을 한눈에 확인하실 수 있습니다.

주요 기능:
- 청약 예정 공모주 목록
- 청약 일정 및 공모가 정보
- 상장 예정일 안내

많은 이용 부탁드립니다.',
    'UPDATE',
    false,
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
);

-- 3. 구글/카카오 소셜 로그인 지원 안내
INSERT INTO "Notice" (id, title, content, category, "isPinned", "isPublished", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    '구글/카카오 소셜 로그인 지원 안내',
    '더 편리한 이용을 위해 소셜 로그인 기능이 추가되었습니다.

지원 서비스:
- 구글 계정 로그인
- 카카오 계정 로그인

기존 이메일 회원가입 외에 소셜 계정으로 간편하게 시작하실 수 있습니다.',
    'UPDATE',
    false,
    true,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
);

-- 4. 배당금 계산기, 백테스팅 기능 안내
INSERT INTO "Notice" (id, title, content, category, "isPinned", "isPublished", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    '배당금 계산기, 백테스팅 기능 안내',
    '껄무새의 핵심 기능을 소개합니다.

[배당금 계산기]
- 종목별 예상 배당금 계산
- 월 배당 목표 금액 시뮬레이션
- 포트폴리오 배당 수익 분석

[그때 살 껄 (백테스팅)]
- 특정 날짜에 매수했다면 현재 수익률 확인
- 과거 투자 시뮬레이션
- 그래프로 수익률 추이 확인

지금 바로 사용해보세요!',
    'NOTICE',
    false,
    true,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
);

-- 등록된 공지사항 확인
SELECT id, title, category, "isPinned", "createdAt" FROM "Notice" ORDER BY "isPinned" DESC, "createdAt" DESC;
