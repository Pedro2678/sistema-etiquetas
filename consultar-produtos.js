const prisma = require("./src/database/prisma");

async function main() {
    const produtos = await prisma.produto.findMany();
    console.log("Produtos cadastrados:", produtos);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());