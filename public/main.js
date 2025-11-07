// ==============================
// main.js — Chat del Asistente Il Vestito
// ==============================

const form = document.getElementById("form");
const input = document.getElementById("mensaje");
const chat = document.getElementById("chat");

// Función para agregar mensajes al chat
function agregarMensaje(remitente, texto) {
  const div = document.createElement("div");
  div.classList.add("mensaje", remitente);
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Enviar mensaje al servidor
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const mensaje = input.value.trim();
  if (!mensaje) return;

  agregarMensaje("usuario", mensaje); // 👈 clase corregida
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje })
    });

    const data = await res.json();
    agregarMensaje("bot", data.respuesta || "No se pudo obtener respuesta 😕");
  } catch (error) {
    console.error("Error:", error);
    agregarMensaje("bot", "❌ Error al conectar con el servidor.");
  }
});

// Saludo inicial
window.addEventListener("load", () => {
  agregarMensaje("bot", "👋 ¡Hola! Soy el asistente virtual de Il Vestito. ¿En qué puedo ayudarte hoy?");
});
