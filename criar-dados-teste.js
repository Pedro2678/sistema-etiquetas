const prisma = require("./src/database/prisma");

async function main() {
    const produto = await prisma.produto.create({
        data: {
            codigo: "PROD-001",
            nome: "Peça de teste",
            descricao: "Produto utilizado para teste do sistema de etiquetagem"
        }
    });

    const ordem = await prisma.ordemProducao.create({
        data: {
            numero: "OP-001",
            quantidade: 100,
            status: "EM_PRODUCAO",
            produtoId: produto.id
        }
    });

    console.log("Produto criado:");
    console.log(produto);

    console.log("Ordem de produção criada:");
    console.log(ordem);
}

main()
    .catch((erro) => {
        console.error("Erro:", erro);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });