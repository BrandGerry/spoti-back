const { Schema, model } = require("mongoose");

const SongSchema = new Schema({
  album: {
    type: Schema.ObjectId,
    ref: "Album",
  },
  track: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    default: "default.mp3",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Song", SongSchema, "songs");
//1er parametro nombre de modelo, 2do el modelo como tal, 3ro como la tabla va ser guardada.
