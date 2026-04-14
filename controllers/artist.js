const Artist = require("../models/artist");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("../helpers/jwt");
const fs = require("fs");
const { validate } = require("../helpers/validate");

//PRUEBA
const prueba = async (req, res) => {
  return res.status(200).send({
    status: "suceess",
    msj: "Mensaje enviado desde el controllador/artist",
  });
};
//ACCION PARA GUARDAR UN ARTISTA
const save = async (req, res) => {
  try {
    //RECOGER DATOS DEL BODY
    const params = req.body;
    //CREAR EL OBJETO A GUARDAR
    const dbArtist = new Artist(params);
    //GUARDARLO
    const artist = await dbArtist.save();
    return res.status(200).send({
      status: "Success",
      msj: "Mensaje enviado desde el controllador/artist - save",
      artist,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en el Error.",
    });
  }
};
//SACAR UN ARTISTA
const one = async (req, res) => {
  try {
    //SACAR PARAMETRO POR URL
    const artistId = req.params.id;
    //FIND PARA BUSCAR EL RESULTAD
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).send({
        status: "Error",
        msj: "No se encontro artista con ese ID.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Sacar un artista",
      artist,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en el Error.",
    });
  }
};
//SACAR MUCHOS ARTISTA
const list = async (req, res) => {
  try {
    //SACAR LA PAGINA
    //si no viene la pagina agregarla nosotros
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    //DEFINIR NUMERO DE ELEMENTOS PERPEGAE
    const itemsPerPage = 2;
    const totalArtist = await Artist.countDocuments();

    //FIND ORDENARLO Y PAGINARLO
    const artist = await Artist.find()
      .sort("name")
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (!artist || artist.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay publicaciones disponibles.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Sacar lista de artistas",
      artist,
      totalArtist,
      actualPage: page,
      itemsPerPage,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en el Error.",
    });
  }
};
//EDITAR UN ARTISTA
const update = async (req, res) => {
  try {
    //RECOGER ARTISTA
    const id = req.params.id;
    //RECOGER DATOS DEL BODY
    const data = req.body;
    //BUSCAR Y CAMBIA
    const artist = await Artist.findByIdAndUpdate(id, data, { new: true });
    console.log("artist", artist);
    if (!artist || artist.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay artista buscado.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Artista actualizado.",
      artist,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en el Error.",
    });
  }
};
//ELIMINAR UN ARTISTA
const remove = async (req, res) => {
  try {
    //SACAR EL ID DEL ARTISTA
    const id = req.params.id;
    //CONSULTA PARA BUSCAR Y EIMINAR EL ARTISTA
    const artistDelete = await Artist.findByIdAndDelete(id);
    //DEVOLVER RESULTADO
    return res.status(200).send({
      status: "Success",
      msj: "Artista Borrado.",
      artistDelete,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso al eliminar al artista.",
      error,
    });
  }
};
//SUBIR IMAGEN
const upload = async (req, res) => {
  try {
    //RECOGER ID
    const artisId = req.params.id;
    //CONFIGURACION DE SUBIDA
    //RECOGER FICHERO DE IMAGEN Y COMPROBAR SI EXISTE
    if (!req.file) {
      return res.status(404).json({
        status: "error",
        mensaje: "La peticion no inclye la imagen.",
      });
    }
    //NOMBRE DEL ARCHIVO
    let name = req.file.originalname;
    //SACAR INFO DE LA IMAGEN
    let imageSplit = name.split(".");
    let extension = imageSplit[1].toLowerCase();
    //COMPROBAR LA EXTENCION
    if (
      extension !== "png" &&
      extension !== "jpg" &&
      extension !== "jpeg" &&
      extension !== "gift"
    ) {
      const filePath = req.file.path;
      const fileDelete = fs.unlinkSync(filePath);
      return res.status(400).json({
        status: "error",
        message: "Extension del fichero invalida.",
      });
    }
    //SI ES CORRECTO GUARDAR EN LA BD
    const artistUpdated = await Artist.findOneAndUpdate(
      { _id: artisId },
      { image: req.file.filename },
      { new: true }
    );

    if (!artistUpdated) {
      return res.status(400).json({
        status: "error",
        message: "Error al subir la imagen algo inesperdado.",
      });
    }
    //DEVOLVER LA RESPUESTA
    return res.status(200).json({
      status: "Success",
      mensaje: "Upload Bien.",
      user: artistUpdated,
      file: req.file,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error actualizar.",
      error: error.message,
    });
  }
};
//VER SU AVATAR
const imagen = async (req, res) => {
  try {
    //SACAR PARAMETRO DE URL
    const file = req.params.file;
    //EL PATH DE LA IMAGEN
    const filePath = "./uploads/artist/" + file;
    //COMPROBAR SI LA IMAGEN EXISTE
    fs.stat(filePath, (error, exist) => {
      if (!exist) {
        return res.status(400).json({
          status: "error",
          message: "No existe la imagen.",
        });
      }
      return res.sendFile(path.resolve(filePath));
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al listar usuarios.",
      error: error.message,
    });
  }
};
module.exports = {
  prueba,
  save,
  one,
  list,
  update,
  remove,
  upload,
  imagen,
};
