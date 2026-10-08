const express = require("express");

const router = express.Router();

const ordensController = require("../controllers/ordens.controller");

router.get("/historico", ordensController.listarHistorico);

router.get("/", ordensController.listarOrdens);

router.post("/", ordensController.criarOrdem);

module.exports = router;