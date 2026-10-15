
const prisma = require("./src/database/prisma");

async function limparDados() {
    try {
        console.log("Limpando dados de teste...");

        await prisma.etiqueta.deleteMany();
        await prisma.producao.deleteMany();
        await prisma.ordemProducao.deleteMany();
        await prisma.produto.deleteMany();

        console.log("Dados apagados com sucesso!");
    } catch (erro) {
        console.error("Erro ao limpar dados:", erro);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

limparDados();
