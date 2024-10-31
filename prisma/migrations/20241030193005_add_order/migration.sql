-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "goods" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "creatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
