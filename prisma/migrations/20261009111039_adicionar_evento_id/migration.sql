/*
  Warnings:

  - A unique constraint covering the columns `[eventoId]` on the table `Producao` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Producao" ADD COLUMN "eventoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Producao_eventoId_key" ON "Producao"("eventoId");
