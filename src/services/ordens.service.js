const prisma = require("../database/prisma");

const listarOrdens = async () => {
    return await prisma.ordemProducao.findMany({
        include: {
            produto: true
        }
    });
};


const criarOrdem = async (dados) => {
    const ordemAtiva = await prisma.ordemProducao.findFirst({
        where: {
            status: "EM_PRODUCAO"
        }
    });

    let statusFinal = "AGUARDANDO";

    if (!ordemAtiva) {
        const ordemAguardando = await prisma.ordemProducao.findFirst({
            where: {
                status: "AGUARDANDO"
            },
            orderBy: {
                id: "asc"
            }
        });

        if (ordemAguardando) {
            await prisma.ordemProducao.update({
                where: {
                    id: ordemAguardando.id
                },
                data: {
                    status: "EM_PRODUCAO"
                }
            });
        } else {
            statusFinal = "EM_PRODUCAO";
        }
    }

    const ordem = await prisma.ordemProducao.create({
        data: {
            numero: `TEMP-${Date.now()}`,
            quantidade: dados.quantidade,
            status: statusFinal,
            produtoId: dados.produtoId
        }
    });

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