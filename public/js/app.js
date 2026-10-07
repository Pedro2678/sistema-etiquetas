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

          console.log("ORDENS:", ordens);
        console.log("PRODUÇÕES:", producoes);

        // Atualiza o Dashboard
        atualizarDashboard(ordens, producoes);

        // Atualiza tabela
        atualizarTabelaProducoes(producoes);

    } catch (erro) {

        console.error("Erro ao carregar dados:", erro);

    }

}


// =========================================================
// ATUALIZAR DASHBOARD
// =========================================================

function atualizarDashboard(ordens, producoes) {
   
    // -----------------------------------------------------
    // TOTAL DE ORDENS
    // -----------------------------------------------------

    document.getElementById("totalOrdens").textContent = ordens.length;
    renderizarOrdens(ordens, producoes);


    // -----------------------------------------------------
    // TOTAL DE PRODUÇÕES
    // -----------------------------------------------------

    document.getElementById("totalProducoes").textContent = producoes.length;


    // -----------------------------------------------------
    // TOTAL DE ETIQUETAS
    // -----------------------------------------------------

    let totalEtiquetas = 0;

    producoes.forEach(producao => {

        if (producao.etiquetas) {
            totalEtiquetas += producao.etiquetas.length;
        }

    });

    document.getElementById("totalEtiquetas").textContent = totalEtiquetas;


    // -----------------------------------------------------
    // ENCONTRAR OP ATIVA
    // -----------------------------------------------------

    const ordemAtiva = ordens.find(
    ordem => String(ordem.status).trim().toUpperCase() === "EM_PRODUCAO"
);


    // Se não existir uma OP ativa
    if (!ordemAtiva) {

        document.getElementById("opAtiva").textContent = "—";

        document.getElementById("produtoAtivo").textContent =
            "Nenhuma ordem ativa";

        document.getElementById("metaProducao").textContent = "0";

        document.getElementById("totalProduzido").textContent = "0";

        document.getElementById("totalRestante").textContent = "0";

        document.getElementById("percentualProducao").textContent = "0%";

        document.getElementById("progressoTexto").textContent =
            "0 / 0 peças";

        document.getElementById("producaoTitulo").textContent =
            "Nenhuma produção ativa";

        document.getElementById("progressBar").style.width = "0%";

        return;
    }


    // -----------------------------------------------------
    // DADOS DA OP ATIVA
    // -----------------------------------------------------

    document.getElementById("opAtiva").textContent =
        ordemAtiva.numero;


    if (ordemAtiva.produto) {

        document.getElementById("produtoAtivo").textContent =
            ordemAtiva.produto.nome;

    } else {

        document.getElementById("produtoAtivo").textContent =
            "Produto não informado";

    }


    const meta = ordemAtiva.quantidade;


    // -----------------------------------------------------
    // PRODUÇÃO DA OP ATIVA
    // -----------------------------------------------------

    const producoesDaOrdem = producoes.filter(
        producao =>
            producao.ordemProducaoId === ordemAtiva.id
    );


    let produzido = 0;

    producoesDaOrdem.forEach(producao => {

        produzido += producao.quantidade;

    });


    // -----------------------------------------------------
    // RESTANTE
    // -----------------------------------------------------

    const restante = Math.max(meta - produzido, 0);


    // -----------------------------------------------------
    // PERCENTUAL
    // -----------------------------------------------------

    let percentual = 0;

    if (meta > 0) {

        percentual = Math.round(
            (produzido / meta) * 100
        );

    }

    percentual = Math.min(percentual, 100);


    // -----------------------------------------------------
    // ATUALIZAR CARDS
    // -----------------------------------------------------

    document.getElementById("metaProducao").textContent =
        meta;

    document.getElementById("totalProduzido").textContent =
        produzido;

    document.getElementById("totalRestante").textContent =
        restante;


    // -----------------------------------------------------
    // ATUALIZAR PRODUÇÃO ATUAL
    // -----------------------------------------------------

    document.getElementById("producaoTitulo").textContent =
        `${ordemAtiva.numero} — ${ordemAtiva.produto?.nome || "Produto"}`;


    document.getElementById("percentualProducao").textContent =
        `${percentual}%`;


    document.getElementById("progressoTexto").textContent =
        `${produzido} / ${meta} peças`;


    document.getElementById("progressBar").style.width =
        `${percentual}%`;


    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    const statusElemento =
        document.getElementById("statusProducao");


    if (produzido >= meta) {

        statusElemento.textContent =
            "● Produção concluída";

        statusElemento.style.color = "#2563eb";

    } else if (produzido > 0) {

        statusElemento.textContent =
            "● Produção em andamento";

        statusElemento.style.color = "#16a34a";

    } else {

        statusElemento.textContent =
            "● Aguardando produção";

        statusElemento.style.color = "#6b7280";

    }


    // -----------------------------------------------------
    // ÚLTIMA PRODUÇÃO
    // -----------------------------------------------------

    atualizarUltimaProducao(producoesDaOrdem);

}


// =========================================================
// ÚLTIMA PRODUÇÃO
// =========================================================

function atualizarUltimaProducao(producoes) {

    if (producoes.length === 0) {

        document.getElementById("ultimaPeca").textContent =
            "—";

        document.getElementById("ultimaData").textContent =
            "Nenhuma produção registrada";

        return;
    }


    // Ordena da mais recente para a mais antiga

    const producoesOrdenadas = [...producoes].sort(
        (a, b) =>
            new Date(b.dataHora) -
            new Date(a.dataHora)
    );


    const ultima = producoesOrdenadas[0];


    document.getElementById("ultimaPeca").textContent =
        `Peça #${ultima.id}`;


    const data = new Date(ultima.dataHora);


    document.getElementById("ultimaData").textContent =
        data.toLocaleString("pt-BR");

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


// =========================================================
// INICIAR DASHBOARD
// =========================================================

carregarDados();