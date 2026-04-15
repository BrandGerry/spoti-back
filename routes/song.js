//IMPORTAR DEPENDENCIAS
const express = require("express");
const multer = require("multer");
const check = require("../middleware/auth");

//CARGAR ROUTER
const router = express.Router();

//IMPORTAR CONTROLADOR
const SongController = require("../controllers/song");

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
router.get("/pruebasong", SongController.prueba);
router.post("/save", check.auth, SongController.save);
router.get("/one/:id", check.auth, SongController.one);
router.get("/list/:page/:albumId", check.auth, SongController.list);
router.put("/update/:id", check.auth, SongController.update);
router.delete("/remove/:id", check.auth, SongController.remove);
router.post(
  "/upload/:id",
  [check.auth, upload.single("file0")],
  SongController.upload
);
router.get("/audio/:file", SongController.audio);

//EXPORTAR ROUTER
module.exports = router;
