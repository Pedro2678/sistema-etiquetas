
const prisma = require("../database/prisma");

const finalizarProducao = async (dados) => {
    const quantidade = Number(dados.quantidade);
    const ordemProducaoId = Number(dados.ordemProducaoId);
    const produtoId = Number(dados.produtoId);
    const eventoId = dados.eventoId;

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        throw new Error("A quantidade deve ser um inteiro maior que zero");
    }

    if (!Number.isInteger(ordemProducaoId) || ordemProducaoId <= 0) {
        throw new Error("ordemProducaoId inválido");
    }

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
        throw new Error("produtoId inválido");
    }

    if (typeof eventoId !== "string" || !eventoId.trim()) {
        throw new Error("eventoId é obrigatório e deve ser único");
    }

    const evento = eventoId.trim();

    const existente = await prisma.producao.findUnique({
        where: { eventoId: evento },
        include: {
            etiquetas: true,
            itemOrdemProducao: { include: { produto: true } }
        }
    });

    if (existente) {
        return {
            producao: existente,
            etiqueta: existente.etiquetas[0] || null,
            duplicado: true
        };
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const ordem = await tx.ordemProducao.findUnique({
                where: { id: ordemProducaoId },
                include: { itens: true }
            });

            if (!ordem) {
                throw new Error("Ordem de produção não encontrada");
            }

            if (ordem.status !== "EM_PRODUCAO") {
                throw new Error("A ordem de produção não está em produção");
            }

            const item = await tx.itemOrdemProducao.findUnique({
                where: {
                    ordemProducaoId_produtoId: {
                        ordemProducaoId,
                        produtoId
                    }
                },
                include: { produto: true }
            });

            if (!item) {
                throw new Error("Produto não encontrado nesta ordem de produção");
            }

            const producoesItem = await tx.producao.findMany({
                where: { itemOrdemProducaoId: item.id }
            });

            const totalItem = producoesItem.reduce(
                (total, p) => total + p.quantidade,
                0
            );

            if (totalItem + quantidade > item.quantidade) {
                throw new Error("Produção ultrapassa a meta deste tipo de peça");
            }

            const producao = await tx.producao.create({
                data: {
                    quantidade,
                    ordemProducaoId,
                    itemOrdemProducaoId: item.id,
                    eventoId: evento
                },
                include: {
                    itemOrdemProducao: { include: { produto: true } }
                }
            });

            const etiqueta = await tx.etiqueta.create({
                data: {
                    codigo: `ETQ-${String(producao.id).padStart(6, "0")}`,
                    status: "PENDENTE",
                    producaoId: producao.id
                }
            });

            const producoesOrdem = await tx.producao.findMany({
                where: { ordemProducaoId }
            });

            const todosItensConcluidos = ordem.itens.every((itemOrdem) => {
                const total = producoesOrdem
                    .filter((p) => p.itemOrdemProducaoId === itemOrdem.id)
                    .reduce((soma, p) => soma + p.quantidade, 0);

                return total >= itemOrdem.quantidade;
            });

            if (todosItensConcluidos) {
                await tx.ordemProducao.update({
                    where: { id: ordemProducaoId },
                    data: { status: "CONCLUIDA" }
                });

                const proximaOrdem = await tx.ordemProducao.findFirst({
                    where: { status: "AGUARDANDO" },
                    orderBy: { id: "asc" }
                });

                if (proximaOrdem) {
                    await tx.ordemProducao.update({
                        where: { id: proximaOrdem.id },
                        data: { status: "EM_PRODUCAO" }
                    });
                }
            }

            return { producao, etiqueta, duplicado: false };
        });
    } catch (erro) {
        if (erro.code === "P2002") {
            const existente = await prisma.producao.findUnique({
                where: { eventoId: evento },
                include: {
                    etiquetas: true,
                    itemOrdemProducao: { include: { produto: true } }
                }
            });

            if (existente) {
                return {
                    producao: existente,
                    etiqueta: existente.etiquetas[0] || null,
                    duplicado: true
                };
            }
        }

        throw erro;
    }
};

const listarProducoes = async () => {
    return prisma.producao.findMany({
        include: {
            ordemProducao: true,
            itemOrdemProducao: {
                include: { produto: true }
            },
            etiquetas: true
        },
        orderBy: { id: "desc" }
    });
};

module.exports = {
    finalizarProducao,
    listarProducoes
};
