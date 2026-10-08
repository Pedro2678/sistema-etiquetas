async function carregarOrdens() {

    try {

        const resposta = await fetch("/api/ordens");

        const ordens = await resposta.json();

        renderizarOrdens(ordens);

    } catch (erro) {

        console.error(
            "Erro ao carregar ordens:",
            erro
        );

        const container =
            document.getElementById(
                "ordensRegistroContainer"
            );

        container.innerHTML = `
            <div class="empty-message">
                Erro ao carregar as ordens de produção.
            </div>
        `;
    }
}


function renderizarOrdens(ordens) {

    const container =
        document.getElementById(
            "ordensRegistroContainer"
        );

    if (!container) {
        return;
    }

    if (ordens.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                Nenhuma ordem de produção cadastrada.
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    ordens.forEach(ordem => {

        const elemento =
            document.createElement("div");

        elemento.className = "history-op-item";

        const produto =
            ordem.produto?.nome ||
            "Produto não informado";

        const status =
            String(ordem.status)
                .trim()
                .toUpperCase();

        const statusTexto =
            status === "CONCLUIDA"
                ? "CONCLUÍDA"
                : "EM PRODUÇÃO";

        elemento.innerHTML = `
            <div class="history-op-info">

                <strong>
                    ${ordem.numero}
                </strong>

                <span>
                    ${produto}
                </span>

            </div>

            <div class="history-op-quantity">

                <span>
                    Meta
                </span>

                <strong>
                    ${ordem.quantidade} peças
                </strong>

            </div>

            <div class="history-op-status ${status.toLowerCase()}">
                ${statusTexto}
            </div>

            <div class="history-op-arrow">
                →
            </div>
        `;

        elemento.addEventListener(
            "click",
            () => {

                window.location.href =
                    `/detalhes-op.html?id=${ordem.id}`;

            }
        );

        container.appendChild(elemento);

    });
}


carregarOrdens();