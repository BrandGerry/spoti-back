//IMPORTAR CONEXION A BASE DE DATOS
const { conexion } = require("./database/conexion");
//IMPORTAR DEPENDENCIAS
const express = require("express");
const cors = require("cors");
//MENSAJE DE BIENVENIDA
console.log("App de node arrancada.Echale galleta a la sonora.");
//EJECUTAR CONEXION CON BD
conexion();
//CREAR SERVIDOR DE NODE
const app = express();
const port = 3900;
//CONFIGURACION DE CORS
app.use(cors());
//CONVERTIR DATOS DE BODY A JS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//RUTAS CONFIGURACION
const UserRoutes = require("./routes/user");
const AlbumRoutes = require("./routes/album");
const ArtistRoutes = require("./routes/artist");
const SongRoutes = require("./routes/song");
//CARGO LAS RUTAS
app.use("/api/user", UserRoutes);
app.use("/api/album", AlbumRoutes);
app.use("/api/artist", ArtistRoutes);
app.use("/api/song", SongRoutes);

app.get("/probando", (req, res) => {
  console.log("Se ha ejecutado el endpoint de prueba");
  return res.status(200).send(`
    <div>
    <h1>Probando la ruta</h1>
    </div>
    `);
});

//CREAR SERVIDOR Y ESCUCHAR PETICIONES EN EL PUERTO
app.listen(port, () =>
  console.log(`Puerto corriendo servidor de node ${port}`)
);
