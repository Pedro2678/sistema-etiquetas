
const prisma = require("./src/database/prisma");

async function main() {
    const produtos = [
        {
            codigo: "PROD-001",
            nome: "Peça tipo 1",
            descricao: "Tipo de peça 1"
        },
        {
            codigo: "PROD-002",
            nome: "Peça tipo 2",
            descricao: "Tipo de peça 2"
        },
        {
            
            codigo: "PROD-003",
            nome: "Peça tipo 3",
            descricao: "Tipo de peça 3"
        },
        {
            codigo: "PROD-004",
            nome: "Peça tipo 4",
            descricao: "Tipo de peça 4"
        },
        {
            codigo: "PROD-005",
            nome: "Peça tipo 5",
            descricao: "Tipo de peça 5"
        }
    ];

    for (const dados of produtos) {
        const produto = await prisma.produto.upsert({
            where: { codigo: dados.codigo },
            update: {
                nome: dados.nome,
                descricao: dados.descricao
            },
            create: dados
        });

        console.log(`Produto cadastrado: ${produto.codigo} - ${produto.nome}`);
    }
}

main()
    .catch((erro) => {
        console.error("Erro ao cadastrar produtos:", erro);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
