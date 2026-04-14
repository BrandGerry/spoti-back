const mongoose = require("mongoose");

const conexion = async () => {
  try {
    //PARA CONECTARSE
    await mongoose.connect("mongodb://localhost:27017/app_musica");
    console.log("CONECTADO PAPIRRIN.");
  } catch (error) {
    console.log(error);
    throw new Error("No se ha podido conectar a la BD PAPIRRIN.");
  }
};

module.exports = {
  conexion,
};
