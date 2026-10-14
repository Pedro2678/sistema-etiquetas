
let graficoOP = null;
let tipoGraficoAtual = "bar";

async function carregarDetalhesOP() {
    try {
        const parametros = new URLSearchParams(window.location.search);
        const idOP = Number(parametros.get("id"));

        if (!idOP) {
            throw new Error("ID da ordem de produção não informado.");
        }

        const [respostaOrdens, respostaProducoes] = await Promise.all([
            fetch("/api/ordens"),
            fetch("/api/producoes")
        ]);

        if (!respostaOrdens.ok || !respostaProducoes.ok) {
            throw new Error("Não foi possível consultar a API.");
        }

        const ordens = await respostaOrdens.json();
        const producoes = await respostaProducoes.json();

        const ordem = ordens.find(item => item.id === idOP);

        if (!ordem) {
            throw new Error("Ordem de produção não encontrada.");
        }

        const producoesDaOP = producoes.filter(
            producao => producao.ordemProducaoId === idOP
        );

        renderizarDetalhes(ordem, producoesDaOP);

    } catch (erro) {
        console.error("Erro ao carregar detalhes da OP:", erro);

        document.getElementById("tituloOP").textContent = "Erro";
        document.getElementById("produtoOP").textContent = erro.message;
    }
}

function renderizarDetalhes(ordem, producoes) {
    document.getElementById("tituloOP").textContent = ordem.numero;
    document.getElementById("produtoOP").textContent =
        ordem.produto?.nome || "Produto não informado";

    const produzido = producoes.reduce(
        (total, producao) => total + producao.quantidade,
        0
    );

    const meta = ordem.quantidade;
    const restante = Math.max(meta - produzido, 0);

    const percentual = meta > 0
        ? Math.min(Math.round((produzido / meta) * 100), 100)
        : 0;

    document.getElementById("metaOP").textContent = `${meta} peças`;
    document.getElementById("produzidoOP").textContent = `${produzido} peças`;
    document.getElementById("restanteOP").textContent = `${restante} peças`;
    document.getElementById("statusOP").textContent = ordem.status;
    document.getElementById("percentualOP").textContent = `${percentual}%`;
    document.getElementById("barraOP").style.width = `${percentual}%`;

    renderizarProducoes(producoes);
    renderizarGrafico(meta, produzido, restante, producoes);
}

