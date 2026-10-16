/*
  Warnings:

  - You are about to drop the column `produtoId` on the `OrdemProducao` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `OrdemProducao` table. All the data in the column will be lost.
  - Added the required column `itemOrdemProducaoId` to the `Producao` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ItemOrdemProducao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantidade" INTEGER NOT NULL,
    "ordemProducaoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    CONSTRAINT "ItemOrdemProducao_ordemProducaoId_fkey" FOREIGN KEY ("ordemProducaoId") REFERENCES "OrdemProducao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemOrdemProducao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrdemProducao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "status" TEXT NOT NULL
);
INSERT INTO "new_OrdemProducao" ("id", "numero", "status") SELECT "id", "numero", "status" FROM "OrdemProducao";
DROP TABLE "OrdemProducao";
ALTER TABLE "new_OrdemProducao" RENAME TO "OrdemProducao";
CREATE UNIQUE INDEX "OrdemProducao_numero_key" ON "OrdemProducao"("numero");
CREATE TABLE "new_Producao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantidade" INTEGER NOT NULL,
    "dataHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventoId" TEXT,
    "ordemProducaoId" INTEGER NOT NULL,
    "itemOrdemProducaoId" INTEGER NOT NULL,
    CONSTRAINT "Producao_ordemProducaoId_fkey" FOREIGN KEY ("ordemProducaoId") REFERENCES "OrdemProducao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Producao_itemOrdemProducaoId_fkey" FOREIGN KEY ("itemOrdemProducaoId") REFERENCES "ItemOrdemProducao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Producao" ("dataHora", "eventoId", "id", "ordemProducaoId", "quantidade") SELECT "dataHora", "eventoId", "id", "ordemProducaoId", "quantidade" FROM "Producao";
DROP TABLE "Producao";
ALTER TABLE "new_Producao" RENAME TO "Producao";
CREATE UNIQUE INDEX "Producao_eventoId_key" ON "Producao"("eventoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ItemOrdemProducao_ordemProducaoId_produtoId_key" ON "ItemOrdemProducao"("ordemProducaoId", "produtoId");
