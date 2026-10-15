
const prisma = require("./src/database/prisma");

async function main() {
    const ordens = await prisma.ordemProducao.count();

    if (ordens !== 0) {
        throw new Error("Ainda existem ordens cadastradas.");
    }

    await prisma.$executeRawUnsafe(
        "DELETE FROM sqlite_sequence WHERE name = 'OrdemProducao'"
    );

    console.log("Contador de ordens reiniciado com sucesso!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
