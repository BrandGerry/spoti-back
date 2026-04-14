//IMPORTAR DEPENDENCIAS
const express = require("express");
const multer = require("multer");
const check = require("../middleware/auth");

//CARGAR ROUTER
const router = express.Router();

//IMPORTAR CONTROLADOR
const UserController = require("../controllers/user");

//CONFIGURACION DE SUBIDA
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars/");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
//DEFINIR RUTAS
//RUTAS PUBLICAS
router.get("/pruebauser", UserController.prueba);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
//RUTAS PRVADAS
router.get("/profile/:id", check.auth, UserController.profile);
router.put("/update", check.auth, UserController.update);
router.post(
  "/upload",
  [check.auth, upload.single("file0")],
  UserController.upload
);
router.get("/avatar/:file", UserController.avatar);

//EXPORTAR ROUTER
module.exports = router;
