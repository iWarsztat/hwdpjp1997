"use strict";
(function () {
  const $ = id => document.getElementById(id), today = new Date().getDay();
  const tasks = read(KEYS.tasks), exams = read(KEYS.exams);
  const c = d => d === today ? ' class="is-today"' : "";
  const dateOf = d => toISO(addDays(startOfToday(), (d - today + 7) % 7));

  let h = '<table class="tt"><thead><tr><th></th>' + WEEK_ORDER.map(d => "<th" + c(d) + ">" + DAY_NAMES[d] + (d === today ? ' <span class="badge b-calm">dziś</span>' : "") + "</th>").join("") + "</tr></thead><tbody>";
  h += "<tr><th>Szkoła</th>" + WEEK_ORDER.map(d => "<td" + c(d) + ">" + (SCHOOL_END[d] ? "<strong>" + SCHOOL_START + "–" + SCHOOL_END[d] + "</strong>" : '<span class="muted">wolne</span>') + "</td>").join("") + "</tr>";
  for (let i = 0; i < 3; i++) {
    h += "<tr><th>Nauka " + (i + 1) + "</th>" + WEEK_ORDER.map(d => { const s = STUDY[d][i]; return "<td" + c(d) + '><span class="num">' + s[0] + "–" + s[1] + "</span><br>" + tagHTML(s[2]) + "</td>"; }).join("") + "</tr>";
  }
  h += "<tr><th>Terminy</th>" + WEEK_ORDER.map(d => {
    const iso = dateOf(d), t = tasks.filter(x => !x.done && x.due === iso).length, e = exams.filter(x => !x.done && x.date === iso).length;
    return "<td" + c(d) + ">" + (e ? '<span class="chip chip-exam">Sprawdziany: ' + e + "</span> " : "") + (t ? '<span class="chip chip-task">Zadania: ' + t + "</span>" : "") + (!e && !t ? '<span class="muted">—</span>' : "") + "</td>";
  }).join("") + "</tr>";
  h += "<tr><th>Uwagi</th>" + WEEK_ORDER.map(d => "<td" + c(d) + ' class="small' + (d === today ? " is-today" : "") + '">' + escapeHtml(DAY_INFO[d]) + (SCHOOL_END[d] ? " Odpoczynek " + REST_MIN + " min." : "") + "</td>").join("") + "</tr></tbody></table>";
  $("weekTable").innerHTML = h;

  /* Terminarz miesięczny */
  let off = 0;
  function renderCal() {
    const b = new Date(), first = new Date(b.getFullYear(), b.getMonth() + off, 1);
    $("calLabel").textContent = first.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
    const lead = (first.getDay() + 6) % 7, total = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate(), now = toISO(new Date());
    let html = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map(n => '<div class="cal-h">' + n + "</div>").join("");
    for (let i = 0; i < lead; i++) html += '<div class="cal-cell out"></div>';
    for (let d = 1; d <= total; d++) {
      const iso = toISO(new Date(first.getFullYear(), first.getMonth(), d));
      const items = exams.filter(e => !e.done && e.date === iso).map(e => ['chip-exam', "Sprawdzian: " + e.subject + " — " + e.title])
        .concat(tasks.filter(t => !t.done && t.due === iso).map(t => ['chip-task', "Zadanie: " + t.subject + " — " + t.title]));
      html += '<div class="cal-cell' + (iso === now ? " now" : "") + '"><span class="cal-d">' + d + "</span>" +
        items.slice(0, 3).map(x => '<span class="chip ' + x[0] + '" title="' + escapeHtml(x[1]) + '">' + escapeHtml(x[1]) + "</span>").join("") +
        (items.length > 3 ? '<span class="muted small">+' + (items.length - 3) + " więcej</span>" : "") + "</div>";
    }
    $("cal").className = "cal"; $("cal").innerHTML = html;
  }
  $("calPrev").addEventListener("click", () => { off--; renderCal(); });
  $("calNext").addEventListener("click", () => { off++; renderCal(); });
  $("calToday").addEventListener("click", () => { off = 0; renderCal(); });
  renderCal();
})();
