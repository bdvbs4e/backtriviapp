// src/routes/question.routes.js
const express = require("express");
const mongoose = require("mongoose");
const Question = require("../models/question.model"); // ✅ Ruta corregida

const router = express.Router();

/**
 * GET /api/questions
 * Lista todas las preguntas (ordenadas por fecha)
 */
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    console.error("❌ Error obteniendo preguntas:", err);
    res.status(500).json({ error: "Error obteniendo preguntas" });
  }
});

/**
 * GET /api/questions/:id
 * Obtener una pregunta por id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: "Pregunta no encontrada" });
    res.json(question);
  } catch (err) {
    console.error("❌ Error obteniendo pregunta:", err);
    res.status(500).json({ error: "Error obteniendo pregunta" });
  }
});

/**
 * GET /api/questions/random?category=Historia&limit=5
 * Devuelve X preguntas aleatorias (por categoría opcional)
 */
router.get("/random", async (req, res) => {
  try {
    const { category, limit = 5 } = req.query;
    const match = category ? { category } : {};
    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: Math.max(1, Math.min(50, parseInt(limit, 10) || 5)) } } // limite razonable
    ]);
    res.json(questions);
  } catch (err) {
    console.error("❌ Error obteniendo preguntas aleatorias:", err);
    res.status(500).json({ error: "Error obteniendo preguntas aleatorias" });
  }
});

/**
 * POST /api/questions
 * Crear una nueva pregunta
 * Body: { category, text, options: [], correctAnswer }
 */
router.post("/", async (req, res) => {
  try {
    const { category, text, options, correctAnswer } = req.body;

    if (!category || !text || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: "Faltan campos obligatorios (category, text, options)" });
    }
    if (options.length < 2 || options.length > 5) {
      return res.status(400).json({ error: "options debe tener entre 2 y 5 elementos" });
    }
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ error: "correctAnswer debe estar presente en options" });
    }

    const question = await Question.create({ category, text, options, correctAnswer });
    res.status(201).json(question);
  } catch (err) {
    console.error("❌ Error creando pregunta:", err);
    res.status(400).json({ error: "Error al crear pregunta" });
  }
});

/**
 * PUT /api/questions/:id
 * Editar una pregunta existente
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    if (updates.options && (!Array.isArray(updates.options) || updates.options.length < 2 || updates.options.length > 5)) {
      return res.status(400).json({ error: "options debe ser array con entre 2 y 5 elementos" });
    }
    if (updates.correctAnswer && updates.options && !updates.options.includes(updates.correctAnswer)) {
      return res.status(400).json({ error: "correctAnswer debe estar dentro de options" });
    }

    if (updates.correctAnswer && !updates.options) {
      const existing = await Question.findById(id);
      if (existing && !existing.options.includes(updates.correctAnswer)) {
        return res.status(400).json({ error: "correctAnswer debe estar dentro de las options actuales" });
      }
    }

    const updated = await Question.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Pregunta no encontrada" });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error editando pregunta:", err);
    res.status(400).json({ error: "Error al editar pregunta" });
  }
});

/**
 * DELETE /api/questions/:id
 * Eliminar una pregunta
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Pregunta no encontrada" });

    res.json({ message: "Pregunta eliminada" });
  } catch (err) {
    console.error("❌ Error eliminando pregunta:", err);
    res.status(500).json({ error: "Error al eliminar pregunta" });
  }
});

module.exports = router;
