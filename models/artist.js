const { Schema, model } = require("mongoose");

const ArtistSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
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

module.exports = model("Artist", ArtistSchema, "artists");
//1er parametro nombre de modelo, 2do el modelo como tal, 3ro como la tabla va ser guardada.
