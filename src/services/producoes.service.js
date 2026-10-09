const prisma = require("../database/prisma");

const finalizarProducao = async (dados) => {  
    if (
        !Number.isInteger(dados.quantidade) ||
        dados.quantidade <= 0
    ) {
        throw new Error(
            "A quantidade deve ser um número inteiro maior que zero"
        );
    }

    // Valida o identificador do evento, quando enviado
    let eventoId = dados.eventoId;

    if (eventoId !== undefined) {
        if (
            typeof eventoId !== "string" ||
            eventoId.trim() === ""
        ) {
            throw new Error(
                "O identificador do evento é inválido"
            );
        }

        eventoId = eventoId.trim();
    }

    // Verifica se esse evento já foi processado
    if (eventoId) {
        const existente = await prisma.producao.findUnique({
            where: {
                eventoId: eventoId
            },
            include: {
                etiquetas: true
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

            const ordem = await tx.ordemProducao.findUnique({
                where: {
                    id: dados.ordemProducaoId
                }
            });

            if (!ordem) {
                throw new Error(
                    "Ordem de produção não encontrada"
                );
            }

            if (ordem.status === "CONCLUIDA") {
                throw new Error(
                    "Ordem de produção já concluída"
                );
            }

            if (ordem.status !== "EM_PRODUCAO") {
                throw new Error(
                    "A ordem de produção não está em produção"
                );
            }

            const producoes = await tx.producao.findMany({
                where: {
                    ordemProducaoId: ordem.id
                }
            });

            const produzido = producoes.reduce(
                (total, producao) =>
                    total + producao.quantidade,
                0
            );

            const novaQuantidade =
                produzido + dados.quantidade;

            if (novaQuantidade > ordem.quantidade) {
                throw new Error(
                    "Produção ultrapassa a meta da ordem de produção"
                );
            }

            // Registra a produção com o identificador do evento
            const producao = await tx.producao.create({
                data: {
                    quantidade: dados.quantidade,
                    ordemProducaoId: ordem.id,
                    ...(eventoId ? { eventoId } : {})
                }
            });

            // Cria a etiqueta vinculada à produção
            const etiqueta = await tx.etiqueta.create({
                data: {
                    codigo: `ETQ-${String(producao.id).padStart(6, "0")}`,
                    status: "PENDENTE",
                    producaoId: producao.id
                }
            });

            // Conclui a OP quando a meta é atingida
            if (novaQuantidade === ordem.quantidade) {

                await tx.ordemProducao.update({
                    where: {
                        id: ordem.id
                    },
                    data: {
                        status: "CONCLUIDA"
                    }
                });

                // Busca a próxima OP aguardando
                const proximaOrdem =
                    await tx.ordemProducao.findFirst({
                        where: {
                            status: "AGUARDANDO"
                        },
                        orderBy: {
                            id: "asc"
                        }
                    });

                // Ativa a próxima OP da fila
                if (proximaOrdem) {
                    await tx.ordemProducao.update({
                        where: {
                            id: proximaOrdem.id
                        },
                        data: {
                            status: "EM_PRODUCAO"
                        }
                    });
                }
            }

            return {
                producao,
                etiqueta,
                duplicado: false
            };
        });

    } catch (erro) {

        // Trata uma possível repetição simultânea do mesmo evento
        if (eventoId && erro.code === "P2002") {

            const existente = await prisma.producao.findUnique({
                where: {
                    eventoId: eventoId
                },
                include: {
                    etiquetas: true
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
            etiquetas: true
        }
    });

};

module.exports = {
    finalizarProducao,
    listarProducoes
};