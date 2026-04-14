const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: String,
  nick: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    default: "role_user",
    select: false,
  },
  image: {
    type: String,
    default: "image.png",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("User", UserSchema, "users");
//1er parametro nombre de modelo, 2do el modelo como tal, 3ro como la tabla va ser guardada.
