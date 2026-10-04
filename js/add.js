"use strict";
(function () {
  const $ = id => document.getElementById(id), today = toISO(startOfToday());
  fillSubjects($("taskSubject")); fillSubjects($("examSubject"));
  $("examDate").min = today;

  $("taskForm").addEventListener("submit", e => {
    e.preventDefault();
    const title = $("taskTitle").value.trim();
    if (!title) return;
    const list = read(KEYS.tasks);
    list.push({ id: uid("task"), title: title, subject: $("taskSubject").value, due: $("taskDue").value, note: $("taskNote").value.trim(), done: false });
    if (!write(KEYS.tasks, list)) return showMessage($("taskMsg"), "Nie udało się zapisać danych.");
    e.target.reset();
    showMessage($("taskMsg"), "Dodano zadanie");
  });

  $("examForm").addEventListener("submit", e => {
    e.preventDefault();
    const title = $("examTitle").value.trim();
    if (!title) return;
    if (daysUntil($("examDate").value) < 0) return showMessage($("examMsg"), "Data sprawdzianu nie może być z przeszłości.");
    const exam = { id: uid("exam"), title: title, subject: $("examSubject").value, date: $("examDate").value, difficulty: Number($("examDifficulty").value), scope: $("examScope").value.trim(), done: false };
    const list = read(KEYS.exams); list.push(exam);
    if (!write(KEYS.exams, list)) return showMessage($("examMsg"), "Nie udało się zapisać danych.");
    e.target.reset();
    $("examDifficulty").value = "2";
    showMessage($("examMsg"), "Dodano sprawdzian");
    $("planBox").innerHTML = "<h3>" + escapeHtml(exam.subject) + " — " + escapeHtml(exam.title) + "</h3><p class=\"muted\">" + formatDate(exam.date) + ", " + daysLabel(daysUntil(exam.date)) + ", trudność: " + DIFFICULTY[exam.difficulty].toLowerCase() + "</p>" + studyPlanHTML(exam);
    $("planCard").hidden = false;
    $("planCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();
