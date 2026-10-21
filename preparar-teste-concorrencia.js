
require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
    url: "file:./dev-rollback-teste.db"
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const itemId = 3;
    const ordemId = 1;

    const item = await prisma.itemOrdemProducao.findUnique({
        where: { id: itemId },
        include: { produto: true }
    });

    if (!item || item.ordemProducaoId !== ordemId) {
        throw new Error("Item de teste não encontrado na ordem OP-001.");
    }

    const producoes = await prisma.producao.findMany({
        where: { itemOrdemProducaoId: itemId }
    });

    const total = producoes.reduce((soma, p) => soma + p.quantidade, 0);

    console.log("Produto:", item.produto.nome);
    console.log("Meta:", item.quantidade);
    console.log("Produzido atualmente:", total);
    console.log("Restante:", item.quantidade - total);

    if (total !== 80) {
        throw new Error(
            "A quantidade atual não é 80. Não foi feita nenhuma alteração."
        );
    }

    console.log("Cenário confirmado. Nenhum registro foi alterado.");
}

main()
    .catch((erro) => {
        console.error(erro.message);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
