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

    const ordem = await prisma.ordemProducao.findUnique({
        where: {
            id: dados.ordemProducaoId
        }
    });

    if (!ordem) {
        throw new Error("Ordem de produção não encontrada");
    }

    if (ordem.status === "CONCLUIDA") {
        throw new Error("Ordem de produção já concluída");
    }

    const producoes = await prisma.producao.findMany({
        where: {
            ordemProducaoId: ordem.id
        }
    });

    let produzido = 0;

    producoes.forEach(producao => {
        produzido += producao.quantidade;
    });

    const novaQuantidade = produzido + dados.quantidade;

    if (novaQuantidade > ordem.quantidade) {
        throw new Error(
            "Produção ultrapassa a meta da ordem de produção"
        );
    }

    const producao = await prisma.producao.create({
        data: {
            quantidade: dados.quantidade,
            ordemProducaoId: ordem.id
        }
    });

    const etiqueta = await prisma.etiqueta.create({
        data: {
            codigo: `ETQ-${String(producao.id).padStart(6, "0")}`,
            status: "PENDENTE",
            producaoId: producao.id
        }
    });

    if (novaQuantidade === ordem.quantidade) {

    // Conclui a OP atual
    await prisma.ordemProducao.update({
        where: {
            id: ordem.id
        },
        data: {
            status: "CONCLUIDA"
        }
    });


    // Procura a próxima OP da fila
    const proximaOrdem =
        await prisma.ordemProducao.findFirst({
            where: {
                status: "AGUARDANDO"
            },
            orderBy: {
                id: "asc"
            }
        });


    // Coloca a próxima OP em produção
    if (proximaOrdem) {

        await prisma.ordemProducao.update({
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