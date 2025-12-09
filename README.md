# Fcbarca.com Twitter Fix

Skrypt poprawiający osadzanie linków z X.com (Twitter).

## Changelog

abc:

$$
\sum\limits_{n \in ℤ}{f(n)} = \sum\limits_{k \in ℤ}\int\limits_{-∞}^{+∞}{f(y) · e^{-2πiky} dy}
$$

adasda
* równanie zdefinowane jako: $ϑ(x) = \sum\limits_{n \in ℤ}{e^{-πn²x}}$
* dowiedzioną przez powyższy lemat zależność: $\sum\limits_{n \in ℤ}{f(n)} = \sum\limits_{k \in ℤ}{\int\limits_{-∞}^{+∞}{f(t) · e^{-2πikt} dt}}$


### 0.3.2
- Poprawka do osadzania w rzadkim scenariuszu, poprzednie podejście zawierało błąd.

### 0.3.1
- Poprawienie nadmiarowo wyświetlającej się ikony, mimo że Tweet nie został poprawiony (optymalizacja CSS przy okazji)
- Obsłużenie rzadkiego scenariusza, gdzie tylko jeden z Tweetów się nie załadował (ten drugi).

### 0.3.0
- Dodanie przycisku informującego o tym, że dany post został poprawiony oraz możliwość wyświetlenia wpisu sprzed poprawki

### 0.2.2
- Poprawienie regresji w związku z ograniczeniem opcji observer-a (przestało parsować "Pokaż X odpowiedzi")
- Poprawka w budowania daty dla zaślepki, gdy nie można wczytać Tweeta
- Drobny refactoring kodu, który nie zmienia nic funkcjonalnie (optymalizacja)

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
