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

    // Cria a ordem e deixa o banco gerar o ID
    const ordem = await prisma.ordemProducao.create({
        data: {
            numero: `TEMP-${Date.now()}`,
            quantidade: dados.quantidade,
            status: dados.status,
            produtoId: dados.produtoId
        }
    });

    // Gera o número da OP usando o ID definitivo
    return await prisma.ordemProducao.update({
        where: {
            id: ordem.id
        },
        data: {
            numero: `OP-${String(ordem.id).padStart(3, "0")}`
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