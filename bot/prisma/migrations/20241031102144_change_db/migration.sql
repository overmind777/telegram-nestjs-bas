/*
  Warnings:

  - You are about to drop the column `owner` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_owner_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "owner",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
