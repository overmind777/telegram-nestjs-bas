/*
  Warnings:

  - Added the required column `waitingForAddress` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waitingForNotes` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "waitingForAddress" BOOLEAN NOT NULL,
ADD COLUMN     "waitingForNotes" BOOLEAN NOT NULL;
