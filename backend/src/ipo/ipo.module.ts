import { Module } from '@nestjs/common';
import { IPOController } from './ipo.controller';
import { IPOService } from './ipo.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IPOController],
  providers: [IPOService],
  exports: [IPOService],
})
export class IPOModule {}
