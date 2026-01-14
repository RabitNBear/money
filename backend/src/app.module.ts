import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { ScheduleModule } from './schedule/schedule.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { NoticeModule } from './notice/notice.module';
import { IPOModule } from './ipo/ipo.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Config Module - 환경변수 관리
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Throttler Module - Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1초
        limit: 10, // 1초에 10개 요청
      },
      {
        name: 'medium',
        ttl: 60000, // 1분
        limit: 100, // 1분에 100개 요청
      },
      {
        name: 'long',
        ttl: 3600000, // 1시간
        limit: 1000, // 1시간에 1000개 요청
      },
    ]),

    // Prisma Module - 데이터베이스
    PrismaModule,

    // Auth & Users Module
    AuthModule,
    UsersModule,

    // Phase 3: User Data Modules
    PortfolioModule,
    WatchlistModule,
    ScheduleModule,

    // Phase 4: Inquiry & Notice Modules
    InquiryModule,
    NoticeModule,

    // Phase 5: IPO Module
    IPOModule,

    // TODO: 아래 모듈들은 추후 추가 예정 (프론트엔드 프록시 역할)
    // StockModule,
    // MarketModule,
    // CalendarModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Rate Limiting Guard 전역 적용
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
