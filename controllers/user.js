// IMPORTACIONES
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");
const { validate } = require("../helpers/validate");
const User = require("../models/user");
const jwt = require("../helpers/jwt");

const prueba = async (req, res) => {
  return res.status(200).send({
    status: "suceess",
    msj: "Mensaje enviado desde el controllador/user",
  });
};

//REGISTRO
const register = async (req, res) => {
  try {
    //RECOGER LOS DATOS DE LA PETICION
    const params = req.body;
    //COMPROBAR QUE LLEGAN BIEN
    const requiredParams = ["name", "nick", "email", "password"];
    const missingParams = requiredParams.filter((param) => !params[param]);

    if (missingParams.length !== 0) {
      return res.status(400).json({
        status: "error",
        mensaje: "Faltan parámetros requeridos.",
        missingParams,
      });
    }
    //VALIDACION DE DATOS
    const validationParams = await validate(params);
    //CONTROL USUARIOS DUPLICADOS
    const duplicated = await User.find({
      $or: [
        { email: params.email.toLocaleLowerCase() },
        { nick: params.nick.toLocaleLowerCase() },
      ],
    });

    if (duplicated.length > 0) {
      return res.status(200).json({
        status: "success",
        mensaje: "El usuario ya existe, intente con un nuevo correo o nick.",
      });
    }
    //CIFRAR LA CONTRASEÑA
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;
    //CREAR OBJETO DEL USUARIO
    let userToSave = new User(params);
    //GUARDAR USUARIO EN LA BD
    const userStored = await userToSave.save();
    //LIMPIAR EL USUARIO
    const userCreated = userStored.toObject();
    delete userCreated.password;
    delete userCreated.role;

    if (!userStored) {
      return res.status(500).json({
        status: "error",
        mensaje: "Error al guardar el usuario.",
      });
    }
    return res.status(200).send({
      status: "suceess",
      msj: "Mensaje metodo de registro",
      user: userCreated,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al registrar el usuario.",
      error: error.message,
    });
  }
};
//LOGIN
const login = async (req, res) => {
  try {
    //RECOGER LOS DATOS DE LA PETICION
    let params = req.body;
    //COMPROBAR QUE LLEGEAN
    if (!params.email || !params.password) {
      return res.status(400).send({
        status: "error",
        msj: "Hace falta campos.",
      });
    }
    //BUSCAR EN BD SI EXISTE EL EMAIL
    const userDb = await User.findOne({ email: params.email }).select(
      "+password +role"
    );
    if (!userDb) {
      return res.status(404).json({
        status: "error",
        mensaje: "No se ha encontrado usuario con esos campos.",
      });
    }
    //COMPROBAR SU CONTRASEÑA
    const pwd = bcrypt.compareSync(params.password, userDb.password);
    if (!pwd) {
      return res.status(400).send({
        status: "error",
        msj: "Contraseña incorrecta",
      });
    }
    let identityUser = userDb.toObject();
    delete identityUser.password;
    delete identityUser.role;

    //CONSEGUIR EL TOKEN
    const token = await jwt.createToken(userDb);
    //DEVOLVER DATOS DE USUARIO Y TOKEN
    return res.status(200).send({
      status: "suceess",
      msj: "Metodo de Login ",
      user: identityUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al logearte.",
      error: error.message,
    });
  }
};
//PERFIL DEL USUARIO
const profile = async (req, res) => {
  try {
    //RECOGER LOS DATOS DE LA PETICION
    const idParams = req.params.id;
    //CONSULTAR DATOS DEL PERFIL
    const userDb = await User.findById(idParams);
    if (!userDb) {
      return res.status(404).json({
        status: "error",
        mensaje: "El usuario no existe!",
      });
    }
    //DEVOLVER RESULTADO
    return res.status(200).send({
      status: "suceess",
      msj: "Metodo Profile.",
      user: userDb,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error en Profile.",
      error: error.message,
    });
  }
};
//ACTUALIZAR PERFIL DEL USUARIO
const update = async (req, res) => {
  //RECOGER DATOS DEL USUARIO IDENTIFICADO
  let userIdentity = req.user;
  //RECOGER DATOS A ACTUALIZAR
  let userUpdated = req.body;
  //VALIDACION DE PARAMETROS
  try {
    const validationParams = await validate(userUpdated);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Validacion no superada.",
    });
  }

  //COMPROBAR SI EL USUARIO EXISTE
  const usersDb = await User.find({
    $or: [
      { email: userUpdated.email.toLocaleLowerCase() },
      { nick: userUpdated.nick.toLocaleLowerCase() },
    ],
  });
  let userIsset = false;
  usersDb.forEach((user) => {
    //SI EL USUARIO EXISTE Y NO SOY YO
    if (user && user._id != userIdentity.id) {
      userIsset = true;
    }
  });
  if (userIsset) {
    return res.status(200).json({
      status: "sucess",
      mensaje: "El usuario ya existe.",
    });
  }
  if (userUpdated.password) {
    //CIFRAR PASWORD
    let pdw = await bcrypt.hash(userUpdated.password, 10);
    userUpdated.password = pdw;
  } else {
    delete userUpdated.password;
  }
  //BUSCAR Y ACTUALIZA
  try {
    let userUpdate = await User.findByIdAndUpdate(
      { _id: userIdentity.id },
      userUpdated,
      { new: true }
    );
    if (!userUpdate) {
      return res.status(404).json({
        status: "error",
        mensaje: "Error al actualizar primero",
      });
    }
    return res.status(200).send({
      status: "suceess",
      msj: "Metodo update.",
      user: userUpdate,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error actualizar.",
      error: error.message,
    });
  }
};
//SUBIR IMAGEN
const upload = async (req, res) => {
  try {
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
    console.log("JKJKJ", extension);
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
    const userUpdated = await User.findOneAndUpdate(
      { _id: req.user.id },
      { image: req.file.filename },
      { new: true }
    );

    if (!userUpdated) {
      return res.status(400).json({
        status: "error",
        message: "Error al subir la imagen algo inesperdado.",
      });
    }
    //DEVOLVER LA RESPUESTA
    return res.status(200).json({
      status: "Success",
      mensaje: "Upload Bien.",
      user: userUpdated,
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
const avatar = async (req, res) => {
  try {
    //SACAR PARAMETRO DE URL
    const file = req.params.file;
    //EL PATH DE LA IMAGEN
    const filePath = "./uploads/avatars/" + file;
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
  register,
  login,
  profile,
  update,
  upload,
  avatar,
};
