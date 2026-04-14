const prueba = async (req, res) => {
  return res.status(200).send({
    status: "suceess",
    msj: "Mensaje enviado desde el controllador/song",
  });
};

module.exports = {
  prueba,
};
