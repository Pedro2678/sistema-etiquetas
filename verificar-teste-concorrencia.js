
require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
    url: "file:./dev-rollback-teste.db"
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const itens = await prisma.itemOrdemProducao.findMany({
        where: { ordemProducaoId: 1 },
        include: { produto: true }
    });

    for (const item of itens) {
        const producoes = await prisma.producao.findMany({
            where: { itemOrdemProducaoId: item.id }
        });

        const total = producoes.reduce(
            (soma, producao) => soma + producao.quantidade,
            0
        );

        console.log({
            itemId: item.id,
            produto: item.produto.nome,
            meta: item.quantidade,
            produzido: total,
            restante: item.quantidade - total
        });
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
