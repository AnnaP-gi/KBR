# Zakup subskrypcji KBR przez Jotform: konfiguracja

Ten dokument opisuje, jak przygotować formularz w Jotform na bazie szablonu **Product Order Form** i podłączyć go do serwisu. Do czasu podania linku do formularza serwis działa w **trybie demonstracyjnym**: pokazuje podgląd pól i symulację potwierdzenia płatności, ale niczego nie pobiera.

## 1. Przebieg zakupu w serwisie

1. `#/subskrypcja`: użytkownik wybiera pakiet. Niezalogowany przechodzi przez rejestrację lub logowanie, a wybór zostaje zachowany.
2. `#/zamowienie`: serwis tworzy zamówienie przypisane do konta (`numerZamowienia`, `idKonta`). Strona pokazuje osadzony formularz Jotform z wypełnionymi polami i podsumowanie pakietu.
3. Użytkownik uzupełnia dane i płaci przez bramkę w Jotform. Płatność jest jednorazowa.
4. Jotform przekierowuje na `#/zamowienie/status?nr=…`. Strona pokazuje status „Czekamy na potwierdzenie płatności” i sama się odświeża.
5. Serwer KBR otrzymuje potwierdzenie płatności, weryfikuje je i dopiero wtedy aktywuje dostęp na 12 miesięcy. Strona statusu pokazuje wtedy „Subskrypcja jest aktywna” z datą ważności.

Samo wysłanie formularza ani wejście na stronę podziękowania **nie nadaje dostępu**.

## 2. Formularz w Jotform

Utwórz formularz z szablonu Product Order Form (typ **Classic Form**, bo tylko ten pozwala w pełni wstrzyknąć CSS). Usuń z niego wszystko, co dotyczy wielu produktów.

### Pola i ich unikalne nazwy

Unikalną nazwę ustawisz tak: pole → Właściwości → Zaawansowane → Unikalna nazwa. Nazwy muszą być identyczne z `KBR.config.jotform.fields` w `assets/js/config.js`. Jeśli wolisz inne nazwy, zmień je w obu miejscach.

| Pole w Jotform | Typ | Unikalna nazwa | Wymagane | Uwagi |
|---|---|---|---|---|
| Pakiet | Krótki tekst, ukryte | `pakiet` | – | Wypełniane przez serwis, np. „Cyfrowy — 12 miesięcy” |
| Kod pakietu | Krótki tekst, ukryte | `kodPakietu` | – | `cyfrowy` / `drukowany` / `pelny`, używane w warunkach |
| Numer zamówienia | Krótki tekst, ukryte | `numerZamowienia` | – | Wiąże płatność z zamówieniem i kontem KBR |
| ID konta | Krótki tekst, ukryte | `idKonta` | – | Kontrola po stronie serwera |
| Kwota | Krótki tekst, ukryte | `kwota` | – | Kontrola po stronie serwera, nie wpływa na cenę |
| Imię i nazwisko | Imię i nazwisko (Full Name) | `imieNazwisko` | tak | Wypełniane: `imieNazwisko[first]`, `imieNazwisko[last]` |
| E-mail | E-mail | `email` | tak | Wypełniany adresem konta. Ustaw „Tylko do odczytu” |
| Nagłówek „Adres dostawy magazynu” | Nagłówek | – | – | Widoczny tylko dla Drukowany i Pełny |
| Adres dostawy | Adres | `adresDostawy` | tak, warunkowo | Kraj: tylko Polska |
| Telefon dla kuriera | Telefon | `telefon` | nie | Widoczny tylko dla Drukowany i Pełny |
| Faktura na firmę | Pole wyboru (1 opcja) | `faktura` | nie | „Chcę otrzymać fakturę na firmę” |
| Nazwa firmy | Krótki tekst | `firma` | tak, warunkowo | Widoczne po zaznaczeniu `faktura` |
| NIP | Krótki tekst | `nip` | tak, warunkowo | Walidacja: 10 cyfr |
| Adres firmy | Adres | `adresFirmy` | tak, warunkowo | Widoczne po zaznaczeniu `faktura` |
| Pakiet i płatność | Pole płatności | – | tak | Patrz punkt 3 |
| Zgody | Pola wyboru | `zgodaRegulamin`, `zgodaPrywatnosc`, `zgodaTresciCyfrowe` | tak | Treści do dostarczenia, w serwisie: `config.purchase.consents` |

### Warunki (Ustawienia → Warunki → Pokaż/ukryj pole)

- Jeśli `kodPakietu` **jest równe** `drukowany` **lub** `pelny` → pokaż nagłówek „Adres dostawy magazynu”, `adresDostawy` i `telefon` oraz ustaw `adresDostawy` jako wymagane (warunek „Wymagaj pola”).
- Jeśli `faktura` **jest zaznaczone** → pokaż i wymagaj `firma`, `nip`, `adresFirmy`.

## 3. Płatność: jeden pakiet, płatność jednorazowa

