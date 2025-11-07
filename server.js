import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // ✅ nuevo
dotenv.config();

// ✅ Definir __dirname manualmente (porque usamos ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// VARIABLES GLOBALES Y CONTEXTO
// ==========================================
let historialConversacion = [];
let ultimoTema = null; // 🧠 Recordar el último tema (para contexto continuo)

const contextoNegocio = `
Sos el asistente virtual de "Il Vestito", un local de alquiler de trajes ubicado en Paso Molino, Montevideo.
Tu misión es brindar atención cálida, profesional y clara a los clientes, ayudándolos con dudas sobre alquileres, precios, señas, retiros y devoluciones.
Cuando respondas, sé breve, amable y directo. 
Si el cliente pide información legal o condiciones, podés usar los términos que aparecen más abajo.

Información básica:
- Dirección: Estamos en Agraciada 4273, Paso Molino, Montevideo.
- Teléfono: 097 931 236
- Horario: Lunes a viernes 11:00 a 18:30 hs, sábados 11:00 a 13:30 hs
- Servicios: Alquiler de trajes, sacos, pantalones, zapatos, camisas y accesorios y venta de camisas
- Pagos: Efectivo o Mercado Pago
- Garantia: $1000 (en efectivo)
- Seña: 50% del costo de alquiler (no reembolsable)

2. VALOR DEL ALQUILER
El valor del alquiler de las prendas de Il Vestito se detalla a continuación:
- Traje (pantalón y saco) .......... $1300
- Solo saco o solo pantalón .......... $750 (en caso que el pantalón necesite dobladillo el costo es de $850)
- Chalecos .......... $450 — Chaleco niño .......... $300
- Zapatos .......... $650 — Zapatos niño .......... $500
- Accesorios (corbata, moños, tiradores, cinturón, pañuelos) .......... $200 c/u
- Camisa niño .......... $400

A la venta:
- Camisa .......... $990

Además del monto del alquiler, se solicita una garantia valor $1000 (en efectivo).
Los medios de pago son en efectivo o Mercado Pago.

Luego de esta información, se incluyen los Términos y Condiciones de Uso completos de Il Vestito:


==============================
TÉRMINOS Y CONDICIONES DE USO
==============================

Estos Términos y Condiciones de Uso aplican para todos los clientes de Il Vestito con el fin de preservar las prendas para brindar un servicio al cliente de calidad. 
Por lo que, al utilizar nuestros servicios los mismos siempre serán aplicables y así expresamente lo manifiestas como cliente. 
Por lo anterior, te invitamos a leerlos detenidamente, por cualquier duda nos solicitas las aclaraciones necesarias.

1. OBLIGACIÓN DEL CLIENTE
Como cliente de Il Vestito te comprometes expresamente a adoptar todas las medidas que sean necesarias a efectos de mantener la integridad y calidad de la prenda a alquilar, así como a prevenir cualquier tipo de daño que se pudiere causar al mismo. 
Comunicando de manera oportuna a Il Vestito los eventuales daños o la pérdida total o parcial de la prenda.

Bajo ninguna circunstancia, podrás realizar arreglos, ajustes, remiendos, modificaciones o alteraciones de las prendas de Il Vestito que tomes en alquiler. 
En caso de hacerlo, Il Vestito se reserva el derecho de cobrarte la totalidad del depósito solicitado.

2. VALOR DEL ALQUILER
El valor del alquiler de las prendas de Il Vestito se detalla a continuación:
- Traje (pantalón y saco) .......... $1300
- Solo saco o solo pantalón .......... $750 (en caso que el pantalón necesite dobladillo el costo es de $850)
- Chalecos .......... $450 — Chaleco niño .......... $300
- Zapatos .......... $650 — Zapatos niño .......... $500
- Accesorios (corbata, moños, tiradores, cinturón, pañuelos) .......... $200 c/u
- Camisa niño .......... $400

A la venta:
- Camisa .......... $990

Además del monto del alquiler, se solicita un depósito valor $1000 (en efectivo).
Los medios de pago son en efectivo o Mercado Pago.

3. SEÑA Y DEPÓSITO
Para reservar la prenda, Il Vestito cobra una seña del 50% del costo de alquiler, la cual no se reintegra por ningún motivo. 
En caso de que se deje una seña mayor al 50% del alquiler, la diferencia tampoco se reintegra, pero la misma queda a su disposición para ser usada con un límite máximo de un mes a partir de la fecha en que se hizo la reserva. 
Siempre y cuando el traje no haya sido preparado para retirar (se solicita al cliente que cualquier cancelación se comunique con el local 48 hs antes de la fiesta en lo posible de manera presencial).
La seña no es transferible.

4. RETIRO Y DEVOLUCIONES
La prenda se retira el mismo día de la fiesta, en caso de necesitar retirarla el día anterior únicamente se podrá hacer de 17:30 a 18:30 hs.
En caso de hacerlo luego de 18:30 hs se esperará al cliente con horario máximo 19:30 hs y el mismo deberá abonar $100 pesos uruguayos cada 30 minutos de atraso.
En caso de que el día de retiro sea sábado se esperará hasta las 14:30 hs.
Si el cliente desea retirar el traje antes del horario establecido tendrá un costo de $250 adicional al monto del alquiler y depósito por cada día extra.
Cuando el evento es de lunes a jueves la prenda deberá reintegrarse si o sí al otro día, cuando el evento es sábado o domingo la prenda se reintegra el lunes.
El horario tanto para retiros como para devoluciones es el habitual del local.
Por atraso en la entrega que excede los dos días, se cobra el 100% del valor del depósito.
Si el tiempo de devolución no se cumple tal cual fue entregada, de lo contrario también se generará una multa equivalente al 50% del valor del depósito.
El lavado de la prenda corre por cuenta de Il Vestito.

5. CAMBIOS
Una vez señalada/s la/s prenda/s, la única forma de realizar un cambio es abonando el 50% del alquiler de la/s nueva/s prenda/s.

6. VALOR DE REPOSICIÓN POR PÉRDIDA O DESTRUCCIÓN TOTAL O PARCIAL
Como cliente de Il Vestito aceptas que se retiene el 100% del depósito de la prenda alquilada en caso que la misma tenga: manchas graves, quemaduras, rajaduras, enganches, marcas en zapatos o zapatos con materia fecal.
En caso que se dé por perdida, ya sea por pérdida material, por destrucción total o parcial, el cliente se compromete a abonar el costo de la garantía y además la suma de $2000 (pesos uruguayos dos mil).
7. FORMA DE PAGO DEL VALOR DE REPOSICIÓN

En caso que transcurran más de tres (3) días calendario contados a partir de la fecha de entrega acordada entre las partes sin que hayas retornado nuestras prendas, Il Vestito quedará facultada para hacer efectivo el depósito que has otorgado y/o adoptar las medidas judiciales que considere pertinentes a efectos de obtener el pago del valor de reposición de la/s prenda/s.

Estos Términos y Condiciones de Uso se complementan con el Contrato de Alquiler que entregamos.

Por cualquier consulta comunicarse al 097 931 236.
Horario de atención: lunes a viernes de 11:00 hs a 18:30 hs / sábados de 11:00 a 13:30 hs.
// dentro de contextoNegocio:
Por favor tener en cuenta también:

- Es obligatorio presentar la **cédula de identidad** al momento de realizar cualquier alquiler o compra.
- Las consultas sobre **talles, medidas o pruebas de prendas** se realizan **únicamente en el local**, ya que cada cuerpo y modelo puede variar.
- No se reservan prendas sin seña ni sin confirmar la talla presencialmente.
- Para mayor seguridad, recomendamos venir personalmente al local para probarse el traje y confirmar los detalles.

`;

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// 📜 Registrar conversación en archivo de texto
function registrarConversacion(usuario, mensaje, respuesta) {
  try {
    const log = {
      fecha: new Date().toLocaleString(),
      usuario,
      mensaje,
      respuesta
    };
    fs.appendFileSync("conversaciones.txt", JSON.stringify(log) + "\n");
  } catch (error) {
    console.error("No se pudo registrar conversación:", error.message);
  }
}


// 🚫 Palabras prohibidas
const palabrasProhibidas = ["puta", "mierda", "carajo", "idiota", "imbécil"];

// 💬 Saludos automáticos variables
const saludos = [
  "¡Hola! 👋 Soy el asistente virtual de Il Vestito. ¿En qué puedo ayudarte hoy? 👔",
  "¡Bienvenido a Il Vestito! 😊 Estoy acá para ayudarte con precios, reservas o devoluciones.",
  "¡Hola! Soy el asistente de Il Vestito 👔. ¿Querés consultar disponibilidad o precios?"
];
// ====== PRECIOS CENTRALES (fácil de mantener) ======
const PRECIOS = {
  traje: "Traje (pantalón y saco) $1300.",
  saco: "Solo saco $750.",
  pantalon: "Solo pantalón $750 (si necesita dobladillo el costo es $850).",
  chaleco: "Chaleco $450 — Chaleco niño $300.",
  zapatos: "Zapatos $650 — Zapatos niño $500.",
  camisa: "Camisa niño $400. A la venta: camisa $990.",
  accesorios: "Accesorios (corbata, moños, tiradores, cinturón, pañuelos) $200 c/u."
};

// Helpers para detección robusta
function normalizar(t) {
  return t.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // saca acentos
}
function hasWord(t, w) {
  return new RegExp(`\\b${w}s?\\b`).test(t); // singular/plural básico
}


