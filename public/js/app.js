// =========================================================
// CONFIGURAÇÃO
// =========================================================

const API_ORDENS = "/api/ordens";
const API_PRODUCOES = "/api/producoes";


// =========================================================
// CARREGAR DADOS
// =========================================================

async function carregarDados() {

    try {

        const respostaOrdens = await fetch(API_ORDENS);
        const ordens = await respostaOrdens.json();

        const respostaProducoes = await fetch(API_PRODUCOES);
        const producoes = await respostaProducoes.json();

        const respostaHistorico = await fetch(
            "/api/ordens/historico"
        );

        const historico = await respostaHistorico.json();

        // Atualiza o Dashboard
        atualizarDashboard(ordens, producoes);

        //atualiza a ultima produção
      // A última produção será atualizada dentro de atualizarDashboard()


        // Atualiza histórico
        renderizarHistorico(historico);

    } catch (erro) {

        console.error(
            "Erro ao carregar dados:",
            erro
        );

    }

}

// =========================================================
// ATUALIZAR DASHBOARD
// =========================================================

function atualizarDashboard(ordens, producoes) {

    // -----------------------------------------------------
    // ORDENS EM PRODUÇÃO
    // -----------------------------------------------------

   


    // -----------------------------------------------------
    // ENCONTRAR OP ATIVA
    // -----------------------------------------------------

    const ordemAtiva = ordens.find(
        ordem =>
            String(ordem.status)
                .trim()
                .toUpperCase() === "EM_PRODUCAO"
    );


    // -----------------------------------------------------
    // SE NÃO EXISTIR OP ATIVA
    // -----------------------------------------------------

    if (!ordemAtiva) {

        document.getElementById("ordemNumero").textContent =
            "Nenhuma OP ativa";

        document.getElementById("produtoNome").textContent =
            "Nenhuma ordem em produção";

        document.getElementById("ordemStatus").textContent =
            "AGUARDANDO";

        document.getElementById("progressoPercentual").textContent =
            "0%";

        document.getElementById("progressoQuantidade").textContent =
            "0 / 0 peças";

        document.getElementById("progressoRestante").textContent =
            "0 restantes";

        document.getElementById("progressoBarra").style.width =
            "0%";

        document.getElementById("totalMeta").textContent =
            "0";

        document.getElementById("totalProduzido").textContent =
            "0";

        document.getElementById("totalRestante").textContent =
            "0";

        return;
    }


    // -----------------------------------------------------
    // INFORMAÇÕES DA OP
    // -----------------------------------------------------

   
    // INFORMAÇÕES DA OP
    document.getElementById("ordemNumero").textContent =
        ordemAtiva.numero;

    const itens = ordemAtiva.itens || [];

    const nomesProdutos = itens
        .map(item => item.produto?.nome)
        .filter(Boolean);

    document.getElementById("produtoNome").textContent =
        nomesProdutos.length > 0
            ? nomesProdutos.join(", ")
            : "Produtos não informados";

    // META TOTAL DA ORDEM
    const meta = itens.reduce(
        (total, item) => total + Number(item.quantidade || 0),
        0
    );

    // PRODUÇÃO TOTAL DA ORDEM
    const producoesDaOrdem = producoes.filter(
        producao =>
            Number(producao.ordemProducaoId) === Number(ordemAtiva.id)
    );

    const produzido = producoesDaOrdem.reduce(
        (total, producao) => total + Number(producao.quantidade || 0),
        0
    );

    // RESTANTE
    const restante = Math.max(meta - produzido, 0);

    // PERCENTUAL
    const percentual = meta > 0
        ? Math.min(Math.round((produzido / meta) * 100), 100)
        : 0;

    // RESUMO
    document.getElementById("totalMeta").textContent = meta;
    document.getElementById("totalProduzido").textContent = produzido;
    document.getElementById("totalRestante").textContent = restante;

    // PROGRESSO
    document.getElementById("progressoPercentual").textContent =
        `${percentual}%`;

    document.getElementById("progressoQuantidade").textContent =
        `${produzido} / ${meta} peças`;

    document.getElementById("progressoRestante").textContent =
        `${restante} restantes`;

    document.getElementById("progressoBarra").style.width =
        `${percentual}%`;

    // STATUS
    document.getElementById("ordemStatus").textContent =
        ordemAtiva.status === "CONCLUIDA"
            ? "CONCLUÍDA"
            : produzido > 0
                ? "EM PRODUÇÃO"
                : "AGUARDANDO";

    
  
    // ÚLTIMA PRODUÇÃO DA ORDEM
   
    // ÚLTIMA PRODUÇÃO DA ORDEM
    const ultimaProducao = [...producoesDaOrdem].sort(
        (a, b) => new Date(b.dataHora) - new Date(a.dataHora)
    )[0];

    const elementoUltimaProducao =
        document.getElementById("ultimaProducao");

    const elementoDataHora =
        document.getElementById("dataHoraUltimaProducao");

    if (ultimaProducao) {
        // Quantidade produzida
        if (elementoUltimaProducao) {
            elementoUltimaProducao.textContent =
                `+${ultimaProducao.quantidade} peça(s) produzida(s)`;
        }

        // Data e hora do registro
        if (elementoDataHora) {
            const dataRegistro = new Date(ultimaProducao.dataHora);

            elementoDataHora.textContent =
                !Number.isNaN(dataRegistro.getTime())
                    ? dataRegistro.toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short"
                    })
                    : "Data e hora indisponíveis";
        }
    } else {
        if (elementoUltimaProducao) {
            elementoUltimaProducao.textContent =
                "Aguardando produção...";
        }

        if (elementoDataHora) {
            elementoDataHora.textContent =
                "Nenhuma produção registrada";
        }
     }
 }

