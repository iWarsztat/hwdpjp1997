"use strict";
(function () {
  const today = new Date().getDay();
  function plus(hhmm, min) {
    const p = hhmm.split(":").map(Number), t = p[0] * 60 + p[1] + min;
    return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
  }
  document.getElementById("startTable").innerHTML = [1, 2, 3, 4, 5].map(d =>
    '<tr' + (d === today ? ' class="is-today"' : "") + "><td>" + DAY_NAMES[d] + "</td><td>" + SCHOOL_END[d] + "</td><td><strong>" + plus(SCHOOL_END[d], REST_MIN) + "</strong></td></tr>").join("");
})();
