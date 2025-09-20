const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["player", "admin"], default: "player" }, // 👈 ahora player por defecto
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);