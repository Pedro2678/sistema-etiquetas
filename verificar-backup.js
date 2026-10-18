
const Database = require("better-sqlite3");
const db = new Database("./dev-backup.db", { readonly: true });
for (const tabela of [
  "Produto",
  "OrdemProducao",
  "ItemOrdemProducao",
  "Producao",
  "Etiqueta"
]) {
  try {
    const dados = db.prepare(`SELECT * FROM "${tabela}"`).all();
    console.log(`\n--- ${tabela} (${dados.length} registros) ---`);
    console.log(JSON.stringify(dados, null, 2));
  } catch (erro) {
    console.log(`\n--- ${tabela} ---`);
    console.log(erro.message);
  }
}

db.close();
