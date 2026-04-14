//IMPORTAR DEPENDENCIAS
const express = require("express");
const multer = require("multer");
//const check = require("../middlewares/auth");

//CARGAR ROUTER
const router = express.Router();

//IMPORTAR CONTROLADOR
const AlbumController = require("../controllers/album");

//DEFINIR RUTAS
router.get("/pruebaalbum", AlbumController.prueba);

//EXPORTAR ROUTER
module.exports = router;
