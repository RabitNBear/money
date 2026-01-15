-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "IPOStatus" AS ENUM ('UPCOMING', 'SUBSCRIPTION', 'COMPLETED', 'LISTED');

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "answeredBy" TEXT;

-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "IPO" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "ticker" TEXT,
    "demandForecastStart" TIMESTAMP(3),
    "demandForecastEnd" TIMESTAMP(3),
    "subscriptionStart" TIMESTAMP(3),
    "subscriptionEnd" TIMESTAMP(3),
    "refundDate" TIMESTAMP(3),
    "listingDate" TIMESTAMP(3),
    "priceRangeLow" INTEGER,
    "priceRangeHigh" INTEGER,
    "finalPrice" INTEGER,
    "totalShares" INTEGER,
    "leadUnderwriter" TEXT,
    "status" "IPOStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IPO_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IPO_subscriptionStart_idx" ON "IPO"("subscriptionStart");

-- CreateIndex
CREATE INDEX "IPO_listingDate_idx" ON "IPO"("listingDate");

-- CreateIndex
CREATE INDEX "IPO_status_idx" ON "IPO"("status");

-- CreateIndex
CREATE INDEX "Notice_authorId_idx" ON "Notice"("authorId");

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
