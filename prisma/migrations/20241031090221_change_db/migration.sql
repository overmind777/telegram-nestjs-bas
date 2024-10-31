/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_owner_fkey";

-- DropIndex
DROP INDEX "Order_owner_idx";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "idTelegram" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_idTelegram_key" ON "User"("idTelegram");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
