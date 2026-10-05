const prisma = require("../database/prisma");

const listarOrdens = async () => {
    return await prisma.ordemProducao.findMany({
        include: {
            produto: true
        }
    });
};

const criarOrdem = async (dados) => {
    return await prisma.ordemProducao.create({
        data: {
            numero: dados.numero,
            quantidade: dados.quantidade,
            status: dados.status,
            produtoId: dados.produtoId
        }
    });
};

module.exports = {
    listarOrdens,
    criarOrdem
};