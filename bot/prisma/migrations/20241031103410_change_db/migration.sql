/*
  Warnings:

  - Made the column `goods` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `volume` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantity` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "goods" SET NOT NULL,
ALTER COLUMN "volume" SET NOT NULL,
ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;
