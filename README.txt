PLANER NAUKI
============

1. Rozpakuj folder (planer-nauki.zip).
2. Uruchom lokalny serwer w tym folderze. Można użyć:

   python -m http.server 8000

   (na niektórych systemach: python3 -m http.server 8000)

3. Następnie otwórz w przeglądarce:

   http://localhost:8000

Dlaczego serwer?
Dane (zadania i sprawdziany) są zapisywane w localStorage. Działa on
najbardziej niezawodnie, gdy wszystkie strony są otwierane z tego samego
originu (adres + port), np. http://localhost:8000. Otwarcie plików
bezpośrednio z dysku (file://) może powodować, że przeglądarka traktuje
każdy plik osobno i dane nie są współdzielone między stronami.
Zawsze używaj tego samego adresu i portu, żeby widzieć swoje dane.

Powiadomienia: przycisk "Włącz przypomnienia" na stronie "Dzisiaj" prosi
o zgodę przeglądarki. Przypomnienie pojawia się raz dziennie po otwarciu
strony (podsumowanie pilnych zadań lub najbliższego sprawdzianu).

Struktura:
  index.html, tydzien.html, dodaj.html, zadania.html,
  sprawdziany.html, rutyna.html
  css/style.css
  js/app.js (wspólne funkcje), today.js, week.js, add.js,
  tasks.js, exams.js, routine.js
