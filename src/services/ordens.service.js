const prisma = require("../database/prisma");

const listarOrdens = async () => {
    return await prisma.ordemProducao.findMany({
        include: {
            produto: true
        }
    });
};

const criarOrdem = async (dados) => {

    if (dados.status === "EM_PRODUCAO") {

        const ordemAtiva =
            await prisma.ordemProducao.findFirst({
                where: {
                    status: "EM_PRODUCAO"
                }
            });

        if (ordemAtiva) {
            throw new Error(
                "Já existe uma ordem de produção em andamento"
            );
        }
    }

    return await prisma.ordemProducao.create({
        data: {
            numero: dados.numero,
            quantidade: dados.quantidade,
            status: dados.status,
            produtoId: dados.produtoId
        }
    });
};

const listarHistorico = async () => {
    return await prisma.ordemProducao.findMany({
        where: {
            status: "CONCLUIDA"
        },
        include: {
            produto: true,
            producoes: {
                include: {
                    etiquetas: true
                }
            }
        },
        orderBy: {
            id: "desc"
        }
    });
};

module.exports = {
    listarOrdens,
    criarOrdem,
    listarHistorico
};