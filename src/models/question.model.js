const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (val) => val.length >= 2 && val.length <= 5,
        message: "Debe tener entre 2 y 5 opciones",
      },
    },
    correctAnswer: {
      type: String,
      required: true,
      validate: {
        validator: function (val) {
          return this.options.includes(val);
        },
        message: "La respuesta correcta debe estar incluida en las opciones",
      },
    },
    timesAsked: { type: Number, default: 0 }, // 🔥 Cuántas veces se ha usado
    timesCorrect: { type: Number, default: 0 }, // 🔥 Cuántas veces se respondió bien
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
