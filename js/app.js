"use strict";
/* Wspólne dane i funkcje pomocnicze */
const KEYS = { tasks: "planner_tasks_v2", exams: "planner_exams_v2", notified: "planner_notified_v2" };
const SUBJECTS = ["Biologia", "Chemia", "Doradztwo zawodowe", "Edukacja dla bezpieczeństwa", "Edukacja zdrowotna", "Fizyka", "Język niemiecki", "Język polski", "Matematyka", "Religia", "WOS"];
const DAY_NAMES = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const SCHOOL_START = "7:30";
const SCHOOL_END = { 1: "13:50", 2: "14:55", 3: "13:50", 4: "14:55", 5: "13:00" };
const REST_MIN = 45;
const DIFFICULTY = { 1: "Łatwy", 2: "Średni", 3: "Trudny" };
const STUDY = {
  1: [["14:35", "15:20", "Matematyka"], ["15:30", "16:15", "Język polski"], ["16:35", "17:20", "Biologia"]],
  2: [["15:40", "16:25", "Chemia"], ["16:35", "17:20", "Język niemiecki"], ["17:40", "18:25", "Matematyka"]],
  3: [["14:35", "15:20", "Fizyka"], ["15:30", "16:15", "WOS"], ["16:35", "17:20", "Język polski"]],
  4: [["15:40", "16:25", "Biologia"], ["16:35", "17:20", "Chemia"], ["17:40", "18:25", "Matematyka"]],
  5: [["13:45", "14:30", "Język niemiecki"], ["14:40", "15:25", "Fizyka"], ["15:45", "16:30", "WOS"]],
  6: [["10:00", "10:45", "Matematyka"], ["11:00", "11:45", "Chemia"], ["12:15", "13:00", "Język polski"]],
  0: [["10:30", "11:15", "Biologia"], ["11:30", "12:15", "Fizyka"], ["16:00", "16:45", "Powtórka / zaległości"]]
};
const DAY_INFO = {
  1: "Krótkie bloki po szkole.", 2: "Dłuższy dzień w szkole, nauka od 15:40.", 3: "Krótkie bloki po szkole.",
  4: "Dłuższy dzień w szkole, nauka od 15:40.", 5: "Najkrótszy dzień w szkole, lekki weekend przed Tobą.",
  6: "Nadrabianie i większe partie materiału.", 0: "Lekka powtórka i planowanie kolejnego tygodnia."
};

function read(key) {
  try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : []; }
  catch (e) { return []; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}
function uid(prefix) { return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function parseISO(s) { const p = String(s).split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function toISO(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function startOfToday() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
function addDays(date, n) { return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n); }
function formatDate(iso) { if (!iso) return "bez terminu"; const d = parseISO(iso); return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear(); }
function daysUntil(iso) { if (!iso) return Infinity; return Math.round((parseISO(iso) - startOfToday()) / 864e5); }
function daysLabel(n) {
  if (n === Infinity) return "bez terminu";
  if (n < 0) return "po terminie (" + (-n) + (n === -1 ? " dzień" : " dni") + " temu)";
  if (n === 0) return "dziś";
  if (n === 1) return "jutro";
  return "za " + n + " dni";
}
function urgency(n) { return n <= 2 ? "urgent" : n <= 7 ? "warn" : "calm"; }
function urgencyText(n) { return n <= 2 ? "Pilne" : n <= 7 ? "Zbliża się" : "Spokojnie"; }
function fillSubjects(select) {
  select.innerHTML = '<option value="" disabled selected>Wybierz przedmiot</option>' + SUBJECTS.map(s => '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + "</option>").join("");
}
function showMessage(el, text) {
  el.textContent = text; el.classList.add("show");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 3500);
}
function emptyState(text) {
  return '<div class="empty"><p>' + escapeHtml(text) + '</p><a class="btn btn-primary" href="dodaj.html">+ Dodaj</a></div>';
}

/* Zadania */
function sortTasks(list) {
  return list.slice().sort((a, b) => (a.done - b.done) || (daysUntil(a.due) - daysUntil(b.due)) || 0);
}
function taskItemHTML(t, withDelete) {
  const n = daysUntil(t.due), u = t.done ? "done" : urgency(n);
  return '<li class="task' + (t.done ? " is-done" : "") + '" data-id="' + escapeHtml(t.id) + '">' +
    '<label class="check"><input type="checkbox" data-act="toggle"' + (t.done ? " checked" : "") + ' aria-label="Oznacz jako wykonane"><span class="box"></span></label>' +
    '<div class="task-body"><strong class="task-title">' + escapeHtml(t.title) + "</strong>" +
    '<div class="meta">' + tagHTML(t.subject) + '<span class="due due-' + u + '">' + formatDate(t.due) + " — " + daysLabel(n) + "</span></div>" +
    (t.note ? '<p class="note">' + escapeHtml(t.note) + "</p>" : "") + "</div>" +
    (withDelete ? '<button type="button" class="btn btn-danger btn-sm" data-act="delete">Usuń</button>' : "") + "</li>";
}
/* Obsługa kliknięć na liście (zadania lub sprawdziany): toggle / delete */
function bindList(container, key, rerender) {
  container.addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const item = btn.closest("[data-id]");
    if (!item) return;
    const id = item.dataset.id;
    let list = read(key);
    if (btn.dataset.act === "toggle") list = list.map(x => x.id === id ? Object.assign({}, x, { done: !x.done }) : x);
    else if (btn.dataset.act === "delete") list = list.filter(x => x.id !== id);
    else return;
    write(key, list);
    rerender();
  });
}

