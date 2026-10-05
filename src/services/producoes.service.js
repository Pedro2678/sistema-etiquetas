const prisma = require("../database/prisma");

const finalizarProducao = async (dados) => {

    const producao = await prisma.producao.create({
        data: {
            quantidade: dados.quantidade,
            ordemProducaoId: dados.ordemProducaoId
        }
    });

    const etiqueta = await prisma.etiqueta.create({
        data: {
            codigo: `ETQ-${String(producao.id).padStart(6, "0")}`,
            status: "PENDENTE",
            producaoId: producao.id
        }
    });

    return {
        producao,
        etiqueta
    };
};

const listarProducoes = async () => {

    return await prisma.producao.findMany({
        include: {
            ordemProducao: true,
            etiquetas: true
        }
    });

};


module.exports = {
    finalizarProducao,
    listarProducoes
};