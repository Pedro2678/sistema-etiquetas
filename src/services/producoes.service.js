
const prisma = require("../database/prisma");

const finalizarProducao = async (dados) => {
    const quantidade = Number(dados.quantidade);
    const ordemProducaoId = Number(dados.ordemProducaoId);
    const itemOrdemProducaoId = Number(dados.itemOrdemProducaoId);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        throw new Error("A quantidade deve ser um inteiro maior que zero");
    }

    if (!Number.isInteger(ordemProducaoId) || ordemProducaoId <= 0) {
        throw new Error("ordemProducaoId inválido");
    }

    if (!Number.isInteger(itemOrdemProducaoId) || itemOrdemProducaoId <= 0) {
        throw new Error("itemOrdemProducaoId inválido");
    }

    let eventoId = dados.eventoId;

    if (eventoId !== undefined) {
        if (typeof eventoId !== "string" || !eventoId.trim()) {
            throw new Error("O identificador do evento é inválido");
        }
        eventoId = eventoId.trim();
    }

    if (eventoId) {
        const existente = await prisma.producao.findUnique({
            where: { eventoId },
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

    try {
        return await prisma.$transaction(async (tx) => {
            const item = await tx.itemOrdemProducao.findUnique({
                where: { id: itemOrdemProducaoId },
                include: { produto: true }
            });

            if (!item || item.ordemProducaoId !== ordemProducaoId) {
                throw new Error("Item não encontrado nesta ordem de produção");
            }

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

            const producoesItem = await tx.producao.findMany({
                where: { itemOrdemProducaoId }
            });

            const totalItem = producoesItem.reduce(
                (total, producao) => total + producao.quantidade,
                0
            );

            if (totalItem + quantidade > item.quantidade) {
                throw new Error("Produção ultrapassa a meta deste tipo de peça");
            }

            const producao = await tx.producao.create({
                data: {
                    quantidade,
                    ordemProducaoId,
                    itemOrdemProducaoId,
                    ...(eventoId ? { eventoId } : {})
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
                const totalProduzido = producoesOrdem
                    .filter((p) => p.itemOrdemProducaoId === itemOrdem.id)
                    .reduce((total, p) => total + p.quantidade, 0);

                return totalProduzido >= itemOrdem.quantidade;
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
        if (eventoId && erro.code === "P2002") {
            const existente = await prisma.producao.findUnique({
                where: { eventoId },
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
    return await prisma.producao.findMany({
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
