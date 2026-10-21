const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const projeto = __dirname;
const origem = path.join(projeto, "dev.db");
const pastaBackup = "C:\\Backups\\SistemaEtiquetas";

function dataHora() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

async function main() {
  if (!fs.existsSync(origem)) {
    throw new Error(`Banco não encontrado: ${origem}`);
  }

  fs.mkdirSync(pastaBackup, { recursive: true });

  const destino = path.join(
    pastaBackup,
    `dev_${dataHora()}.db`
  );

  const db = new Database(origem, { readonly: true, fileMustExist: true });

  try {
    await db.backup(destino);
  } finally {
    db.close();
  }

  const copia = new Database(destino, { readonly: true, fileMustExist: true });

  try {
    const resultado = copia.pragma("integrity_check");
    if (resultado.length !== 1 || resultado[0].integrity_check !== "ok") {
      throw new Error("A verificação de integridade falhou.");
    }

    const tabelas = [
      "Produto",
      "OrdemProducao",
      "ItemOrdemProducao",
      "Producao",
      "Etiqueta"
    ];

    const contagens = {};
    for (const tabela of tabelas) {
      contagens[tabela] = copia
        .prepare(`SELECT COUNT(*) AS total FROM "${tabela}"`)
        .get().total;
    }

    console.log("Backup criado e validado:");
    console.log(destino);
    console.log("Integridade: ok");
    console.log("Registros:", contagens);
  } finally {
    copia.close();
  }
}

main().catch(erro => {
  console.error("ERRO NO BACKUP:", erro);
  process.exitCode = 1;
});
