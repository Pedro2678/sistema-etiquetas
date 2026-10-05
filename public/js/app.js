async function carregarDados() {
    await carregarOrdens();
    await carregarProducoes();
}


// ==============================
// ORDENS
// ==============================

async function carregarOrdens() {

    try {

        const resposta = await fetch("/api/ordens");

        const ordens = await resposta.json();

        document.getElementById("totalOrdens").textContent = ordens.length;

        const container = document.getElementById("ordensContainer");

        container.innerHTML = "";

        if (ordens.length === 0) {

            container.innerHTML = `
                <div class="loading">
                    Nenhuma ordem cadastrada.
                </div>
            `;

            return;
        }

        for (const ordem of ordens) {

            const producoes = await buscarProducoesDaOrdem(ordem.id);

            const quantidadeProduzida = producoes.reduce(
                (total, producao) => total + producao.quantidade,
                0
            );

            const percentual = ordem.quantidade > 0
                ? Math.min(
                    Math.round((quantidadeProduzida / ordem.quantidade) * 100),
                    100
                )
                : 0;

            const produtoNome = ordem.produto
                ? ordem.produto.nome
                : "Produto não informado";

            container.innerHTML += `

                <div class="ordem">

                    <div class="ordem-top">

                        <span class="ordem-numero">
                            ${ordem.numero}
                        </span>

                        <span class="badge">
                            ${ordem.status}
                        </span>

                    </div>

                    <div class="ordem-produto">
                        ${produtoNome}
                    </div>

                    <div class="progresso-info">

                        <span>
                            ${quantidadeProduzida} / ${ordem.quantidade} peças
                        </span>

                        <strong>
                            ${percentual}%
                        </strong>

                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress"
                            style="width: ${percentual}%"
                        ></div>

                    </div>

                </div>
            `;
        }

    } catch (erro) {

        console.error("Erro ao carregar ordens:", erro);

    }
}


// ==============================
// PRODUÇÕES
// ==============================

async function carregarProducoes() {

    try {

        const resposta = await fetch("/api/producoes");

        const producoes = await resposta.json();

        const tabela = document.getElementById("producoesTabela");

        document.getElementById("totalProduzidas").textContent =
            producoes.reduce(
                (total, producao) => total + producao.quantidade,
                0
            );

        let totalEtiquetas = 0;

        tabela.innerHTML = "";

        if (producoes.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="5" class="loading">
                        Nenhuma produção registrada.
                    </td>
                </tr>
            `;

            document.getElementById("totalEtiquetas").textContent = 0;

            return;
        }

        const recentes = [...producoes]
            .reverse()
            .slice(0, 10);

        for (const producao of recentes) {

            const etiquetas = producao.etiquetas || [];

            totalEtiquetas += etiquetas.length;

            const etiqueta = etiquetas.length > 0
                ? etiquetas[0].codigo
                : "-";

            const ordem = producao.ordemProducao
                ? producao.ordemProducao.numero
                : "-";

            const data = new Date(producao.dataHora);

            tabela.innerHTML += `

                <tr>

                    <td>
                        #${producao.id}
                    </td>

                    <td>
                        ${ordem}
                    </td>

                    <td>
                        ${producao.quantidade}
                    </td>

                    <td>
                        ${data.toLocaleString("pt-BR")}
                    </td>

                    <td class="etiqueta">
                        ${etiqueta}
                    </td>

                </tr>
            `;
        }

        document.getElementById("totalEtiquetas").textContent =
            totalEtiquetas;

    } catch (erro) {

        console.error("Erro ao carregar produções:", erro);

    }
}


// ==============================
// PRODUÇÕES DE UMA ORDEM
// ==============================

async function buscarProducoesDaOrdem(ordemId) {

    try {

        const resposta = await fetch("/api/producoes");

        const producoes = await resposta.json();

        return producoes.filter(
            producao => producao.ordemProducaoId === ordemId
        );

    } catch (erro) {

        console.error(erro);

        return [];
    }
}


// ==============================
// INICIALIZAÇÃO
// ==============================

carregarDados();