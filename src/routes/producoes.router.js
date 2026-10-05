const express = require("express");

const router = express.Router();

const producoesController = require("../controllers/producoes.controller");

router.get("/", producoesController.listarProducoes);

router.post("/", producoesController.finalizarProducao);




module.exports = router;