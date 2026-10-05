const ordensService = require("../services/ordens.service");

const listarOrdens = async (req, res) => {
    try {
        const ordens = await ordensService.listarOrdens();

        res.status(200).json(ordens);
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao listar ordens"
        });
    }
};

const criarOrdem = async (req, res) => {
    try {
        const dados = req.body;

        const ordem = await ordensService.criarOrdem(dados);

        res.status(201).json(ordem);
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao criar ordem"
        });
    }
};

module.exports = {
    listarOrdens,
    criarOrdem
};