-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_owner_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "owner" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
