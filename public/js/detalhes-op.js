
let graficoOP = null;
let tipoGraficoAtual = "bar";


async function carregarDetalhesOP() {
    try {
        // Pega o ID da OP na URL
        const parametros = new URLSearchParams(
            window.location.search
        );

        const idOP = Number(parametros.get("id"));

        if (!idOP) {
            throw new Error(
                "ID da ordem de produção não informado"
            );
        }

        // Busca as ordens pela API
        const respostaOrdens = await fetch("/api/ordens");

        if (!respostaOrdens.ok) {
            throw new Error("Erro ao buscar as ordens");
        }

        const ordens = await respostaOrdens.json();

        const ordem = ordens.find(
            ordem => ordem.id === idOP
        );

        if (!ordem) {
            throw new Error(
                "Ordem de produção não encontrada"
            );
        }

        // Busca as produções pela API
        const respostaProducoes =
            await fetch("/api/producoes");

        if (!respostaProducoes.ok) {
            throw new Error("Erro ao buscar as produções");
        }

        const producoes = await respostaProducoes.json();

        // Filtra as produções da OP selecionada
        const producoesDaOP = producoes.filter(
            producao =>
                producao.ordemProducaoId === idOP
        );

        // Renderiza os dados na página
        renderizarDetalhes(ordem, producoesDaOP);

    } catch (erro) {
        console.error(
            "Erro ao carregar detalhes da OP:",
            erro
        );

        const titulo = document.getElementById("tituloOP");
        const produto = document.getElementById("produtoOP");

        if (titulo) titulo.textContent = "Erro";
        if (produto) produto.textContent = erro.message;
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

    
const itens = ordem.itens || [];



const containerMetas = document.getElementById("metasItensOP");

if (containerMetas) {
    if (itens.length === 0) {
        containerMetas.textContent =
            "Nenhum item cadastrado nesta ordem.";
    } else {
        containerMetas.innerHTML = "";

        itens.forEach((item) => {
            const metaItem = Number(item.quantidade || 0);

            // Soma apenas as produções deste item da ordem.
            const produzidoItem = producoes
                .filter(producao =>
                    producao.itemOrdemProducaoId === item.id
                )
                .reduce(
                    (total, producao) =>
                        total + Number(producao.quantidade || 0),
                    0
                );

            const restanteItem = Math.max(
                metaItem - produzidoItem,
                0
            );

            const percentualItem = metaItem > 0
                ? Math.min(
                    Math.round((produzidoItem / metaItem) * 100),
                    100
                )
                : 0;

            const card = document.createElement("div");
            card.className = "meta-item-card";

            const nome = document.createElement("h3");
            nome.textContent =
                item.produto?.nome || "Produto não informado";

            const metaTexto = document.createElement("p");
            metaTexto.textContent = `Meta: ${metaItem} peças`;

            const produzidoTexto = document.createElement("p");
            produzidoTexto.textContent =
                `Produzido: ${produzidoItem} peças`;

            const restanteTexto = document.createElement("p");
            restanteTexto.textContent =
                `Restante: ${restanteItem} peças`;

            const percentualTexto = document.createElement("p");
            percentualTexto.textContent =
                `Conclusão: ${percentualItem}%`;

            const barraFundo = document.createElement("div");
            barraFundo.className = "progress-container";

            const barra = document.createElement("div");
            barra.className = "progress-bar";
            barra.style.width = `${percentualItem}%`;

            barraFundo.appendChild(barra);

            card.append(
                nome,
                metaTexto,
                produzidoTexto,
                restanteTexto,
                percentualTexto,
                barraFundo
            );

            containerMetas.appendChild(card);
        });
    }
}


const meta = itens.reduce(
    (total, item) => total + Number(item.quantidade || 0),
    0
);

const restante = Math.max(meta - produzido, 0);

const percentual = meta > 0
    ? Math.min(Math.round((produzido / meta) * 100), 100)
    : 0;

const produtos = itens
    .map(item => item.produto?.nome)
    .filter(Boolean);

const produtoElemento = document.getElementById("produtoNome");

if (produtoElemento) {
    produtoElemento.textContent = produtos.length
        ? produtos.join(", ")
        : "Produtos não informados";
}

document.getElementById("metaOP").textContent = `${meta} peças`;
document.getElementById("produzidoOP").textContent = `${produzido} peças`;
document.getElementById("restanteOP").textContent = `${restante} peças`;
document.getElementById("statusOP").textContent = ordem.status;
document.getElementById("percentualOP").textContent = `${percentual}%`;
document.getElementById("barraOP").style.width = `${percentual}%`;

renderizarProducoes(producoes);
renderizarGrafico(meta, produzido, restante, producoes, itens);
}


function renderizarProducoes(producoes, itens = []) {
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
        
        const item = itens.find(
    item => Number(item.id) === Number(producao.itemOrdemProducaoId)
);

const nomePeca =
    producao.itemOrdemProducao?.produto?.nome ||
    item?.produto?.nome ||
    "Tipo de peça não identificado";
  
        const numero = document.createElement("div");
        numero.className = "production-history-number";
        numero.textContent = ordenadas.length - indice;

        const info = document.createElement("div");
        info.className = "production-history-info";

        const evento = document.createElement("strong");
        evento.textContent = `Evento: ${producao.eventoId || "Não informado"}`;

        const tipoPeca = document.createElement("span");
        tipoPeca.className = "production-history-type";
        tipoPeca.textContent = `Tipo de peça: ${nomePeca}`;

        const quantidade = document.createElement("span");
        quantidade.textContent =
            `${producao.quantidade} ${producao.quantidade === 1 ? "peça" : "peças"}`;

        const horario = document.createElement("span");
        horario.textContent = `${dataFormatada} às ${horaFormatada}`;

        info.append(evento, tipoPeca, quantidade, horario);

        const etiquetas = document.createElement("div");
        etiquetas.className = "production-history-labels";

        if (producao.etiquetas?.length) {
            producao.etiquetas.forEach(etiqueta => {
                const itemEtiqueta = document.createElement("span");
                itemEtiqueta.className = "history-label";
                itemEtiqueta.textContent = etiqueta.codigo;
                etiquetas.appendChild(itemEtiqueta);
            });
        } else {
            etiquetas.textContent = "Etiquetas não informadas";
        }

        elemento.append(numero, info, etiquetas);
        container.appendChild(elemento);
    });
}

   
    function renderizarGrafico(meta, produzido, restante, producoes, itens = []) {
    const canvas = document.getElementById("graficoOP");
    const seletor = document.getElementById("tipoGraficoOP");
    const mensagem = document.getElementById("mensagemGraficoOP");

    if (!canvas || !seletor || !mensagem) {
        console.error("Área do gráfico não encontrada. Confira o HTML.");
        return;
    }

    if (typeof Chart === "undefined") {
        mensagem.textContent = "Não foi possível carregar os gráficos.";
        return;
    }

    if (seletor.dataset.configurado !== "true") {
        seletor.value = tipoGraficoAtual;

        seletor.addEventListener("change", () => {
            tipoGraficoAtual = seletor.value;
            carregarDetalhesOP();
        });

        seletor.dataset.configurado = "true";
    }

    const cores = [
        "#2563eb",
        "#16a34a",
        "#f59e0b",
        "#9333ea",
        "#e11d48"
    ];
    console.log("Itens recebidos:", itens);
console.log("Produções recebidas:", producoes);
console.log("Tipo de gráfico:", tipoGraficoAtual);

    const dadosItens = itens.map((item, indice) => {
        const producoesItem = producoes.filter(
            p => Number(p.itemOrdemProducaoId) === Number(item.id)
    );

        const quantidadeProduzida = producoesItem.reduce(
            (total, p) => total + Number(p.quantidade || 0),
            0
        );

        return {
            id: item.id,
            nome: item.produto?.nome || `Tipo ${indice + 1}`,
            meta: Number(item.quantidade || 0),
            produzido: quantidadeProduzida,
            cor: cores[indice % cores.length],
            producoes: producoesItem
        };
    });

    console.log("Dados preparados para o gráfico:", dadosItens);
console.log("Canvas:", canvas);
console.log("Chart disponível:", typeof Chart);

    const tipo = tipoGraficoAtual;

    let datasets = [];
    let rotulos = [];
    let titulo = "";

    if (tipo === "pie") {
       const totalProduzido = dadosItens.reduce(
    (total, item) => total + item.produzido,
    0
);

const totalMeta = Number(meta) || 0;
const restante = Math.max(totalMeta - totalProduzido, 0);

rotulos = [
    ...dadosItens.map(item => item.nome),
    "Restante da meta"
];

datasets = [{
    label: "Quantidade de peças",
    data: [
        ...dadosItens.map(item => item.produzido),
        restante
    ],
    backgroundColor: [
        ...dadosItens.map(item => item.cor),
        "#D1D5DB"
    ],
    borderColor: "#ffffff",
    borderWidth: 3
}];

titulo = "Produção x meta total";

mensagem.textContent = totalProduzido > 0
    ? "Passe o mouse sobre cada fatia para consultar a produção e sua porcentagem da meta."
    : "Ainda não há peças produzidas para exibir no gráfico.";
           
    } 
    else if (tipo === "line") {
        const eventos = [...producoes].sort(
            (a, b) => new Date(a.dataHora) - new Date(b.dataHora)
        );

        rotulos = eventos.map((p, i) =>
            p.eventoId || `Registro ${i + 1}`
        );

        datasets = dadosItens.map(item => {
            let acumulado = 0;

            const valores = eventos.map(evento => {
                if (Number(evento.itemOrdemProducaoId) === Number(item.id)) {
                    acumulado += Number(evento.quantidade || 0);
                }

                return acumulado;
            });

            return {
                label: item.nome,
                data: valores,
                borderColor: item.cor,
                backgroundColor: item.cor,
                borderWidth: 3,
                tension: 0.25,
                pointRadius: 4,
                fill: false
            };
        });

        titulo = "Produção acumulada por tipo";
        mensagem.textContent = eventos.length
            ? "Cada linha acompanha a produção acumulada de um tipo de peça por evento."
            : "Ainda não há eventos registrados para esta ordem.";
    } else {
        rotulos = dadosItens.map(item => item.nome);

        datasets = [
            {
                label: "Meta",
                data: dadosItens.map(item => item.meta),
                backgroundColor: "#cbd5e1",
                borderRadius: 5
            },
            {
                label: "Produzido",
                data: dadosItens.map(item => item.produzido),
                backgroundColor: dadosItens.map(item => item.cor),
                borderRadius: 5
            }
        ];

        titulo = "Meta x produção por tipo de peça";
        mensagem.textContent =
            "Compare a meta planejada com a quantidade produzida de cada tipo.";
    }
if (graficoOP) {
    const dadosAtuais = JSON.stringify({
        labels: graficoOP.data.labels,
        datasets: graficoOP.data.datasets.map(dataset => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: dataset.backgroundColor
        })),
        titulo: graficoOP.options.plugins.title.text,
        tipo: graficoOP.config.type
    });

    const novosDados = JSON.stringify({
        labels: rotulos,
        datasets: datasets.map(dataset => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: dataset.backgroundColor
        })),
        titulo,
        tipo
    });

    if (dadosAtuais === novosDados) {
        return;
    }

    graficoOP.data.labels = rotulos;
    graficoOP.data.datasets = datasets;
    graficoOP.options.plugins.title.text = titulo;
    graficoOP.config.type = tipo;
    graficoOP.update("none");
    return;

}

