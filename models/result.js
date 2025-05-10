// models/Result.js
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  rollNumber: { type: Number, unique: true, index: true },
  name: String,
  class: String,
  marks: {
    math: Number,
    physics: Number,
    chemistry: Number,
    hindi: Number,
    english: Number,
  },
});

module.exports = mongoose.model("Result", resultSchema);
