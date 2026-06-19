import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// URLs correctas según tu estructura real
const URL_SENSORES = "https://iot-firebase-weatherstation-default-rtdb.firebaseio.com/sensores.json";
const URL_HISTORIAL = "https://iot-firebase-weatherstation-default-rtdb.firebaseio.com/historial.json";

// -----------------------------
// ENDPOINT 1: /contexto
// Datos actuales del clima
// -----------------------------
app.get("/contexto", async (req, res) => {
  try {
    const response = await fetch(URL_SENSORES);
    if (!response.ok) throw new Error("Firebase no respondió correctamente");

    const data = await response.json();
    if (!data) throw new Error("Datos vacíos");

    res.json({
      temperatura: data.temperatura,
      humedad: data.humedad,
      presion: data.presion,
      hora: data.timestamp,
    });
  } catch (error) {
    console.error("Error en /contexto:", error.message);
    res.status(500).json({ error: "Error obteniendo datos" });
  }
});

// -----------------------------
// ENDPOINT 2: /historial
// Historial completo de lecturas
// -----------------------------
app.get("/historial", async (req, res) => {
  try {
    const response = await fetch(URL_HISTORIAL);
    if (!response.ok) throw new Error("Firebase no respondió correctamente");

    const data = await response.json();
    if (!data) throw new Error("Historial vacío");

    res.json(data);
  } catch (error) {
    console.error("Error en /historial:", error.message);
    res.status(500).json({ error: "Error obteniendo historial" });
  }
});

// -----------------------------
app.listen(PORT, () => {
  console.log(`Servidor MCP Weather corriendo en puerto ${PORT}`);
});

// -----------------------------
// ENDPOINT 3: /historial.csv
// Historial completo de lecturas en CSV
// -----------------------------
app.get("/historial.csv", async (req, res) => {
  try {
    // Usamos el mismo endpoint que ya funciona
    const response = await fetch(URL_HISTORIAL);
    if (!response.ok) throw new Error("Firebase no respondió correctamente");

    const historial = await response.json();
    if (!historial) throw new Error("Historial vacío");

    // Convertir objeto en array si Firebase lo devuelve como diccionario
    const registros = Object.values(historial);

    let csv = "fecha,temperatura,humedad,presion\n";

    registros.forEach(item => {
      csv += `${item.timestamp},${item.temperatura},${item.humedad},${item.presion}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.send(csv);

  } catch (error) {
    console.error("Error generando CSV:", error);
    res.status(500).send("Error generando CSV.");
  }
});
