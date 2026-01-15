import axios from 'axios';
import * as cheerio from 'cheerio';
import { IPOStatus } from '@prisma/client';

export interface ScrapedIPO {
  companyName: string;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  listingDate?: Date;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  finalPrice?: number;
  leadUnderwriter?: string;
  status: IPOStatus;
}

/**
 * 38커뮤니케이션에서 공모주 일정 스크래핑
 * URL: http://www.38.co.kr/html/fund/?o=k
 */
export async function scrape38Communication(): Promise<ScrapedIPO[]> {
  const results: ScrapedIPO[] = [];

  try {
    const url = 'http://www.38.co.kr/html/fund/?o=k';
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // 테이블에서 IPO 데이터 추출
    $('table.table_list tr').each((_, row) => {
      const cols = $(row).find('td');
      if (cols.length < 5) return;

      const companyName = $(cols[0]).text().trim();
      if (!companyName || companyName === '종목명') return;

      // 청약일 파싱 (예: "01.27~01.28")
      const subscriptionText = $(cols[1]).text().trim();
      const subscriptionDates = parseSubscriptionDates(subscriptionText);

      // 공모가 파싱
      const priceText = $(cols[2]).text().trim();
      const prices = parsePriceRange(priceText);

      // 주간사
      const underwriter = $(cols[3]).text().trim();

      // 상장일 파싱
      const listingText = $(cols[4]).text().trim();
      const listingDate = parseDate(listingText);

      // 상태 결정
      const status = determineStatus(
        subscriptionDates.start,
        subscriptionDates.end,
        listingDate,
      );

      results.push({
        companyName,
        subscriptionStart: subscriptionDates.start,
        subscriptionEnd: subscriptionDates.end,
        listingDate,
        priceRangeLow: prices.low,
        priceRangeHigh: prices.high,
        finalPrice: prices.final,
        leadUnderwriter: underwriter || undefined,
        status,
      });
    });
  } catch (error) {
    console.error('38커뮤니케이션 스크래핑 실패:', error);
  }

  return results;
}

/**
 * DART 청약달력에서 공모주 일정 스크래핑
 * URL: https://dart.fss.or.kr/dsac008/main.do
 */
export async function scrapeDart(): Promise<ScrapedIPO[]> {
  const results: ScrapedIPO[] = [];

  try {
    // DART는 AJAX로 데이터를 로드하므로 API 엔드포인트 직접 호출
    const url = 'https://dart.fss.or.kr/dsac008/selectList.ax';
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');

    const response = await axios.post(
      url,
      new URLSearchParams({
        selectYear: year.toString(),
        selectMonth: month,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://dart.fss.or.kr/dsac008/main.do',
        },
        timeout: 10000,
      },
    );

    const $ = cheerio.load(response.data);

    // DART 테이블 파싱
    $('table tbody tr').each((_, row) => {
      const cols = $(row).find('td');
      if (cols.length < 4) return;

      const companyName = $(cols[0]).text().trim();
      if (!companyName) return;

      // 청약기간
      const periodText = $(cols[1]).text().trim();
      const dates = parseDartPeriod(periodText);

      // 상태
      const statusText = $(cols[2]).text().trim();
      const status = parseDartStatus(statusText);

      results.push({
        companyName,
        subscriptionStart: dates.start,
        subscriptionEnd: dates.end,
        status,
      });
    });
  } catch (error) {
    console.error('DART 스크래핑 실패:', error);
  }

  return results;
}

// Helper functions

function parseSubscriptionDates(text: string): {
  start?: Date;
  end?: Date;
} {
  // "01.27~01.28" 또는 "2025.01.27~01.28" 형식
  const match = text.match(
    /(\d{2,4})?\.?(\d{2})\.(\d{2})~(\d{2})?\.?(\d{2})/,
  );
  if (!match) return {};

  const year = new Date().getFullYear();
  const startMonth = parseInt(match[2]) - 1;
  const startDay = parseInt(match[3]);
  const endMonth = match[4] ? parseInt(match[4]) - 1 : startMonth;
  const endDay = parseInt(match[5]);

  return {
    start: new Date(year, startMonth, startDay),
    end: new Date(year, endMonth, endDay),
  };
}

function parsePriceRange(text: string): {
  low?: number;
  high?: number;
  final?: number;
} {
  // "33,000" 또는 "30,000~35,000" 형식
  const cleanText = text.replace(/,/g, '').replace(/원/g, '');

  // 범위인 경우
  const rangeMatch = cleanText.match(/(\d+)~(\d+)/);
  if (rangeMatch) {
    return {
      low: parseInt(rangeMatch[1]),
      high: parseInt(rangeMatch[2]),
    };
  }

  // 단일 가격인 경우 (확정가)
  const singleMatch = cleanText.match(/(\d+)/);
  if (singleMatch) {
    const price = parseInt(singleMatch[1]);
    return { final: price, low: price, high: price };
  }

  return {};
}

function parseDate(text: string): Date | undefined {
  // "01.30" 또는 "2025.01.30" 형식
  const match = text.match(/(\d{4})?\.?(\d{2})\.(\d{2})/);
  if (!match) return undefined;

  const year = match[1] ? parseInt(match[1]) : new Date().getFullYear();
  const month = parseInt(match[2]) - 1;
  const day = parseInt(match[3]);

  return new Date(year, month, day);
}

function determineStatus(
  subscriptionStart?: Date,
  subscriptionEnd?: Date,
  listingDate?: Date,
): IPOStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (listingDate && listingDate <= today) {
    return IPOStatus.LISTED;
  }

  if (subscriptionEnd && subscriptionEnd < today) {
    return IPOStatus.COMPLETED;
  }

  if (
    subscriptionStart &&
    subscriptionEnd &&
    subscriptionStart <= today &&
    subscriptionEnd >= today
  ) {
    return IPOStatus.SUBSCRIPTION;
  }

  return IPOStatus.UPCOMING;
}

function parseDartPeriod(text: string): { start?: Date; end?: Date } {
  // "2025.01.27 ~ 2025.01.28" 형식
  const match = text.match(
    /(\d{4})\.(\d{2})\.(\d{2})\s*~\s*(\d{4})\.(\d{2})\.(\d{2})/,
  );
  if (!match) return {};

  return {
    start: new Date(
      parseInt(match[1]),
      parseInt(match[2]) - 1,
      parseInt(match[3]),
    ),
    end: new Date(
      parseInt(match[4]),
      parseInt(match[5]) - 1,
      parseInt(match[6]),
    ),
  };
}

function parseDartStatus(text: string): IPOStatus {
  if (text.includes('상장')) return IPOStatus.LISTED;
  if (text.includes('완료')) return IPOStatus.COMPLETED;
  if (text.includes('청약중') || text.includes('진행')) return IPOStatus.SUBSCRIPTION;
  return IPOStatus.UPCOMING;
}
