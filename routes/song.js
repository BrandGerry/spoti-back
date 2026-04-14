//IMPORTAR DEPENDENCIAS
const express = require("express");
const multer = require("multer");
//const check = require("../middlewares/auth");

//CARGAR ROUTER
const router = express.Router();

//IMPORTAR CONTROLADOR
const SongController = require("../controllers/song");

//DEFINIR RUTAS
router.get("/pruebasong", SongController.prueba);

//EXPORTAR ROUTER
module.exports = router;