// =========================================================
// TABELA DE PRODUÇÕES
// =========================================================

function atualizarTabelaProducoes(producoes) {

    const tabela =
        document.getElementById("producoesTabela");


    // Nenhuma produção

    if (producoes.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    Nenhuma produção registrada.
                </td>
            </tr>
        `;

        return;
    }


    // Mais recentes primeiro

    const producoesOrdenadas = [...producoes].sort(
        (a, b) =>
            new Date(b.dataHora) -
            new Date(a.dataHora)
    );


    // Mostra somente as últimas 10

    const producoesRecentes =
        producoesOrdenadas.slice(0, 10);


    tabela.innerHTML = "";


    producoesRecentes.forEach(producao => {

        const ordem =
            producao.ordemProducao;


        let etiqueta = "—";


        if (
            producao.etiquetas &&
            producao.etiquetas.length > 0
        ) {

            etiqueta =
                producao.etiquetas[0].codigo;

        }


        const data =
            new Date(producao.dataHora);


        const linha = document.createElement("tr");


        linha.innerHTML = `
            <td>
                #${producao.id}
            </td>

            <td>
                ${ordem ? ordem.numero : "—"}
            </td>

            <td>
                ${producao.quantidade}
            </td>

            <td>
                ${data.toLocaleString("pt-BR")}
            </td>

            <td>
                ${etiqueta}
            </td>
        `;


        tabela.appendChild(linha);

    });

}

// =========================================================
// ORDENS EM PRODUÇÃO
// =========================================================

function renderizarOrdens(ordens, producoes) {

    const container =
        document.getElementById("ordensContainer");


    const ordensAtivas = ordens.filter(
    ordem => String(ordem.status).trim().toUpperCase() === "EM_PRODUCAO");

    if (ordensAtivas.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                Nenhuma ordem em produção.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    ordensAtivas.forEach(ordem => {

        const producoesDaOrdem =
            producoes.filter(
                producao =>
                    producao.ordemProducaoId === ordem.id
            );


        let produzido = 0;


        producoesDaOrdem.forEach(producao => {

            produzido += producao.quantidade;

        });


        const meta = ordem.quantidade;


        const restante =
            Math.max(meta - produzido, 0);


        let percentual = 0;


        if (meta > 0) {

            percentual =
                Math.round((produzido / meta) * 100);

        }


        percentual =
            Math.min(percentual, 100);


        const produto =
            ordem.produto?.nome || "Produto não informado";


        const elemento =
            document.createElement("div");


        elemento.className = "order-item";


        elemento.innerHTML = `

            <div class="order-item-header">

                <div class="order-info">

                    <strong>
                        ${ordem.numero}
                    </strong>

                    <span>
                        ${produto}
                    </span>

                </div>

                <div class="order-percent">
                    ${percentual}%
                </div>

            </div>


            <div class="order-progress-container">

                <div
                    class="order-progress-bar"
                    style="width: ${percentual}%">
                </div>

            </div>


            <div class="order-footer">

                <span>
                    ${produzido} / ${meta} peças
                </span>

                <span>
                    ${restante} restantes
                </span>

            </div>

        `;


        container.appendChild(elemento);

    });

}

function renderizarHistorico(historico) {

    const container =
        document.getElementById("historicoContainer");

    if (!container) {
        return;
    }

    if (historico.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                Nenhuma ordem concluída ainda.
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    historico.forEach(ordem => {

        let produzido = 0;

        ordem.producoes.forEach(producao => {
            produzido += producao.quantidade;
        });

        const meta = ordem.quantidade;

        let percentual = 0;

        if (meta > 0) {
            percentual =
                Math.round((produzido / meta) * 100);
        }

        percentual = Math.min(percentual, 100);

        const produto =
            ordem.produto?.nome ||
            "Produto não informado";

        const elemento =
            document.createElement("div");

        elemento.className = "history-item";

        elemento.innerHTML = `
            <div class="history-item-header">

                <div class="history-info">

                    <strong>
                        ${ordem.numero}
                    </strong>

                    <span>
                        ${produto}
                    </span>

                </div>

                <div class="history-status">
                    CONCLUÍDA
                </div>

            </div>

            <div class="history-progress-container">

                <div
                    class="history-progress-bar"
                    style="width: ${percentual}%">
                </div>

            </div>

            <div class="history-footer">

                <span>
                    ${produzido} / ${meta} peças
                </span>

                <span>
                    ${ordem.producoes.length} produção(ões)
                </span>

            </div>
        `;

        container.appendChild(elemento);
    });
}


// =========================================================
// INICIAR DASHBOARD
// =========================================================

carregarDados();

//Atualiza em tempo real- 5s
setInterval(() => {
    carregarDados();
}, 5000);