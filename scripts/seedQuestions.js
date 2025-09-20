// scripts/seedQuestions.js
require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("../src/models/question.model");

const questions = [
  // 🌍 GEOGRAFÍA
  {
    category: "Geografía",
    text: "¿Cuál es la capital de Francia?",
    options: ["Madrid", "París", "Roma", "Berlín"],
    correctAnswer: "París",
  },
  {
    category: "Geografía",
    text: "¿Cuál es el río más largo del mundo?",
    options: ["Nilo", "Amazonas", "Yangtsé", "Misisipi"],
    correctAnswer: "Amazonas",
  },
  {
    category: "Geografía",
    text: "¿En qué continente está Egipto?",
    options: ["Asia", "Europa", "África", "Oceanía"],
    correctAnswer: "África",
  },
  {
    category: "Geografía",
    text: "¿Cuál es el desierto más grande del mundo?",
    options: ["Sahara", "Gobi", "Kalahari", "Atacama"],
    correctAnswer: "Sahara",
  },
  {
    category: "Geografía",
    text: "¿Cuál es la montaña más alta del planeta?",
    options: ["K2", "Makalu", "Everest", "Kilimanjaro"],
    correctAnswer: "Everest",
  },
  {
    category: "Geografía",
    text: "¿Cuál es el océano más grande?",
    options: ["Atlántico", "Índico", "Pacífico", "Ártico"],
    correctAnswer: "Pacífico",
  },

  // 📜 HISTORIA
  {
    category: "Historia",
    text: "¿En qué año llegó el hombre a la Luna?",
    options: ["1965", "1969", "1972", "1980"],
    correctAnswer: "1969",
  },
  {
    category: "Historia",
    text: "¿Quién fue el primer presidente de Estados Unidos?",
    options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"],
    correctAnswer: "George Washington",
  },
  {
    category: "Historia",
    text: "¿En qué año comenzó la Segunda Guerra Mundial?",
    options: ["1939", "1941", "1945", "1936"],
    correctAnswer: "1939",
  },
  {
    category: "Historia",
    text: "¿Qué civilización construyó las pirámides de Giza?",
    options: ["Romanos", "Egipcios", "Mayas", "Mesopotámicos"],
    correctAnswer: "Egipcios",
  },
  {
    category: "Historia",
    text: "¿Quién descubrió América en 1492?",
    options: ["Cristóbal Colón", "Américo Vespucio", "Magallanes", "Hernán Cortés"],
    correctAnswer: "Cristóbal Colón",
  },
  {
    category: "Historia",
    text: "¿Cuál fue la primera civilización en inventar la escritura?",
    options: ["Griegos", "Chinos", "Sumerios", "Egipcios"],
    correctAnswer: "Sumerios",
  },

  // 🎨 ARTE
  {
    category: "Arte",
    text: "¿Quién pintó la Mona Lisa?",
    options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"],
    correctAnswer: "Da Vinci",
  },
  {
    category: "Arte",
    text: "¿De qué estilo es la catedral de Notre Dame de París?",
    options: ["Barroco", "Románico", "Gótico", "Rococó"],
    correctAnswer: "Gótico",
  },
  {
    category: "Arte",
    text: "¿Quién es el autor de la escultura El David?",
    options: ["Donatello", "Miguel Ángel", "Bernini", "Rodin"],
    correctAnswer: "Miguel Ángel",
  },
  {
    category: "Arte",
    text: "¿Qué pintor es famoso por sus girasoles?",
    options: ["Dalí", "Monet", "Van Gogh", "Matisse"],
    correctAnswer: "Van Gogh",
  },
  {
    category: "Arte",
    text: "¿Qué arquitecto diseñó la Sagrada Familia en Barcelona?",
    options: ["Le Corbusier", "Gaudí", "Frank Lloyd Wright", "Mies van der Rohe"],
    correctAnswer: "Gaudí",
  },
  {
    category: "Arte",
    text: "¿Qué técnica usaba Jackson Pollock?",
    options: ["Cubismo", "Surrealismo", "Dripping", "Fauvismo"],
    correctAnswer: "Dripping",
  },

  // 🔬 CIENCIA
  {
    category: "Ciencia",
    text: "¿Cuál es el planeta más grande del sistema solar?",
    options: ["Marte", "Júpiter", "Saturno", "Neptuno"],
    correctAnswer: "Júpiter",
  },
  {
    category: "Ciencia",
    text: "¿Qué científico propuso la teoría de la relatividad?",
    options: ["Newton", "Einstein", "Tesla", "Hawking"],
    correctAnswer: "Einstein",
  },
  {
    category: "Ciencia",
    text: "¿Cuál es el elemento químico con el símbolo O?",
    options: ["Oro", "Oxígeno", "Osmio", "Óxido"],
    correctAnswer: "Oxígeno",
  },
  {
    category: "Ciencia",
    text: "¿Cuál es la velocidad de la luz en el vacío?",
    options: ["300.000 km/s", "150.000 km/s", "1.080 km/h", "3.000 km/s"],
    correctAnswer: "300.000 km/s",
  },
  {
    category: "Ciencia",
    text: "¿Cómo se llama el proceso de las plantas para producir alimento?",
    options: ["Fotosíntesis", "Respiración", "Fermentación", "Digestión"],
    correctAnswer: "Fotosíntesis",
  },
  {
    category: "Ciencia",
    text: "¿Cuál es la molécula que almacena información genética?",
    options: ["ARN", "Proteína", "ADN", "Glucosa"],
    correctAnswer: "ADN",
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    await Question.deleteMany({});
    console.log("🗑️ Preguntas anteriores eliminadas");

    await Question.insertMany(questions);
    console.log(`✅ ${questions.length} preguntas insertadas correctamente`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error insertando preguntas:", err);
    process.exit(1);
  }
})();
