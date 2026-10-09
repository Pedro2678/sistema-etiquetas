const producoesService = require("../services/producoes.service");

const finalizarProducao = async (req, res) => {

    try {
        const dados = req.body;

        const resultado = await producoesService.finalizarProducao(dados);

        const statusHttp = resultado.duplicado ? 200 : 201;

        return res.status(statusHttp).json(resultado);

    } catch (erro) {
        console.error(erro);

        return res.status(400).json({
            erro: erro.message
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