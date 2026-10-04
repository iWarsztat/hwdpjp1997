"use strict";
(function () {
  const list = document.getElementById("taskList"), sel = document.getElementById("subjFilter");
  let filter = "all";
  sel.innerHTML = '<option value="">Wszystkie przedmioty</option>' + SUBJECTS.map(s => '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + "</option>").join("");
  function render() {
    const tasks = read(KEYS.tasks), done = tasks.filter(t => t.done).length;
    document.getElementById("cAll").textContent = tasks.length;
    document.getElementById("cTodo").textContent = tasks.length - done;
    document.getElementById("cDone").textContent = done;
    const shown = sortTasks(tasks).filter(t => (filter === "all" || (filter === "done") === t.done) && (!sel.value || t.subject === sel.value));
    list.innerHTML = shown.length ? shown.map(t => taskItemHTML(t, true)).join("")
      : "<li>" + (tasks.length ? '<div class="empty"><p>Brak zadań dla wybranego filtra.</p></div>' : emptyState("Nie masz jeszcze żadnych zadań.")) + "</li>";
  }
  document.getElementById("seg").addEventListener("click", e => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    filter = b.dataset.f;
    document.querySelectorAll(".seg-btn").forEach(x => x.classList.toggle("on", x === b));
    render();
  });
  sel.addEventListener("change", render);
  render();
  bindList(list, KEYS.tasks, render);
})();
