// IMPORTACIONES
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");
const { validate } = require("../helpers/validate");
const Song = require("../models/songs");
const jwt = require("../helpers/jwt");
const { model } = require("mongoose");

const prueba = async (req, res) => {
  return res.status(200).send({
    status: "suceess",
    msj: "Mensaje enviado desde el controllador/song",
  });
};
//GUARDAR UN ALBUM
const save = async (req, res) => {
  try {
    //RECOGER DATOS DEL BODY
    const params = req.body;
    //CREAR EL OBJETO A GUARDAR
    const dbSong = new Song(params);
    //GUARDARLO
    const song = await dbSong.save();
    if (!song) {
      return res.status(400).send({
        status: "Error",
        msj: "Algo paso al guardar el album.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Mensaje enviado desde save song",
      song,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en el Erroren el song.",
      error,
    });
  }
};
//SACAR UN ALBUM
const one = async (req, res) => {
  try {
    //SACAR PARAMETRO POR URL
    const songId = req.params.id;
    //FIND PARA BUSCAR EL RESULTAD
    const song = await Song.findById(songId).populate("album");
    if (!song) {
      return res.status(404).send({
        status: "Error",
        msj: "No se encontro album con ese ID.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Sacar un album",
      song,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en el song",
      error,
    });
  }
};
//SACAR MUCHOS ALBUMNES DE ARTISTA
const list = async (req, res) => {
  try {
    //SACAR ID DEL ALBUM
    const albumId = req.params.albumId;
    if (!albumId) {
      return res.status(404).json({
        status: "error",
        mensaje: "No se mando el albumId",
      });
    }
    //SACAR LA PAGINA
    //si no viene la pagina agregarla nosotros
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    //DEFINIR NUMERO DE ELEMENTOS PERPEGAE
    const itemsPerPage = 2;
    const totalSong = await Song.countDocuments({ album: albumId });

    //FIND ORDENARLO Y PAGINARLO
    //INFORMACION ANIDADA
    const song = await Song.find({ album: albumId })
      .populate({
        path: "album",
        populate: { path: "artist", model: "Artist" },
      })
      .sort("track")
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (!song || song.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay canciones.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Sacar lista de artistas",
      song,
      totalSong,
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
//EDITAR UN ALBUM
const update = async (req, res) => {
  try {
    //RECOGER CANCION
    const id = req.params.id;
    //RECOGER DATOS DEL BODY
    const data = req.body;
    //BUSCAR Y CAMBIA
    const song = await Song.findByIdAndUpdate(id, data, { new: true });
    if (!song || song.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay album buscado.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Song actualizada.",
      song,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en update-song.",
    });
  }
};
//ELIMINAR UNA CANCION
const remove = async (req, res) => {
  try {
    //SACAR EL ID DEL ARTISTA
    const id = req.params.id;
    //CONSULTA PARA BUSCAR Y EIMINAR EL ARTISTA
    const songDelete = await Song.findByIdAndDelete(id);

    //DEVOLVER RESULTADO
    return res.status(200).send({
      status: "Success",
      msj: "Cancion Borrada.",
      songDelete,
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
    const songId = req.params.id;
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
    if (extension !== "mp3" && extension !== "ogg") {
      const filePath = req.file.path;
      const fileDelete = fs.unlinkSync(filePath);
      return res.status(400).json({
        status: "error",
        message: "Extension del fichero invalida.",
      });
    }
    //SI ES CORRECTO GUARDAR EN LA BD
    const songUpdate = await Song.findOneAndUpdate(
      { _id: songId },
      { file: req.file.filename },
      { new: true }
    );

    if (!songUpdate) {
      return res.status(400).json({
        status: "error",
        message: "Error al subir la imagen algo inesperdado.",
      });
    }
    //DEVOLVER LA RESPUESTA
    return res.status(200).json({
      status: "Success",
      mensaje: "Upload Bien.",
      song: songUpdate,
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
const audio = async (req, res) => {
  try {
    //SACAR PARAMETRO DE URL
    const file = req.params.file;
    //EL PATH DE LA IMAGEN
    const filePath = "./uploads/songs/" + file;
    //COMPROBAR SI LA IMAGEN EXISTE
    fs.stat(filePath, (error, exist) => {
      if (!exist) {
        return res.status(400).json({
          status: "error",
          message: "No existe la audio.",
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
  audio,
};
