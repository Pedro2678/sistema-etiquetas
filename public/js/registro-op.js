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
    const container = document.getElementById(
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
        const elemento = document.createElement("div");
        elemento.className = "history-op-item";

        // Os produtos e as metas agora ficam em ordem.itens
        const itens = ordem.itens || [];

        const meta = itens.reduce(
            (total, item) =>
                total + Number(item.quantidade || 0),
            0
        );

        const produtos = itens
            .map(item => item.produto?.nome)
            .filter(Boolean);

        const produtoTexto = produtos.length > 0
            ? produtos.join(", ")
            : "Produtos não informados";

        const status = String(ordem.status || "")
            .trim()
            .toUpperCase();

        let statusTexto;

        if (status === "CONCLUIDA") {
            statusTexto = "CONCLUÍDA";
        } else if (status === "EM_PRODUCAO") {
            statusTexto = "EM PRODUÇÃO";
        } else if (status === "AGUARDANDO") {
            statusTexto = "AGUARDANDO";
        } else {
            statusTexto = status || "Não informado";
        }

        elemento.innerHTML = `
            <div class="history-op-info">
                <strong>${ordem.numero}</strong>
                <span></span>
            </div>

            <div class="history-op-quantity">
                <span>Meta</span>
                <strong>${meta} peças</strong>
            </div>

            <div class="history-op-status ${status.toLowerCase()}">
                ${statusTexto}
            </div>

            <div class="history-op-arrow">
                →
            </div>
        `;

        // Inserimos o nome dos produtos como texto,
        // sem interpretar os nomes como HTML.
        elemento.querySelector(
            ".history-op-info span"
        ).textContent = produtoTexto;

        elemento.addEventListener("click", () => {
            window.location.href =
                `/detalhes-op.html?id=${ordem.id}`;
        });

        container.appendChild(elemento);
    });
}



carregarOrdens();
setInterval(() => {
    carregarOrdens();
}, 5000);