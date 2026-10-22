
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const origem = "/app/data/dev.db";
const pastaBackup = "/backups";
const retencaoDias = 30;

function dataHora() {
  return new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-");
}

async function main() {
  if (!fs.existsSync(origem)) {
    throw new Error(`Banco não encontrado: ${origem}`);
  }

  fs.mkdirSync(pastaBackup, { recursive: true });

  const destino = path.join(pastaBackup, `dev_${dataHora()}.db`);
  const temporario = `${destino}.tmp`;

  const db = new Database(origem, {
    readonly: true,
    fileMustExist: true,
    timeout: 10000,
  });

  try {
    console.log("Criando backup online do SQLite...");
    await db.backup(temporario);
  } finally {
    db.close();
  }

  try {
    const copia = new Database(temporario, {
      readonly: true,
      fileMustExist: true,
    });

    try {
      const integridade = copia.pragma("integrity_check", { simple: true });

      if (integridade !== "ok") {
        throw new Error(`Falha na integridade: ${integridade}`);
      }

      const tabelas = [
        "Produto",
        "OrdemProducao",
        "ItemOrdemProducao",
        "Producao",
        "Etiqueta",
      ];

      const contagens = {};

      for (const tabela of tabelas) {
        contagens[tabela] = copia
          .prepare(`SELECT COUNT(*) AS total FROM "${tabela}"`)
          .get().total;
      }

      console.log("Integridade: ok");
      console.log("Registros:", contagens);
    } finally {
      copia.close();
    }

    fs.renameSync(temporario, destino);
    console.log(`Backup criado e validado: ${destino}`);

    const limite = Date.now() - retencaoDias * 24 * 60 * 60 * 1000;

    for (const nome of fs.readdirSync(pastaBackup)) {
      if (!/^dev_.*\.db$/.test(nome)) continue;

      const arquivo = path.join(pastaBackup, nome);
      const stat = fs.statSync(arquivo);

      if (stat.isFile() && stat.mtimeMs < limite) {
        fs.unlinkSync(arquivo);
        console.log(`Backup antigo removido: ${nome}`);
      }
    }

    console.log("Backup concluído com sucesso.");
  } finally {
    if (fs.existsSync(temporario)) {
      fs.unlinkSync(temporario);
    }
  }
}

main().catch((erro) => {
  console.error("ERRO NO BACKUP:", erro);
  process.exitCode = 1;
});
