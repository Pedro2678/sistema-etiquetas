const producoesService = require("../services/producoes.service");

const finalizarProducao = async (req, res) => {
    try {
        const dados = req.body;

        const producao = await producoesService.finalizarProducao(dados);

        res.status(201).json(producao);
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao registrar produção"
        });
    }
};

const listarProducoes = async (req, res) => {
    try {
        const producoes = await producoesService.listarProducoes();

        res.status(200).json(producoes);
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao listar produções"
        });
    }
};

module.exports = {
    finalizarProducao,
    listarProducoes
};