const SECRET_CODE = "onemillion";
const CONTROL_CODE = "2026";
const GOAL_EUR = 10000;
const SUPABASE_URL = "https://zynfzmoupglvdqbbijmc.supabase.co";
const SUPABASE_KEY = "sb_publishable_vyzKAPWxQgrei5yqgbV4ng_3O45evHb";

const supabaseClient =
  window.supabase && SUPABASE_URL && SUPABASE_KEY ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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
  tasks: [],
  messages: [],
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
    const diffDays = Math.floor((new Date(today).getTime() - new Date(streak.lastOpen).getTime()) / 86400000);
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

  $("newsList").innerHTML = rotatedNews
    .map(
      (n) =>
        `<article class="mini-card"><p class="muted">${n.tag}</p><h4>${n.title}</h4><a class="neon-btn" href="${n.url}" target="_blank" rel="noreferrer">Ver</a></article>`
    )
    .join("");

  $("businessVideosList").innerHTML = rotatedBusinessVideos
    .map((v) => `<article class="mini-card"><h4>${v.title}</h4><a class="neon-btn" href="${v.url}" target="_blank" rel="noreferrer">Ver</a></article>`)
    .join("");

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

function renderTasks() {
  const tasks = state.tasks;
  $("taskList").innerHTML = tasks.length
    ? tasks
        .map((t) => `<li><strong>${t.type}</strong> para ${t.member} - limite ${t.deadline}<br><span class="muted">${t.notes}</span></li>`)
        .join("")
    : "<li>No hay trabajo registrado hoy.</li>";
}

function renderMessages() {
  const messages = state.messages;
  $("messageHistory").innerHTML = messages.length
    ? messages.map((m) => `<li><strong>${m.from_user}</strong> a ${m.to_user}<br><span class="muted">${m.message}</span></li>`).join("")
    : "<li>No hay mensajes hoy.</li>";
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
    const y = height - (Math.min(Math.max(v, 0), GOAL_EUR) / GOAL_EUR) * (height - 20) - 10;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

async function refreshFinance() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from("finance_entries")
    .select("amount, created_at")
    .gte("created_at", `${todayKey()}T00:00:00`)
    .order("created_at", { ascending: true });

  if (error) return;
  let running = 0;
  const history = [0];
  data.forEach((row) => {
    running += Number(row.amount || 0);
    history.push(running);
  });
  state.dailyBalance = running;
  state.chartHistory = history;
  $("balanceText").textContent = `Balance hoy: ${state.dailyBalance.toFixed(2)} EUR / ${GOAL_EUR} EUR`;
  drawChart();
}

async function addFinance(delta) {
  if (!supabaseClient) return;
  const note = window.prompt("Anade nota de origen del dinero:");
  if (!note) return;
  const entry = {
    amount: delta,
    note,
    entry_type: delta > 0 ? "profit" : "loss",
    created_by: state.sessionUser || "Equipo",
  };
  const { error } = await supabaseClient.from("finance_entries").insert(entry);
  if (!error) await refreshFinance();
}

function updateSessionTimer() {
  if (!state.sessionStart) return;
  $("sessionTimer").textContent = `Tiempo en app: ${formatDuration(Date.now() - state.sessionStart)}`;
}

async function persistSessionTime() {
  if (!state.sessionUser || !state.sessionStart || !supabaseClient) return;
  const elapsed = Date.now() - state.sessionStart;
  const day = todayKey();
  const { data, error } = await supabaseClient
    .from("session_time")
    .select("id, milliseconds")
    .eq("user_name", state.sessionUser)
    .eq("day", day)
    .maybeSingle();

  if (error) return;
  if (data) {
    await supabaseClient.from("session_time").update({ milliseconds: (data.milliseconds || 0) + elapsed, updated_at: new Date().toISOString() }).eq("id", data.id);
  } else {
    await supabaseClient.from("session_time").insert({ user_name: state.sessionUser, day, milliseconds: elapsed });
  }
  state.sessionStart = Date.now();
}

async function loadTasks() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient
    .from("tasks")
    .select("type, member, deadline, notes, created_at")
    .gte("created_at", `${todayKey()}T00:00:00`)
    .order("created_at", { ascending: false });
  state.tasks = data || [];
  renderTasks();
}

