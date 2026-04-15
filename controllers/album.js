// IMPORTACIONES
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");
const { validate } = require("../helpers/validate");
const Album = require("../models/albums");
const Song = require("../models/songs");
const jwt = require("../helpers/jwt");

const prueba = async (req, res) => {
  return res.status(200).send({
    status: "suceess",
    msj: "Mensaje enviado desde el controllador/album",
  });
};
//GUARDAR UN ALBUM
const save = async (req, res) => {
  try {
    //RECOGER DATOS DEL BODY
    const params = req.body;
    //CREAR EL OBJETO A GUARDAR
    const dbAlbum = new Album(params);
    //GUARDARLO
    const album = await dbAlbum.save();
    if (!album) {
      return res.status(400).send({
        status: "Error",
        msj: "Algo paso al guardar el album.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Mensaje enviado desde save album",
      album,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en el Erroren el album.",
    });
  }
};
//SACAR UN ALBUM
const one = async (req, res) => {
  try {
    //SACAR PARAMETRO POR URL
    const albumId = req.params.id;
    //FIND PARA BUSCAR EL RESULTAD
    const album = await Album.findById(albumId).populate({ path: "artist" });
    if (!album) {
      return res.status(404).send({
        status: "Error",
        msj: "No se encontro album con ese ID.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Sacar un album",
      album,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en el Error.",
    });
  }
};
//SACAR MUCHOS ALBUMNES DE ARTISTA
const list = async (req, res) => {
  try {
    //SACAR ID DEL ARTISTA
    const artistId = req.params.artistId;
    if (!artistId) {
      return res.status(404).json({
        status: "error",
        mensaje: "No se mando el artistId",
      });
    }
    //SACAR LA PAGINA
    //si no viene la pagina agregarla nosotros
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    //DEFINIR NUMERO DE ELEMENTOS PERPEGAE
    const itemsPerPage = 2;
    const totalAlbum = await Album.countDocuments();

    //FIND ORDENARLO Y PAGINARLO
    const album = await Album.find({ artist: artistId })
      .populate("artist")
      .sort("title")
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (!album || album.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay albums.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Sacar lista de artistas",
      album,
      totalAlbum,
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
    //RECOGER ARTISTA
    const id = req.params.id;
    //RECOGER DATOS DEL BODY
    const data = req.body;
    //BUSCAR Y CAMBIA
    const album = await Album.findByIdAndUpdate(id, data, { new: true });
    console.log("album", album);
    if (!album || album.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay album buscado.",
      });
    }
    return res.status(200).send({
      status: "Success",
      msj: "Album actualizado.",
      album,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Algo paso en update.",
    });
  }
};
//SUBIR IMAGEN
const upload = async (req, res) => {
  try {
    //RECOGER ID
    const albumId = req.params.id;
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
    const albumUpdate = await Album.findOneAndUpdate(
      { _id: albumId },
      { image: req.file.filename },
      { new: true }
    );

    if (!albumUpdate) {
      return res.status(400).json({
        status: "error",
        message: "Error al subir la imagen algo inesperdado.",
      });
    }
    //DEVOLVER LA RESPUESTA
    return res.status(200).json({
      status: "Success",
      mensaje: "Upload Bien.",
      album: albumUpdate,
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
    const filePath = "./uploads/albums/" + file;
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
//ELIMINAR UN ARTISTA
const remove = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Eliminar canciones del álbum
    const songDelete = await Song.deleteMany({ album: id });
    console.log("songDelete", songDelete);

    // // 2. Eliminar el álbum
    const albumDelete = await Album.findByIdAndDelete(id);

    return res.status(200).send({
      status: "Success",
      msj: "Álbum y canciones eliminados correctamente.",
      albumDelete,
      songDelete,
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      msj: "Error al eliminar el álbum.",
      error,
    });
  }
};

module.exports = {
  prueba,
  save,
  one,
  list,
  update,
  upload,
  imagen,
  remove,
};