/* Automatyczny plan przygotowania do sprawdzianu (nigdy po terminie) */
function studyPlan(exam) {
  const d = daysUntil(exam.date);
  if (d < 0) return [];
  const base = [30, 40, 45][(Number(exam.difficulty) || 2) - 1] || 40;
  if (d === 0) return [{ off: 0, min: 20, text: "Szybka powtórka najważniejszych zagadnień" }];
  if (d === 1) return [{ off: 0, min: base, text: "Najważniejsze zagadnienia" }, { off: 0, min: 30, text: "Test próbny i poprawa błędów" }];
  if (d >= 7) {
    const L = [["Poznanie materiału", base], ["Nauka + pytania", base], ["Ćwiczenia", base], ["Powtórka", base], ["Zadania i notatki", base], ["Test", 30], ["Szybka powtórka", 30]];
    return L.map((s, i) => ({ off: Math.round(i * (d - 1) / 6), min: s[1], text: s[0] }));
  }
  const L = d <= 3
    ? [["Intensywna nauka materiału", base], ["Ćwiczenia + test próbny", base]]
    : [["Poznanie materiału", base], ["Nauka + pytania", base], ["Ćwiczenia", base], ["Powtórka", base], ["Test", 30]];
  return L.slice(0, d - 1).map((s, i) => ({ off: i, min: s[1], text: s[0] })).concat([{ off: d - 1, min: 30, text: "Szybka powtórka" }]);
}
function studyPlanHTML(exam) {
  const d = daysUntil(exam.date);
  if (d < 0) return '<p class="muted">Termin minął — plan nie jest generowany.</p>';
  const mode = d >= 7 ? "spokojne rozłożenie" : d >= 4 ? "średnia intensywność" : d >= 2 ? "intensywne powtórki" : d === 1 ? "najważniejsze zagadnienia + test" : "szybka powtórka";
  const rows = studyPlan(exam).map(s => {
    const when = s.off === 0 ? "Dziś" : s.off === 1 ? "Jutro" : "+" + s.off + " dni";
    const day = s.off === d - 1 && d >= 2 ? " (dzień przed)" : "";
    return "<li><span class=\"t-time\">" + when + day + " — " + formatDate(toISO(addDays(startOfToday(), s.off))) + "</span><div><strong>" + s.min + " min</strong> — " + escapeHtml(s.text) + "</div></li>";
  }).join("");
  return '<p class="muted">Tryb: ' + mode + "</p><ol class=\"timeline\">" + rows + "</ol>";
}

/* Wygląd e-dziennika: kolory przedmiotów, pasek użytkownika, stopka */
function tagHTML(subject) {
  const i = SUBJECTS.indexOf(subject), h = i < 0 ? 220 : (i * 47) % 360;
  return '<span class="tag" style="--h:' + h + '">' + escapeHtml(subject) + "</span>";
}
function toMin(hhmm) { const p = String(hhmm).split(":"); return Number(p[0]) * 60 + Number(p[1]); }
(function () {
  const bar = document.querySelector(".topbar-inner");
  if (!bar) return;
  const u = document.createElement("div");
  u.className = "userbar";
  function tick() {
    const n = new Date();
    u.innerHTML = "<span>Rok szkolny 2026/2027</span><strong>" + n.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" }) + ", " + n.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) + "</strong>";
  }
  tick(); setInterval(tick, 30000);
  bar.insertBefore(u, bar.querySelector("nav"));
  const f = document.createElement("footer");
  f.className = "footer";
  f.textContent = "Planer nauki — dane są zapisywane tylko w tej przeglądarce (localStorage).";
  document.body.appendChild(f);
})();
