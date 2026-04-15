const { Schema, model } = require("mongoose");

const AlbumSchema = new Schema({
  artist: {
    type: Schema.ObjectId,
    ref: "Artist",
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  year: {
    type: Number,
    required: true,
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

module.exports = model("Album", AlbumSchema, "albums");
//1er parametro nombre de modelo, 2do el modelo como tal, 3ro como la tabla va ser guardada.