1. Dodaj pole płatności wybranej bramki (np. Stripe, PayPal, PayU – sprawdź, które bramki i metody, np. BLIK lub Przelewy24, są dostępne w Twoim planie i kraju).
2. Typ płatności: **Sprzedaż produktów** (Sell Products). **Nie** wybieraj subskrypcji ani płatności cyklicznych.
3. Produkty: dodaj trzy produkty z cenami z `config.js` (199 zł, 249 zł, 349 zł). Ceny są demonstracyjne, do zatwierdzenia.
   - Cyfrowy — 12 miesięcy: magazyn w PDF do pobrania i dostęp do artykułów z magazynu.
   - Drukowany — 12 miesięcy: magazyn drukowany wysyłany na podany adres i dostęp online do artykułów z magazynu.
   - Pełny — 12 miesięcy: magazyn w PDF, wydanie drukowane z dostawą i dostęp do wszystkich artykułów w serwisie.
4. W każdym produkcie usuń opcję **Ilość** (Quantity) i inne opcje. Włącz wybór **jednego** produktu (Single product selection).
5. Opis produktu lub pole tekstowe pod sumą: „Jednorazowa opłata za 12 miesięcy. Bez automatycznego odnawiania”.
6. Zaznaczenie właściwego produktu:
   - **Wariant A (jeden formularz):** sprawdź w swoim planie, czy produkt da się zaznaczyć warunkiem lub parametrem w adresie na podstawie `kodPakietu`, a pozostałe produkty ukryć. Jeśli tak, serwis używa `jotform.formUrl`.
   - **Wariant B (zalecany, jeśli A nie działa):** sklonuj formularz trzy razy, po jednym na pakiet, z jednym produktem w każdym. W formularzu Cyfrowy usuń pola adresu dostawy. Wpisz trzy linki w `jotform.formUrlByPlan`. Pole `pakiet` nadal jest przekazywane.

## 4. Strona podziękowania

Ustawienia → Strona podziękowania → **Przekieruj na zewnętrzny link**:

```
https://<domena-kbr>/#/zamowienie/status?nr={numerZamowienia}
```

`{numerZamowienia}` to znacznik pola. Jotform wstawi w to miejsce wartość z formularza. Jeśli przekierowanie otworzy się wewnątrz ramki, serwis sam przeniesie je do głównego okna.

## 5. Potwierdzenie płatności po stronie serwera (wymagane)

Dostęp może nadać **tylko serwer**. Zalecany przebieg:

1. Jotform → Ustawienia → Integracje → **Webhooks**: adres `https://<api-kbr>/webhooks/jotform`.
2. Serwer po otrzymaniu zgłoszenia:
   - pobiera zgłoszenie z API Jotform (`GET /submission/{submissionID}`) i odczytuje `numerZamowienia`, `idKonta`, kwotę i status płatności; nie ufa samej treści webhooka,
   - jeśli to możliwe, dodatkowo potwierdza transakcję u operatora płatności (np. webhook Stripe o udanej płatności),
   - porównuje kwotę i pakiet z zamówieniem zapisanym w KBR; przy niezgodności ustawia status `review`,
   - działa idempotentnie, czyli ponowny webhook dla opłaconego zamówienia nic nie zmienia,
   - ustawia zamówienie na `paid` i zapisuje uprawnienia konta: pakiet, `startedAt`, `validUntil` = data płatności + 12 miesięcy, `autoRenew: false`.
3. Statusy zamówienia w serwisie: `created` → `awaiting_payment` → `paid` | `failed` | `canceled` | `review`.

W prototypie ten krok symuluje `KBR.server.paymentWebhook()` w `assets/js/services/account.js`. Na stronie statusu, w trybie demo, uruchamia się go przyciskami „Symulacja serwera”.

## 6. Wygląd formularza

- Wnętrza formularza w iframe **nie da się** stylować CSS-em strony KBR. Style ustawia się po stronie Jotform.
- Projektant formularza → Style → **Wstrzyknij własny CSS**: wklej `docs/jotform/kbr-jotform.css`.
- W Projektancie ustaw dodatkowo: szerokość formularza 720 px, wyrównanie etykiet „Góra”, białe tło, czcionkę Open Sans.
- Ukrycie brandingu Jotform zależy od planu (Ustawienia → Branding).
- Otoczenie formularza (kroki, podsumowanie, ramka, stany) jest w kodzie serwisu: `assets/js/pages/purchase.js` i `assets/css/pages.css` (sekcja „Zakup – Jotform”).

## 7. Skąd skopiować link lub kod osadzenia

1. Otwórz formularz w Jotform → zakładka **Publikuj**.
2. **Szybkie udostępnianie → Kopiuj link**, np. `https://form.jotform.com/251234567890123`. Dla kont na serwerach UE adres może zaczynać się od `https://eu.jotform.com/`.
3. Wklej link w `assets/js/config.js`:
   ```js
   jotform: {
     formUrl: 'https://form.jotform.com/251234567890123',
     formUrlByPlan: { cyfrowy: '', drukowany: '', pelny: '' }, // wariant B
     ...
   }
   ```
4. Serwis sam buduje iframe z wypełnionymi polami i dopasowuje wysokość ramki do komunikatów Jotform (`setHeight`). Kod osadzenia z zakładki **Publikuj → Osadź** nie jest potrzebny. Przyda się tylko wtedy, gdy wolisz skrypt Jotform zamiast iframe.

## 8. Do potwierdzenia

- Bramka płatności i dostępne metody (BLIK, przelew, karta).
- Ostateczne ceny, VAT i dane do faktur.
- Treści zgód i regulaminu, w serwisie oznaczone „Treść do dostarczenia”.
- Wariant A lub B zaznaczania produktu.
