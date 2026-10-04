"use strict";
(function () {
  const now = new Date(), dow = now.getDay();
  const tasks = read(KEYS.tasks), exams = read(KEYS.exams);
  const open = sortTasks(tasks).filter(t => !t.done);
  const urgent = open.filter(t => daysUntil(t.due) <= 2);
  const upcoming = exams.filter(e => !e.done && daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));

  document.getElementById("todayDay").textContent = DAY_NAMES[dow];
  document.getElementById("todayDate").textContent = now.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  let msg = dow >= 1 && dow <= 5 ? "Po szkole odpocznij około 45 minut. Potem zacznij od najpilniejszego przedmiotu."
    : dow === 6 ? "Sobota to dobry dzień na nadrobienie zaległości i większe partie materiału."
    : "Lekka powtórka i plan na kolejny tydzień. Odpocznij, jutro szkoła.";
  if (open.length) msg += " Najpilniejsze: " + open[0].title + " (" + open[0].subject + ").";
  document.getElementById("todayMsg").textContent = msg;

  document.getElementById("statSchool").textContent = SCHOOL_END[dow] ? SCHOOL_START + "–" + SCHOOL_END[dow] : "wolne";
  document.getElementById("statUrgent").textContent = urgent.length;
  document.getElementById("statExams").textContent = upcoming.length;
  document.getElementById("statRest").textContent = REST_MIN + " min";

  const nowMin = now.getHours() * 60 + now.getMinutes();
  document.getElementById("studyList").innerHTML = STUDY[dow].map(s => {
    const a = toMin(s[0]), b = toMin(s[1]), cur = nowMin >= a && nowMin < b;
    return '<tr' + (cur ? ' class="is-now"' : "") + '><td class="num">' + s[0] + "–" + s[1] + (cur ? ' <span class="badge b-warn">teraz</span>' : "") + "</td><td>" + tagHTML(s[2]) + "</td><td>" + (b - a) + " min</td></tr>";
  }).join("");

  function renderTasks() {
    const el = document.getElementById("urgentTasks");
    const list = sortTasks(read(KEYS.tasks)).filter(t => !t.done).slice(0, 5);
    el.innerHTML = list.length ? list.map(t => taskItemHTML(t, false)).join("")
      : '<li>' + emptyState(read(KEYS.tasks).length ? "Wszystkie zadania wykonane. Świetna robota!" : "Nie masz jeszcze żadnych zadań.") + "</li>";
    document.getElementById("statUrgent").textContent = read(KEYS.tasks).filter(t => !t.done && daysUntil(t.due) <= 2).length;
  }
  renderTasks();
  bindList(document.getElementById("urgentTasks"), KEYS.tasks, renderTasks);

  const box = document.getElementById("nextExam");
  if (upcoming.length) {
    const e = upcoming[0], n = daysUntil(e.date), u = urgency(n);
    const rest = upcoming.slice(1, 5);
    const moreHTML = rest.length ? '<table class="table"><thead><tr><th>Przedmiot</th><th>Data</th><th>Za</th></tr></thead><tbody>' + rest.map(x => "<tr><td>" + tagHTML(x.subject) + "</td><td>" + formatDate(x.date) + "</td><td>" + daysLabel(daysUntil(x.date)) + "</td></tr>").join("") + "</tbody></table>" : "";
    box.innerHTML = '<div class="exam-next u-' + u + '"><span class="badge b-' + u + '">' + urgencyText(n) + "</span>" +
      "<h3>" + escapeHtml(e.subject) + " — " + escapeHtml(e.title) + "</h3><p>" + formatDate(e.date) + "<br><strong>" + daysLabel(n) + "</strong></p>" +
      '<a href="sprawdziany.html" class="btn btn-ghost btn-sm">Zobacz plan przygotowania</a></div>' + moreHTML;
  } else box.innerHTML = emptyState("Nie masz jeszcze żadnych sprawdzianów.");

  /* Powiadomienia przeglądarki */
  const btn = document.getElementById("notifBtn"), info = document.getElementById("notifInfo");
  function notifyReal() {
    const key = toISO(now);
    if (localStorage.getItem(KEYS.notified) === key) return;
    const body = urgent.length ? "Pilne zadania: " + urgent.length + ". Najpierw: " + urgent[0].title : upcoming.length ? "Najbliższy sprawdzian: " + upcoming[0].subject + " — " + daysLabel(daysUntil(upcoming[0].date)) : "";
    if (!body) return;
    try { new Notification("Planer nauki", { body: body }); localStorage.setItem(KEYS.notified, key); } catch (e) { /* ignoruj */ }
  }
  if (!("Notification" in window)) { btn.hidden = true; info.textContent = "Ta przeglądarka nie obsługuje powiadomień."; }
  else if (Notification.permission === "granted") { btn.hidden = true; info.textContent = "Przypomnienia są włączone."; notifyReal(); }
  else if (Notification.permission === "denied") { btn.hidden = true; info.textContent = "Powiadomienia są zablokowane. Zmień to w ustawieniach przeglądarki."; }
  btn.addEventListener("click", () => {
    Notification.requestPermission().then(p => {
      if (p === "granted") { btn.hidden = true; info.textContent = "Przypomnienia są włączone."; notifyReal(); }
      else info.textContent = "Nie udzielono zgody na powiadomienia.";
    });
  });
})();