graficoOP = new Chart(canvas, {
     type: tipo,
    data: {
        labels: rotulos,
        datasets
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,

        animation: {
            duration: 350,
            easing: "easeOutQuart"
        },

        interaction: {
            intersect: false,
            mode: tipo === "bar" ? "index" : "nearest"
        },

        layout: {
            padding: {
                top: 12,
                right: 12,
                bottom: 4,
                left: 6
            }
        },

        plugins: {
            legend: {
                display: true,
                position: "bottom",

                labels: {
                    color: "#526274",
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 8,
                    boxHeight: 8,
                    padding: 22,
                    font: {
                        family: "'Segoe UI', Arial, sans-serif",
                        size: 11,
                        weight: "600"
                    }
                }
            },

            title: {
                display: true,
                text: titulo,
                align: "start",
                color: "#24384b",
                padding: {
                    top: 4,
                    bottom: 24
                },
                font: {
                    family: "'Segoe UI', Arial, sans-serif",
                    size: 15,
                    weight: "700"
                }
            },

            tooltip: {
                enabled: true,
                backgroundColor: "#1f3347",
                titleColor: "#ffffff",
                bodyColor: "#e5edf5",
                borderColor: "#40566c",
                borderWidth: 1,
                cornerRadius: 7,
                padding: 12,
                displayColors: true,

                titleFont: {
                    size: 12,
                    weight: "700"
                },

                bodyFont: {
                    size: 12
                },

                callbacks: {
                    label: context => {
                        const valor = Number(context.raw || 0);
                        const metaTotal = Number(meta) || 0;
                        const percentual = metaTotal > 0
                            ? (valor / metaTotal) * 100
                            : 0;

                        return ` ${context.dataset.label}: ${
                            valor.toLocaleString("pt-BR")
                        } peças (${percentual.toFixed(1).replace(".", ",")}%)`;
                    }
                }
            }
        },

        scales: tipo === "pie" ? {} : {
            y: {
                beginAtZero: true,

                border: {
                    display: false
                },

                grid: {
                    color: "#edf1f5",
                    drawTicks: false
                },

                ticks: {
                    precision: 0,
                    color: "#7a8998",
                    padding: 10,
                    font: {
                        size: 11
                    }
                },

                title: {
                    display: true,
                    text: "Quantidade de peças",
                    color: "#657588",
                    padding: {
                        bottom: 12
                    },
                    font: {
                        size: 11,
                        weight: "600"
                    }
                }
            },

            x: {
                border: {
                    display: false
                },

                grid: {
                    display: false
                },

                ticks: {
                    color: "#647386",
                    autoSkip: true,
                    maxRotation: 0,
                    minRotation: 0,
                    maxTicksLimit: 10,
                    font: {
                        size: 11
                    }
                }
            }
        }
    }
});
};

document.addEventListener("DOMContentLoaded", () => {
    carregarDetalhesOP();

    setInterval(() => {
        carregarDetalhesOP();
    }, 5000);
});