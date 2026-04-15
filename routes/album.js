//IMPORTAR DEPENDENCIAS
const express = require("express");
const multer = require("multer");
const check = require("../middleware/auth");

//CARGAR ROUTER
const router = express.Router();

//IMPORTAR CONTROLADOR
const AlbumController = require("../controllers/album");

//CONFIGURACION DE SUBIDA
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/albums/");
  },
  filename: (req, file, cb) => {
    cb(null, "album-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
//DEFINIR RUTAS
router.get("/pruebaalbum", AlbumController.prueba);
router.post("/save", check.auth, AlbumController.save);
router.get("/one/:id", check.auth, AlbumController.one);
router.get("/list/:page/:artistId", check.auth, AlbumController.list);
router.put("/update/:id", check.auth, AlbumController.update);
router.put("/update", check.auth, AlbumController.update);
router.post(
  "/upload/:id",
  [check.auth, upload.single("file0")],
  AlbumController.upload
);
router.get("/imagen/:file", AlbumController.imagen);
router.delete("/remove/:id", check.auth, AlbumController.remove);

//EXPORTAR ROUTER
module.exports = router;
