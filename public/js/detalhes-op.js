async function carregarDetalhesOP() {

    try {

        // Pega o ID da OP na URL
        const parametros = new URLSearchParams(
            window.location.search
        );

        const idOP = Number(
            parametros.get("id")
        );

        if (!idOP) {
            throw new Error(
                "ID da ordem de produção não informado"
            );
        }


        // Busca as ordens
        const respostaOrdens =
            await fetch("/api/ordens");

        const ordens =
            await respostaOrdens.json();


        // Procura a OP pelo ID
        const ordem =
            ordens.find(
                ordem => ordem.id === idOP
            );


        if (!ordem) {
            throw new Error(
                "Ordem de produção não encontrada"
            );
        }


        // Busca todas as produções
        const respostaProducoes =
            await fetch("/api/producoes");

        const producoes =
            await respostaProducoes.json();


        // Filtra somente as produções dessa OP
        const producoesDaOP =
            producoes.filter(
                producao =>
                    producao.ordemProducaoId === idOP
            );


        // Renderiza os dados
        renderizarDetalhes(
            ordem,
            producoesDaOP
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar detalhes da OP:",
            erro
        );

        document.getElementById(
            "tituloOP"
        ).textContent = "Erro";

        document.getElementById(
            "produtoOP"
        ).textContent =
            erro.message;

    }

}


function renderizarDetalhes(
    ordem,
    producoes
) {

    // =========================
    // INFORMAÇÕES DA OP
    // =========================

    document.getElementById(
        "tituloOP"
    ).textContent =
        ordem.numero;

    document.getElementById(
        "produtoOP"
    ).textContent =
        ordem.produto?.nome ||
        "Produto não informado";


    // =========================
    // CÁLCULO DA PRODUÇÃO
    // =========================

    let produzido = 0;

    producoes.forEach(
        producao => {
            produzido += producao.quantidade;
        }
    );


    const meta =
        ordem.quantidade;

    const restante =
        Math.max(
            meta - produzido,
            0
        );


    let percentual = 0;

    if (meta > 0) {

        percentual =
            Math.round(
                (produzido / meta) * 100
            );

    }

    percentual =
        Math.min(
            percentual,
            100
        );


    // =========================
    // RESUMO
    // =========================

    document.getElementById(
        "metaOP"
    ).textContent =
        `${meta} peças`;

    document.getElementById(
        "produzidoOP"
    ).textContent =
        `${produzido} peças`;

    document.getElementById(
        "restanteOP"
    ).textContent =
        `${restante} peças`;

    document.getElementById(
        "statusOP"
    ).textContent =
        ordem.status;

    document.getElementById(
        "percentualOP"
    ).textContent =
        `${percentual}%`;

    document.getElementById(
        "barraOP"
    ).style.width =
        `${percentual}%`;


    // =========================
    // HISTÓRICO
    // =========================

    renderizarProducoes(
        producoes
    );

}


function renderizarProducoes(
    producoes
) {

    const container =
        document.getElementById(
            "producoesOPContainer"
        );


    if (producoes.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                Nenhuma produção registrada
                para esta ordem.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    producoes.forEach(
        (producao, indice) => {

            const elemento =
                document.createElement(
                    "div"
                );

            elemento.className =
                "production-history-item";


            // Formata data e hora
            const data =
                new Date(
                    producao.dataHora
                );

            const dataFormatada =
                data.toLocaleDateString(
                    "pt-BR"
                );

            const horaFormatada =
                data.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            // Etiquetas
            let etiquetasHTML =
                "Nenhuma etiqueta";

            if (
                producao.etiquetas &&
                producao.etiquetas.length > 0
            ) {

                etiquetasHTML =
                    producao.etiquetas
                        .map(
                            etiqueta => `
                                <span class="history-label">
                                    ${etiqueta.codigo}
                                </span>
                            `
                        )
                        .join("");

            }


            elemento.innerHTML = `

                <div class="production-history-number">
                    ${indice + 1}
                </div>


                <div class="production-history-info">

                    <strong>
                        ${producao.quantidade}
                        ${
                            producao.quantidade === 1
                                ? "peça"
                                : "peças"
                        }
                    </strong>

                    <span>
                        ${dataFormatada}
                        às
                        ${horaFormatada}
                    </span>

                </div>


                <div class="production-history-labels">

                    ${etiquetasHTML}

                </div>

            `;


            container.appendChild(
                elemento
            );

        }
    );

}


// Inicia a página
carregarDetalhesOP();