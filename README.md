# Fcbarca.com Twitter Fix

Skrypt poprawiający osadzanie linków z X.com (Twitter).

## Changelog

### 0.2.1
- Drobne poprawki do wyrażenia regularnego (między innymi poprawienie odczytywania identyfikatora Tweeta)
- Obsłużenie wczytywania Tweetów postaci twitter.com/user/status/id/photo/1 (uwzględnienie /photo/1)
- Obsłużenie przypadku, gdy Tweet nie może być wczytany, bo został np. usunięty

### 0.2.0
- Przepisanie infrastruktury aplikacji z użyciem klas z ES6
- Budowanie osadzonego Tweeta przez oEmbed API, co w porównaniu do poprzedniego podejścia osadza "zajawkę" przed załadowaniem Tweeta (zgodne z oryginalnym zachowaniem strony).
- Obsługa linków w formacie x.com
- Poprawka w sytuacji, gdy link w formie tekstu jest częścią węzła, który zawiera inne ciągi napisowe

### 0.1.1
- Rozpoznawanie linków bez względu na wielkość znaków (case-insensitive)

### 0.1.0
- Pierwsza wersja skryptu
