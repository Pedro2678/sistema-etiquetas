const prisma = require("./src/database/prisma");

async function main() {

    const produto = await prisma.produto.create({
        data: {
            codigo: "PROD-001",
            nome: "Peça de teste",
            descricao: "Produto utilizado para teste do sistema de etiquetagem"
        }
    });

    console.log("Produto criado:");
    console.log(produto);
}

main()
    .catch((erro) => {
        console.error("Erro:", erro);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });