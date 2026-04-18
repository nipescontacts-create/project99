const SECRET_CODE = "onemillion";
const CONTROL_CODE = "2026";
const GOAL_EUR = 10000;

const MOTIVATION_QUOTES = [
  "Cada euro que hoy construyes compra libertad manana.",
  "Disciplina hoy, ingresos grandes despues.",
  "Quien ejecuta rapido, factura primero.",
  "Tu enfoque de hoy financia tu futuro.",
  "Habitos pequenos, resultados millonarios.",
  "El mercado paga a quien crea valor real.",
  "La constancia convierte talento en caja.",
];

const CLIENT_KEYS = [
  "Escucha mas de lo que hablas para detectar necesidades reales.",
  "Responde con claridad y rapidez, la confianza vive en los detalles.",
  "Confirma por escrito acuerdos y proximos pasos.",
  "Habla en resultados, no solo en tareas.",
  "Nunca prometas plazos que no puedas cumplir.",
  "Anticipa dudas con propuestas y ejemplos.",
  "Mide resultados y comparte datos simples.",
  "Cuida el tono: firme, cercano y profesional.",
  "Haz seguimiento constante sin ser invasivo.",
  "Cada cliente quiere sentirse prioritario.",
  "Pregunta objetivos antes de presentar ofertas.",
  "Documenta incidencias y resuelvelas con tiempos claros.",
];

const NEWS_ITEMS = [
  {
    title: "Como mejorar respuestas de Claude para productividad",
    url: "https://www.xataka.com/basics/como-mejorar-respuestas-claude-18-pasos-para-sacarle-maximo-partido",
    tag: "Estrategia IA",
  },
  {
    title: "Secuestro de agentes IA: alerta de seguridad real",
    url: "https://www.xataka.com/seguridad/han-secuestrado-agentes-anthropic-google-microsoft-bien-ciencia-tres-empresas-acabaron-pagando",
    tag: "Seguridad",
  },
  {
    title: "La IA tambien puede invertir y generar dinero",
    url: "https://www.xataka.com/inteligencia-artificial/ia-puede-perder-tu-dinero-cuidado-tambien-puede-ganarlo",
    tag: "Negocio",
  },
];

const BUSINESS_VIDEOS = [
  { title: "Canal inspo negocios", url: "https://www.youtube.com/@AdrianSaenz" },
  { title: "Como cerrar ventas #1", url: "https://youtu.be/s7CXswliPi8?si=tUW1Sbm8xBdrY0Pt" },
  { title: "Como cerrar ventas #2", url: "https://youtu.be/2Xu99hH-5VQ?si=LUDr2-Mxh6BabOcm" },
];

const VIDEO_LIBRARY = [
  { section: "Como cerrar ventas", title: "Cierre de ventas directo", url: "https://youtu.be/cUnkfQjy3bc?si=qSvdaTYFdEXp8Biy" },
  { section: "Como cerrar ventas", title: "Script comercial ganador", url: "https://youtu.be/XEg2b308QlI?si=ZKtGzyVtaeFhwrBJ" },
  { section: "Biblioteca de videos", title: "Mentalidad comercial", url: "https://youtu.be/XeJbPQgnenM?si=mCS9ITC9nVw0Sbtb" },
];

const DAILY_BUSINESS_MESSAGES = [
  "Hoy el objetivo es simple: ejecutar rapido y cerrar con claridad.",
  "Una conversacion de valor puede cambiar la facturacion del mes.",
  "Constancia comercial: mas seguimiento, mas cierres.",
  "Menos perfeccion, mas accion enfocada en resultados.",
  "Cada mensaje con intencion es una oportunidad de venta.",
  "Habla con datos, propone soluciones y cierra siguiente paso.",
  "Tu disciplina de hoy paga tu libertad de manana.",
];

const state = {
  sessionUser: null,
  sessionStart: null,
  sessionTimerInterval: null,
  clockInterval: null,
  chartHistory: [],
  dailyBalance: 0,
};

const $ = (id) => document.getElementById(id);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daySeed() {
  return Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
}

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function notify(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function updateClockAndQuote() {
  const now = new Date();
  $("liveClock").textContent = now.toLocaleString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dayIndex = daySeed() % MOTIVATION_QUOTES.length;
  $("dailyQuote").textContent = MOTIVATION_QUOTES[dayIndex];
}

function updateStreak() {
  const streak = load("project99Streak", { lastOpen: null, count: 0 });
  const today = todayKey();
  if (!streak.lastOpen) {
    streak.lastOpen = today;
    streak.count = 1;
  } else if (streak.lastOpen !== today) {
    const diffDays = Math.floor(
      (new Date(today).getTime() - new Date(streak.lastOpen).getTime()) / (1000 * 60 * 60 * 24)
    );
    streak.count = diffDays === 1 ? streak.count + 1 : 1;
    streak.lastOpen = today;
  }
  save("project99Streak", streak);
  $("streakValue").textContent = `${streak.count} dias`;
}

function renderNewsAndVideos() {
  const seed = daySeed();
  const rotatedNews = NEWS_ITEMS.map((_, i) => NEWS_ITEMS[(seed + i) % NEWS_ITEMS.length]);
  const rotatedBusinessVideos = BUSINESS_VIDEOS.map((_, i) => BUSINESS_VIDEOS[(seed + i) % BUSINESS_VIDEOS.length]);
  const rotatedLibrary = VIDEO_LIBRARY.map((_, i) => VIDEO_LIBRARY[(seed + i) % VIDEO_LIBRARY.length]);

  $("newsList").innerHTML = rotatedNews.map(
    (n) => `<article class="mini-card"><p class="muted">${n.tag}</p><h4>${n.title}</h4><a class="neon-btn" href="${n.url}" target="_blank" rel="noreferrer">Ver</a></article>`
  ).join("");

  $("businessVideosList").innerHTML = rotatedBusinessVideos.map(
    (v) => `<article class="mini-card"><h4>${v.title}</h4><a class="neon-btn" href="${v.url}" target="_blank" rel="noreferrer">Ver</a></article>`
  ).join("");

  const sections = {
    "Inspo negocios": [{ title: "Canal Adrian Saenz", url: "https://www.youtube.com/@AdrianSaenz" }],
    "Como cerrar ventas": rotatedLibrary.filter((v) => v.section === "Como cerrar ventas"),
    "Biblioteca de videos": rotatedLibrary.filter((v) => v.section === "Biblioteca de videos"),
  };

  $("videoSections").innerHTML = Object.entries(sections)
    .map(
      ([name, videos]) =>
        `<article class="mini-card"><h4>${name}</h4>${videos
          .map((v) => `<p>${v.title}</p><a class="neon-btn" href="${v.url}" target="_blank" rel="noreferrer">Ver</a>`)
          .join("")}</article>`
    )
    .join("");
}

function renderDailyKeys() {
  const offset = daySeed() % CLIENT_KEYS.length;
  const picked = Array.from({ length: 5 }, (_, i) => CLIENT_KEYS[(offset + i) % CLIENT_KEYS.length]);
  $("dailyKeysList").innerHTML = picked.map((k) => `<li>${k}</li>`).join("");
}

function renderDailyLoopContent() {
  const seed = daySeed();
  const dailyMessage = DAILY_BUSINESS_MESSAGES[seed % DAILY_BUSINESS_MESSAGES.length];
  const allVideos = [...BUSINESS_VIDEOS, ...VIDEO_LIBRARY];
  const dailyVideo = allVideos[seed % allVideos.length];
  $("dailyBusinessMessage").textContent = dailyMessage;
  $("dailyVideoCard").innerHTML = `<h4>Video del dia: ${dailyVideo.title}</h4><a class="neon-btn" href="${dailyVideo.url}" target="_blank" rel="noreferrer">Ver</a>`;
}

function getTasks() {
  const all = load("project99Tasks", {});
  return all[todayKey()] || [];
}

function setTasks(tasks) {
  const all = load("project99Tasks", {});
  all[todayKey()] = tasks;
  save("project99Tasks", all);
}

function renderTasks() {
  const tasks = getTasks();
  $("taskList").innerHTML = tasks.length
    ? tasks
        .map(
          (t) =>
            `<li><strong>${t.type}</strong> para ${t.member} - limite ${t.deadline}<br><span class="muted">${t.notes}</span></li>`
        )
        .join("")
    : "<li>No hay trabajo registrado hoy.</li>";
}

function getMessages() {
  const all = load("project99Messages", {});
  return all[todayKey()] || [];
}

function setMessages(messages) {
  const all = load("project99Messages", {});
  all[todayKey()] = messages;
  save("project99Messages", all);
}

function renderMessages() {
  const messages = getMessages();
  $("messageHistory").innerHTML = messages.length
    ? messages
        .map((m) => `<li><strong>${m.from}</strong> a ${m.to}<br><span class="muted">${m.text}</span></li>`)
        .join("")
    : "<li>No hay mensajes hoy.</li>";
}

function getFinance() {
  const all = load("project99Finance", {});
  return all[todayKey()] || { balance: 0, history: [] };
}

function setFinance(finance) {
  const all = load("project99Finance", {});
  all[todayKey()] = finance;
  save("project99Finance", all);
}

function drawChart() {
  const canvas = $("profitChart");
  const ctx = canvas.getContext("2d");
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.max(320, canvas.clientWidth);
  const height = 220;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 214, 102, 0.22)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (state.chartHistory.length === 0) return;
  ctx.strokeStyle = "#ffd666";
  ctx.lineWidth = 3;
  ctx.beginPath();
  state.chartHistory.forEach((v, i) => {
    const x = (i / Math.max(1, state.chartHistory.length - 1)) * (width - 20) + 10;
    const y = height - Math.min(Math.max(v, 0), GOAL_EUR) / GOAL_EUR * (height - 20) - 10;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function refreshFinance() {
  const finance = getFinance();
  state.dailyBalance = finance.balance;
  state.chartHistory = finance.history.length ? finance.history : [0];
  $("balanceText").textContent = `Balance hoy: ${state.dailyBalance.toFixed(2)} EUR / ${GOAL_EUR} EUR`;
  drawChart();
}

function addFinance(delta) {
  const note = window.prompt("Anade nota de origen del dinero:");
  if (!note) return;
  const finance = getFinance();
  finance.balance += delta;
  finance.history.push(finance.balance);
  finance.log = finance.log || [];
  finance.log.push({ delta, note, at: new Date().toISOString() });
  setFinance(finance);
  refreshFinance();
}

function updateSessionTimer() {
  if (!state.sessionStart) return;
  $("sessionTimer").textContent = `Tiempo en app: ${formatDuration(Date.now() - state.sessionStart)}`;
}

function persistSessionTime() {
  if (!state.sessionUser || !state.sessionStart) return;
  const key = "project99TimeByUserAndDay";
  const store = load(key, {});
  const day = todayKey();
  store[day] = store[day] || {};
  store[day][state.sessionUser] = (store[day][state.sessionUser] || 0) + (Date.now() - state.sessionStart);
  save(key, store);
  state.sessionStart = Date.now();
}

function setupDashboard(username, role) {
  $("welcomeText").textContent = `${username} (${role})`;
  $("loginView").classList.add("hidden");
  $("dashboardView").classList.remove("hidden");
  updateClockAndQuote();
  updateStreak();
  renderNewsAndVideos();
  renderDailyKeys();
  renderDailyLoopContent();
  renderTasks();
  renderMessages();
  refreshFinance();
  requestNotificationPermission();

  state.clockInterval = setInterval(updateClockAndQuote, 1000);
  state.sessionTimerInterval = setInterval(updateSessionTimer, 1000);
  updateSessionTimer();

  $("welcomeDialog").showModal();
}

function boot() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  $("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = $("username").value.trim();
    const role = $("role").value;
    const secret = $("secretCode").value.trim();
    if (!username || !role || secret !== SECRET_CODE) {
      window.alert("Datos invalidos.");
      return;
    }
    state.sessionUser = username;
    state.sessionStart = Date.now();
    setupDashboard(username, role);
  });

  $("letsGoBtn").addEventListener("click", () => {
    $("welcomeDialog").close();
  });

  $("panelCodeBtn").addEventListener("click", () => {
    const code = $("panelCodeInput").value.trim();
    if (code !== CONTROL_CODE) {
      $("teammateTimeResult").textContent = "Codigo incorrecto.";
      return;
    }
    const times = load("project99TimeByUserAndDay", {});
    const dayTimes = times[todayKey()] || {};
    persistSessionTime();
    const entries = Object.entries(dayTimes);
    $("teammateTimeResult").textContent = entries.length
      ? entries.map(([u, ms]) => `${u}: ${formatDuration(ms)}`).join(" | ")
      : "No hay tiempos guardados aun.";
  });

  $("taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const task = {
      type: $("taskType").value,
      member: $("taskMember").value,
      deadline: $("taskDeadline").value,
      notes: $("taskNotes").value.trim(),
    };
    const tasks = getTasks();
    tasks.push(task);
    setTasks(tasks);
    renderTasks();
    e.target.reset();
    const from = state.sessionUser || "Tu companero";
    notify("Nuevo trabajo asignado", `${from} te ha asignado un trabajo`);
  });

  $("addProfitBtn").addEventListener("click", () => {
    const value = Number(window.prompt("Importe de ganancias EUR:"));
    if (!Number.isFinite(value) || value <= 0) return;
    addFinance(value);
  });

  $("addLossBtn").addEventListener("click", () => {
    const value = Number(window.prompt("Importe de perdidas EUR:"));
    if (!Number.isFinite(value) || value <= 0) return;
    addFinance(-value);
  });

  $("messageForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const to = $("messageMember").value;
    const text = $("messageText").value.trim();
    if (!text) return;
    const message = { from: state.sessionUser || "Equipo", to, text, at: new Date().toISOString() };
    const messages = getMessages();
    messages.push(message);
    setMessages(messages);
    renderMessages();
    e.target.reset();
    notify("Nuevo mensaje", `${message.from} te ha enviado un mensaje`);
  });

  $("logoutBtn").addEventListener("click", () => {
    persistSessionTime();
    clearInterval(state.clockInterval);
    clearInterval(state.sessionTimerInterval);
    window.location.reload();
  });

  window.addEventListener("beforeunload", persistSessionTime);
  window.addEventListener("resize", drawChart);
}

boot();
