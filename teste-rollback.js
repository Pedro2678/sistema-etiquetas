
require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
    url: "file:./dev-rollback-teste.db"
});

const prisma = new PrismaClient({ adapter });

async function testarRollbackDaEtiqueta() {
    const eventoId = `TESTE-FALHA-ETIQUETA-${Date.now()}`;

    let producaoId;

    try {
        await prisma.$transaction(async (tx) => {
            const producao = await tx.producao.create({
                data: {
                    quantidade: 1,
                    ordemProducaoId: 1,
                    itemOrdemProducaoId: 1,
                    eventoId
                }
            });

            producaoId = producao.id;

            console.log("Produção criada dentro da transação:", producaoId);

            // Tenta criar uma etiqueta com um campo obrigatório ausente.
            await tx.etiqueta.create({
                data: {
                    codigo: `TESTE-ETQ-${Date.now()}`,
                    producaoId
                }
            });
        });

        console.log("ATENÇÃO: a criação da etiqueta não falhou.");
    } catch (erro) {
        console.log("Falha esperada na criação da etiqueta:");
        console.log(erro.message);
    }

    const producaoEncontrada = await prisma.producao.findUnique({
        where: { eventoId }
    });

    if (producaoEncontrada === null) {
        console.log("PASSOU: a produção foi desfeita pelo rollback.");
    } else {
        console.log("FALHOU: a produção permaneceu no banco.");
    }
}

testarRollbackDaEtiqueta()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