// ⚡ Respuestas rápidas
function obtenerRespuestaRapida(mensaje) {
  const texto = mensaje.toLowerCase();

  // ------- DAÑOS Y MANCHAS (prioridad más alta) -------
  if (texto.match(/(dañad[ao]|romp|perd[ií]|ensuci|manch|lavar|lavarlo|limpiar)/))
    return "No es necesario que laves la prenda. Si se mancha o se daña, Il Vestito se encarga del lavado. En caso de daño grave o pérdida, se retiene el depósito y puede aplicarse un cargo adicional de $2000 según el estado.";

  // ------- DIRECCIÓN -------
  if (texto.match(/(direcci[oó]n|donde|ubicad[ao]s?)/))
    return "Estamos en Agraciada 4273, Paso Molino, Montevideo.";

  // ------- HORARIOS -------
  if (texto.match(/(horario|abren|cierran|hasta qu[eé] hora)/))
    return "Nuestro horario es lunes a viernes de 11:00 a 18:30 hs y sábados de 11:00 a 13:30 hs.";

  // ------- CONTACTO -------
  if (texto.match(/(tel[eé]fono|whatsapp|contacto|n[uú]mero)/))
    return "Podés comunicarte al 097 931 236 por llamadas o WhatsApp.";

  // ------- PRECIOS DETALLADOS -------
  if (texto.includes("chaleco"))
    return "El alquiler del chaleco cuesta $450, y el de niño $300.";
  if (texto.includes("zapato"))
    return "El alquiler de zapatos cuesta $650, y los de niño $500.";
  if (texto.includes("camisa"))
    return "Las camisas de niño cuestan $400 y a la venta cuestan $990.";
  if (texto.includes("accesorio") || texto.includes("corbata") || texto.includes("moño") || texto.includes("tirador") || texto.includes("cinturón") || texto.includes("pañuelo"))
    return "Los accesorios (corbata, moños, tiradores, cinturón o pañuelos) cuestan $200 cada uno.";
  if (texto.includes("saco") || texto.includes("pantalón") || texto.includes("pantalon"))
    return "El alquiler de solo saco o pantalón cuesta $750 (si necesita dobladillo $850).";
  if (texto.includes("traje"))
    return "El alquiler de un traje (saco + pantalón) cuesta $1300.";

  // ------- PRECIOS GENÉRICO -------
  if (texto.includes("precio") || texto.includes("valor") || texto.includes("alquiler"))
    return "Traje completo ( saco + pantalon ) : $1300 — Saco o pantalón $750 (dobladillo $850) — Chaleco $450 (niño $300) — Zapatos $650 (niño $500) — Accesorios $200 c/u — Camisa niño $400, a la venta $990.";

  // ------- SEÑA Y DEPÓSITO -------
  if (texto.match(/(seña|señal|reserva|anticipo)/))
    return "Para reservar se deja una seña del 50% del alquiler, no reembolsable. El depósito de garantía es de $1000 en efectivo.";

  // ------- DEVOLUCIONES -------
  if (texto.match(/(devolver|devoluci[oó]n|reintegro|entrega)/))
    return "Las prendas se devuelven al día siguiente habil del evento (lunes si fue fin de semana). Atrasos por dia se cobra el 50% de la garantia, Atrasos mayores a 2 días se genera procesos legales.";

  // ------- CAMBIOS -------
  if (texto.match(/(cambio|cambiar|modificar)/))
    return "Una vez señalada la prenda, solo se puede cambiar abonando el 50% del alquiler de la nueva.";

  // ------- RETRASOS -------
  if (texto.includes("tarde") && ultimoTema === "alquiler")
    return "Si devolvés el traje tarde, se cobra una multa del 50% del depósito o el 100% si pasa de dos días.";

  // ------- AGRADECIMIENTOS -------
  if (/(gracias|ok|b[ue]+no|dale)/.test(texto))
    return "¡Gracias a vos! 😊 Cualquier otra consulta, estoy acá para ayudarte.";

  return null;
}


