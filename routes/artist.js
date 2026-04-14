//IMPORTAR DEPENDENCIAS
const express = require("express");
const multer = require("multer");
const check = require("../middleware/auth");

//CARGAR ROUTER
const router = express.Router();

//IMPORTAR CONTROLADOR
const ArtistController = require("../controllers/artist");

//CONFIGURACION DE SUBIDA
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/artist/");
  },
  filename: (req, file, cb) => {
    cb(null, "artist-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

//DEFINIR RUTAS
router.get("/pruebaartist", ArtistController.prueba);
router.post("/save", check.auth, ArtistController.save);
router.get("/one/:id", check.auth, ArtistController.one);
router.get("/list/:page", check.auth, ArtistController.list);
router.get("/list", check.auth, ArtistController.list);
router.put("/update/:id", check.auth, ArtistController.update);
router.put("/update", check.auth, ArtistController.update);
router.delete("/remove/:id", check.auth, ArtistController.remove);
router.delete("/remove", check.auth, ArtistController.remove);
router.post(
  "/upload/:id",
  [check.auth, upload.single("file0")],
  ArtistController.upload
);
router.get("/imagen/:file", ArtistController.imagen);

//EXPORTAR ROUTER
module.exports = router;