function renderizarProducoes(producoes) {
    const container = document.getElementById("producoesOPContainer");

    if (!container) return;

    if (producoes.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                Nenhuma produção registrada para esta ordem.
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    const ordenadas = [...producoes].sort(
        (a, b) => new Date(b.dataHora) - new Date(a.dataHora)
    );

    ordenadas.forEach((producao, indice) => {
        const elemento = document.createElement("div");
        elemento.className = "production-history-item";

        const data = new Date(producao.dataHora);
        const dataFormatada = data.toLocaleDateString("pt-BR");
        const horaFormatada = data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        const numero = document.createElement("div");
        numero.className = "production-history-number";
        numero.textContent = ordenadas.length - indice;

        const info = document.createElement("div");
        info.className = "production-history-info";

        const evento = document.createElement("strong");
        evento.textContent = `Evento: ${producao.eventoId || "Não informado"}`;

        const quantidade = document.createElement("span");
        quantidade.textContent =
            `${producao.quantidade} ${producao.quantidade === 1 ? "peça" : "peças"}`;

        const horario = document.createElement("span");
        horario.textContent = `${dataFormatada} às ${horaFormatada}`;

        info.append(evento, quantidade, horario);

        const etiquetas = document.createElement("div");
        etiquetas.className = "production-history-labels";

        if (producao.etiquetas?.length) {
            producao.etiquetas.forEach(etiqueta => {
                const item = document.createElement("span");
                item.className = "history-label";
                item.textContent = etiqueta.codigo;
                etiquetas.appendChild(item);
            });
        } else {
            etiquetas.textContent = "Etiquetas não informadas";
        }

        elemento.append(numero, info, etiquetas);
        container.appendChild(elemento);
    });
}

function renderizarGrafico(meta, produzido, restante, producoes) {
    const canvas = document.getElementById("graficoOP");
    const seletor = document.getElementById("tipoGraficoOP");
    const mensagem = document.getElementById("mensagemGraficoOP");

    if (!canvas || !seletor || !mensagem) {
        console.error("Área do gráfico não encontrada. Confira o HTML.");
        return;
    }

    if (typeof Chart === "undefined") {
        mensagem.textContent =
            "Não foi possível carregar os gráficos. Verifique a conexão com a internet.";
        return;
    }

    // Configura o seletor apenas uma vez.
    if (seletor.dataset.configurado !== "true") {
        seletor.value = tipoGraficoAtual;

        seletor.addEventListener("change", () => {
            tipoGraficoAtual = seletor.value;
            carregarDetalhesOP();
        });

        seletor.dataset.configurado = "true";
    }

    // Ordena os eventos do mais antigo para o mais recente.
    const ordenadas = [...producoes].sort(
        (a, b) => new Date(a.dataHora) - new Date(b.dataHora)
    );

    const tipo = tipoGraficoAtual;
    let rotulos = [];
    let valores = [];
    let titulo = "";

    if (tipo === "pie") {
        rotulos = ["Produzido", "Restante"];
        valores = [produzido, restante];
        titulo = "Produzido x restante";

        mensagem.textContent =
            "Distribuição da produção em relação à meta da ordem.";
    } else if (tipo === "line") {
        let acumulado = 0;

        rotulos = ordenadas.map((producao, indice) => {
            acumulado += producao.quantidade;

            return producao.eventoId || `Registro ${indice + 1}`;
        });

        valores = ordenadas.map((producao, indice) => {
            return ordenadas
                .slice(0, indice + 1)
                .reduce((total, item) => total + item.quantidade, 0);
        });

        titulo = "Produção acumulada por evento";

        mensagem.textContent = ordenadas.length
            ? "Cada ponto representa o total acumulado após o evento indicado no eixo horizontal."
            : "Ainda não há eventos registrados para esta ordem.";
    } else {
        rotulos = ordenadas.map((producao, indice) =>
            producao.eventoId || `Registro ${indice + 1}`
        );

        valores = ordenadas.map(producao => producao.quantidade);
        titulo = "Quantidade de peças por evento";

        mensagem.textContent = ordenadas.length
            ? "Cada barra representa a quantidade de peças registrada em um evento. Passe o cursor sobre uma barra para ver os detalhes."
            : "Ainda não há eventos registrados para esta ordem.";
    }

    if (graficoOP) {
        graficoOP.destroy();
        graficoOP = null;
    }

    graficoOP = new Chart(canvas, {
        type: tipo,
        data: {
            labels: rotulos,
            datasets: [{
                label: tipo === "line"
                    ? "Total acumulado de peças"
                    : tipo === "pie"
                        ? "Quantidade de peças"
                        : "Peças registradas no evento",
                data: valores,
                backgroundColor: tipo === "pie"
                    ? ["#16a34a", "#cbd5e1"]
                    : tipo === "line"
                        ? "#2563eb"
                        : "#3b82f6",
                borderColor: tipo === "line" ? "#1d4ed8" : "#dbeafe",
                borderWidth: tipo === "line" ? 3 : 1,
                tension: 0.25,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index"
            },
            plugins: {
                legend: {
                    display: tipo === "pie"
                },
                title: {
                    display: true,
                    text: titulo
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            if (tipo === "pie") return "";

                            const producao = ordenadas[context.dataIndex];

                            if (!producao) return "";

                            const data = new Date(producao.dataHora);
                            const horario = data.toLocaleString("pt-BR");

                            return [
                                `Evento: ${producao.eventoId || "Não informado"}`,
                                `Quantidade deste evento: ${producao.quantidade} peça(s)`,
                                `Data: ${horario}`
                            ];
                        }
                    }
                }
            },
            scales: tipo === "pie" ? {} : {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    title: {
                        display: true,
                        text: tipo === "line"
                            ? "Total acumulado de peças"
                            : "Peças por evento"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: tipo === "line" || tipo === "bar"
                            ? "Evento de produção"
                            : ""
                    }
                }
            }
        }
    });
}

// Carrega os dados e atualiza a cada cinco segundos.
carregarDetalhesOP();
setInterval(carregarDetalhesOP, 5000);