async function loadMessages() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient
    .from("messages")
    .select("from_user, to_user, message, created_at")
    .gte("created_at", `${todayKey()}T00:00:00`)
    .order("created_at", { ascending: false });
  state.messages = data || [];
  renderMessages();
}

function setupRealtime() {
  if (!supabaseClient) return;
  supabaseClient
    .channel("project99-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => loadMessages())
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => loadTasks())
    .on("postgres_changes", { event: "*", schema: "public", table: "finance_entries" }, () => refreshFinance())
    .subscribe();
}

function setupModulesToggle() {
  const toggles = document.querySelectorAll(".module-toggle");
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.dataset.target;
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      const willOpen = target.classList.contains("hidden");
      document.querySelectorAll(".module-content").forEach((content) => content.classList.add("hidden"));
      if (willOpen) {
        target.classList.remove("hidden");
        if (targetId === "moduleFinance") {
          setTimeout(drawChart, 30);
        }
      }
    });
  });
}

async function setupDashboard(username, role) {
  $("welcomeText").textContent = `${username} (${role})`;
  $("loginView").classList.add("hidden");
  $("dashboardView").classList.remove("hidden");
  updateClockAndQuote();
  updateStreak();
  renderNewsAndVideos();
  renderDailyKeys();
  renderDailyLoopContent();
  requestNotificationPermission();

  await loadTasks();
  await loadMessages();
  await refreshFinance();
  setupRealtime();

  state.clockInterval = setInterval(updateClockAndQuote, 1000);
  state.sessionTimerInterval = setInterval(updateSessionTimer, 1000);
  updateSessionTimer();
  $("welcomeDialog").showModal();
}

function boot() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  setupModulesToggle();

  $("loginForm").addEventListener("submit", async (e) => {
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
    await setupDashboard(username, role);
  });

  $("letsGoBtn").addEventListener("click", () => {
    $("welcomeDialog").close();
  });

  $("panelCodeBtn").addEventListener("click", async () => {
    const code = $("panelCodeInput").value.trim();
    if (code !== CONTROL_CODE) {
      $("teammateTimeResult").textContent = "Codigo incorrecto.";
      return;
    }
    await persistSessionTime();
    if (!supabaseClient) return;
    const { data } = await supabaseClient.from("session_time").select("user_name, milliseconds").eq("day", todayKey());
    const entries = data || [];
    $("teammateTimeResult").textContent = entries.length
      ? entries.map((e2) => `${e2.user_name}: ${formatDuration(e2.milliseconds || 0)}`).join(" | ")
      : "No hay tiempos guardados aun.";
  });

  $("taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    const task = {
      type: $("taskType").value,
      member: $("taskMember").value,
      deadline: $("taskDeadline").value,
      notes: $("taskNotes").value.trim(),
      created_by: state.sessionUser || "Equipo",
    };
    const { error } = await supabaseClient.from("tasks").insert(task);
    if (!error) {
      e.target.reset();
      notify("Nuevo trabajo asignado", `${state.sessionUser || "Tu companero"} te ha asignado un trabajo`);
      await loadTasks();
    }
  });

  $("addProfitBtn").addEventListener("click", async () => {
    const value = Number(window.prompt("Importe de ganancias EUR:"));
    if (!Number.isFinite(value) || value <= 0) return;
    await addFinance(value);
  });

  $("addLossBtn").addEventListener("click", async () => {
    const value = Number(window.prompt("Importe de perdidas EUR:"));
    if (!Number.isFinite(value) || value <= 0) return;
    await addFinance(-value);
  });

  $("messageForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    const to = $("messageMember").value;
    const text = $("messageText").value.trim();
    if (!text) return;
    const payload = { from_user: state.sessionUser || "Equipo", to_user: to, message: text };
    const { error } = await supabaseClient.from("messages").insert(payload);
    if (!error) {
      e.target.reset();
      notify("Nuevo mensaje", `${payload.from_user} te ha enviado un mensaje`);
      await loadMessages();
    }
  });

  $("logoutBtn").addEventListener("click", async () => {
    await persistSessionTime();
    clearInterval(state.clockInterval);
    clearInterval(state.sessionTimerInterval);
    window.location.reload();
  });

  window.addEventListener("beforeunload", () => {
    persistSessionTime();
  });
  window.addEventListener("resize", drawChart);
}

boot();
