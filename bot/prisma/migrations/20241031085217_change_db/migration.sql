/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastOrder` on the `users` table. All the data in the column will be lost.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "createAt",
DROP COLUMN "lastOrder",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "orders";

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "owner" INTEGER NOT NULL,
    "goods" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_owner_idx" ON "Order"("owner");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_owner_fkey" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
