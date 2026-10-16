
const prisma = require("../database/prisma");

const listarOrdens = async () => {
    return await prisma.ordemProducao.findMany({
        include: {
            itens: {
                include: {
                    produto: true,
                    producoes: {
                        include: {
                            etiquetas: true
                        }
                    }
                }
            }
        },
        orderBy: {
            id: "asc"
        }
    });
};

const criarOrdem = async (dados) => {
    if (
        !Array.isArray(dados.itens) ||
        dados.itens.length === 0
    ) {
        throw new Error(
            "A ordem deve possuir pelo menos um item."
        );
    }

    for (const item of dados.itens) {
        if (
            !Number.isInteger(Number(item.produtoId)) ||
            Number(item.produtoId) <= 0 ||
            !Number.isInteger(Number(item.quantidade)) ||
            Number(item.quantidade) <= 0
        ) {
            throw new Error(
                "Cada item deve ter um produtoId válido e uma quantidade inteira positiva."
            );
        }
    }

    const produtosIds = dados.itens.map(
        item => Number(item.produtoId)
    );

    if (new Set(produtosIds).size !== produtosIds.length) {
        throw new Error(
            "Não repita o mesmo produto na mesma ordem."
        );
    }

    return await prisma.$transaction(async (tx) => {
        const ordemAtiva = await tx.ordemProducao.findFirst({
            where: {
                status: "EM_PRODUCAO"
            }
        });

        let statusFinal = "AGUARDANDO";

        if (!ordemAtiva) {
            const ordemAguardando =
                await tx.ordemProducao.findFirst({
                    where: {
                        status: "AGUARDANDO"
                    },
                    orderBy: {
                        id: "asc"
                    }
                });

            if (ordemAguardando) {
                await tx.ordemProducao.update({
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

        const ordem = await tx.ordemProducao.create({
            data: {
                numero: `TEMP-${Date.now()}`,
                status: statusFinal,
                itens: {
                    create: dados.itens.map(item => ({
                        quantidade: Number(item.quantidade),
                        produto: {
                            connect: {
                                id: Number(item.produtoId)
                            }
                        }
                    }))
                }
            },
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            }
        });

        return await tx.ordemProducao.update({
            where: {
                id: ordem.id
            },
            data: {
                numero: `OP-${String(ordem.id).padStart(3, "0")}`
            },
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            }
        });
    });
};

const listarHistorico = async () => {
    return await prisma.ordemProducao.findMany({
        where: {
            status: "CONCLUIDA"
        },
        include: {
            itens: {
                include: {
                    produto: true,
                    producoes: {
                        include: {
                            etiquetas: true
                        }
                    }
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
