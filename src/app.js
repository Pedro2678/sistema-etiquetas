require("dotenv/config");

const express = require("express");


const ordensRoutes = require("./routes/ordens.router");
const producoesRoutes = require("./routes/producoes.router");



const app = express();


app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.json({
        sistema: "Sistema de Etiquetagem",
        status: "online"
    });
});

app.use("/api/ordens", ordensRoutes);
app.use("/api/producoes", producoesRoutes);

module.exports = app;