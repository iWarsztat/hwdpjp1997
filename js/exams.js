"use strict";
(function () {
  const body = document.getElementById("examList");
  const sortExams = a => a.slice().sort((x, y) => (x.done - y.done) || x.date.localeCompare(y.date));
  function row(e) {
    const n = daysUntil(e.date), u = e.done ? "done" : urgency(n), d = Number(e.difficulty) || 2;
    return '<tr class="' + (e.done ? "is-done" : "") + '" data-id="' + escapeHtml(e.id) + '"><td>' + tagHTML(e.subject) + "</td>" +
      "<td><strong>" + escapeHtml(e.title) + "</strong></td><td class=\"num\">" + formatDate(e.date) + "</td>" +
      '<td><span class="badge b-' + u + '">' + (e.done ? "Zaliczony" : urgencyText(n)) + "</span><br><span class=\"small muted\">" + daysLabel(n) + "</span></td>" +
      '<td><span class="diff d' + d + '">' + escapeHtml(DIFFICULTY[d]) + "</span></td><td class=\"small\">" + (escapeHtml(e.scope) || '<span class="muted">—</span>') + "</td>" +
      '<td class="acts"><button type="button" class="btn btn-ok btn-sm" data-act="toggle">' + (e.done ? "Cofnij" : "Zaliczony") + '</button> <button type="button" class="btn btn-danger btn-sm" data-act="delete">Usuń</button></td></tr>' +
      (e.done ? "" : '<tr class="plan-row"><td colspan="7"><details><summary>Plan przygotowania</summary>' + studyPlanHTML(e) + "</details></td></tr>");
  }
  function render() {
    const exams = read(KEYS.exams), up = exams.filter(e => !e.done && daysUntil(e.date) >= 0);
    document.getElementById("cUp").textContent = up.length;
    document.getElementById("cUrgent").textContent = up.filter(e => daysUntil(e.date) <= 2).length;
    document.getElementById("cAll").textContent = exams.length;
    body.innerHTML = exams.length ? sortExams(exams).map(row).join("") : '<tr><td colspan="7">' + emptyState("Nie masz jeszcze żadnych sprawdzianów.") + "</td></tr>";
  }
  render();
  bindList(body, KEYS.exams, render);
})();