// ==========================================
// ENDPOINT PRINCIPAL DEL CHAT
// ==========================================
app.post("/chat", async (req, res) => {
  const { mensaje } = req.body;

  try {
    // 🚫 Detectar lenguaje inapropiado
    if (palabrasProhibidas.some(p => mensaje.toLowerCase().includes(p))) {
      const respuesta = "Prefiero mantener una conversación respetuosa 😊";
      registrarConversacion("cliente", mensaje, respuesta);
      return res.json({ respuesta });
    }

// 👋 Si es el primer mensaje, agrego un saludo al historial,
// pero NO corto la ejecución (así proceso el mensaje del usuario).
if (historialConversacion.length === 0) {
  const saludo = saludos[Math.floor(Math.random() * saludos.length)];
  historialConversacion.push({ role: "assistant", content: saludo });
}


    // ⚡ Respuesta rápida (sin IA)
    // ⚡ Respuesta rápida mejorada: solo si la pregunta es corta o directa
let rapida = null;
if (mensaje.length < 40 || mensaje.split(" ").length < 7) {
  rapida = obtenerRespuestaRapida(mensaje);
}


    // 🧠 Agregar mensaje al historial
    historialConversacion.push({ role: "user", content: mensaje });
    if (historialConversacion.length > 10) historialConversacion.shift();

    if (rapida) {
      registrarConversacion("cliente", mensaje, rapida);
      return res.json({ respuesta: rapida });
    }

    // 🧾 Preparar contexto para IA
const mensajes = [
  {
    role: "system",
    content: `
${contextoNegocio}

REGLAS:
REGLAS:
- Usá SIEMPRE los precios y condiciones de este contexto si el usuario pregunta por algo listado.
- Si pide “precio de X”, respondé el precio exacto de X en una o dos frases, sin rodeos.
- Si pregunta por talles, medidas o cortes, aclarar que debe venir al local a probarse la prenda.
- Si pregunta por seña o reserva, aclarar que es 50% del alquiler y no se reembolsa.
- Si pregunta por pago con tarjeta, confirmá que se acepta crédito o débito.
- Si pregunta por garantía, aclarar que son $1000 en efectivo y no se transfiere.
- Si pregunta por cambio de prenda, aclarar que se puede hacer abonando el 50% de la nueva.
- Si pregunta si puede retirar sin el papel, aclarar que puede hacerlo presentando la cédula.
- Si pregunta por horarios, recordá el horario del local.
- Sé breve, amable y profesional, como si atendieras personalmente en Il Vestito.
- Si el cliente pregunta algo parecido pero no exacto, buscá el significado más cercano en el contexto.
- Si el usuario dice “gracias” o “ok”, respondé cordialmente sin repetir precios.
`
  },
  ...historialConversacion,
  { role: "system", content: "Tono amable, profesional y claro — como atendiendo en Il Vestito." }
];

const respuestaIA = await axios.post(
  "https://api.openai.com/v1/chat/completions",
  {
    model: "gpt-4o-mini",
    messages: mensajes,
    temperature: 0.2,   // más exacto
    max_tokens: 180     // respuestas cortas
  },
  { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
);


    const textoRespuesta = respuestaIA.data.choices[0].message.content;

    // 💾 Guardar respuesta
    historialConversacion.push({ role: "assistant", content: textoRespuesta });
    registrarConversacion("cliente", mensaje, textoRespuesta);

    // 🩵 Fallback si no entiende
    if (textoRespuesta.toLowerCase().includes("no sé") || textoRespuesta.length < 5) {
      const fallback = "No estoy seguro de eso 🤔, pero puedo ayudarte con precios, horarios o reservas.";
      registrarConversacion("cliente", mensaje, fallback);
      return res.json({ respuesta: fallback });
    }

    // ✅ Responder
    res.json({ respuesta: textoRespuesta });

} catch (error) {
  console.error("❌ Error en el servidor:", error.message);

  // Si OpenAI devolvió un error más detallado
  if (error.response) {
    console.error("🔍 Detalles del error de OpenAI:");
    console.error(JSON.stringify(error.response.data, null, 2));
  }

  res.status(500).json({
    error: "Error al conectar con OpenAI",
    detalle: error.response?.data || error.message
  });
}

});

// ==========================================
// ENDPOINT PARA REINICIAR
// ==========================================
app.post("/reiniciar", (req, res) => {
  historialConversacion = [];
  ultimoTema = null;
  res.json({ mensaje: "✅ Conversación reiniciada" });
});
// ✅ NUEVO: Ruta raíz para servir el index.html
import { dirname } from "path";
app.use(express.static(path.join(__dirname, "public"))); 

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==========================================
// SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Servidor Il Vestito corriendo en el puerto ${PORT}`);
});
