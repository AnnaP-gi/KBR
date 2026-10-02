# Kozminski Business Review – prototyp UX/UI

Działający, responsywny prototyp serwisu KBR przygotowany na podstawie projektu strony głównej (`KBR_Home.pdf`) i specyfikacji funkcjonalnej. Służy do oceny UX/UI – **konta, płatności i kontrola dostępu są symulowane w przeglądarce**.

## Publikacja (GitHub + Vercel)

1. Utwórz nowe repozytorium na GitHubie i wgraj **zawartość tego folderu** (index.html, assets/, vercel.json, README.md, .gitignore) do jego katalogu głównego:
   ```bash
   git init && git add . && git commit -m "KBR prototyp"
   git branch -M main
   git remote add origin https://github.com/<konto>/kbr-prototyp.git
   git push -u origin main
   ```
2. W Vercel: **Add New → Project → Import** repozytorium.
3. Framework Preset: **Other**. Build Command i Output Directory zostaw puste (strona statyczna, bez budowania).
4. **Deploy**. Każdy kolejny push do `main` publikuje nową wersję.

## Uruchomienie lokalne

Prototyp nie wymaga instalacji ani budowania (czysty HTML, CSS i JavaScript, fonty i obrazy są w repozytorium).

- **Najprościej:** otwórz `index.html` w przeglądarce (Chrome, Edge, Firefox, Safari).
- **Zalecane (serwer lokalny):**
  ```bash
  cd kbr-prototyp
  python3 -m http.server 8080      # lub: npx serve .
  ```
  i otwórz `http://localhost:8080/`.

Adresy podstron działają w formacie `#/…`, np. `#/artykul/ai-zdolnosc-organizacyjna`.

## Scenariusz do przejścia

1. Strona główna → sekcja „Magazyn” lub „Dla subskrybentów” → artykuł **Premium** (np. „AI jako zdolność organizacyjna, nie projekt IT”).
2. Widoczny jest lead, fragment tekstu i **paywall** (stan strony artykułu).
3. „Zapisz w bibliotece” → okno z informacją, że zapis wymaga bezpłatnego konta → „Załóż bezpłatne konto”.
4. Rejestracja (imię, e-mail, hasło z podglądem, zgoda wymagana + opcjonalne niezaznaczone).
5. Powrót do tego samego artykułu, **automatyczny zapis** i potwierdzenie z linkiem do biblioteki.
6. „Moja biblioteka” – zakładki „Zapisane” i „Ostatnio czytane”.
7. Paywall → „Wybierz subskrypcję” → plan → dane zamówienia (opcjonalnie faktura na firmę) → podsumowanie → **symulowana płatność** (sukces / odrzucenie / anulowanie).
8. Po sukcesie: „Wróć do artykułu” → pełna treść; „Moja subskrypcja” pokazuje aktywny plan i historię płatności.

## Narzędzia demo

Przycisk **„Narzędzia demo”** (prawy dolny róg, poza nawigacją serwisu) pozwala:

- przełączyć stan: **gość / konto bez subskrypcji / aktywny subskrybent** (konto testowe `anna.kowalska@example.com`),
- zmienić limit bezpłatnych materiałów (założenie prototypu, `0` = wyłączony) i wyzerować licznik,
- **zresetować wszystkie dane demo**.

## Struktura

```
index.html
assets/
  css/        tokens.css (kolory, typografia, siatka) · base.css · layout.css · components.css · pages.css · fonts.css
  fonts/      Open Sans i Cormorant Garamond (woff2, latin + latin-ext, licencja SIL OFL)
  img/        logo i zdjęcia pozyskane z PDF
  js/
    config.js            ← JEDNA konfiguracja założeń: plany, ceny, okresy, limit
    data/                ← dane demonstracyjne: tematy, autorzy, materiały, wydania, wydarzenia
    services/            ← warstwa danych i symulowane usługi (do zastąpienia API)
      storage.js         trwałość (localStorage/sessionStorage) + magistrala zdarzeń
      content.js         zapytania o treści (odpowiednik API CMS)
      account.js         auth, biblioteka, subskrypcja, licznik, zamówienie, płatności (symulacje)
    ui/                  ← ikony, komponenty (nagłówek, stopka, karty), formularze, toast, modal
    pages/               ← widoki (strona główna, artykuł, listy, konto, zakup, pozostałe)
    demo/                ← panel narzędzi demo
    app.js               ← router (hash) i obsługa zdarzeń
```

Komponenty wywołują wyłącznie funkcje z `KBR.auth`, `KBR.library`, `KBR.subscription`, `KBR.access`, `KBR.checkout`, `KBR.payments` i `KBR.content`. Podłączenie backendu polega na zastąpieniu implementacji tych modułów wywołaniami API (mutacje już zwracają `Promise`).

## Co jest symulowane

| Obszar | Prototyp | Wymagane docelowo (po stronie serwera) |
|---|---|---|
| Konta i logowanie | Konta zapisane w `localStorage` **bez haseł**; logowanie nie weryfikuje hasła | Uwierzytelnianie, przechowywanie haseł (hash), sesje, potwierdzenie konta, reset hasła z tokenem |
| E-maile | Nie są wysyłane (reset hasła, potwierdzenie zamówienia, newsletter) | Usługa wysyłki, szablony, double opt-in |
| Płatności | Symulacja – wynik wybiera tester; **brak pól i danych kart** | Integracja z operatorem, webhooki, faktury, odnawianie |
| Kontrola dostępu | Pełna treść jest w kodzie przeglądarki; paywall to warstwa interfejsu | Serwer zwraca pełną treść tylko uprawnionym użytkownikom |
| Licznik darmowych materiałów | Liczony w przeglądarce, limit konfigurowalny | Naliczanie po stronie serwera, zasady do ustalenia |
| Zapisane / ostatnio czytane / subskrypcja | `localStorage` per konto | Baza danych konta |

W przeglądarce przechowywany jest wyłącznie stan demonstracyjny (konta bez haseł, sesja, biblioteka, subskrypcja, licznik, preferencje). Dane zamówienia (bez danych kart) są trzymane w `sessionStorage` do końca sesji karty.

## Założenia do potwierdzenia

- Nazwy, ceny, okresy i zakres trzech planów (`config.js`) – **dane demonstracyjne**.
- Limit bezpłatnych materiałów (domyślnie 3 / miesiąc), zasady naliczania i dostępność dla niezalogowanych.
- Treści prawne (regulaminy, polityka prywatności, zgody) – oznaczone jako „do zatwierdzenia”.
- Operator płatności, liczba ekranów zakupu, zasady odnawiania i VAT.
- Aktywacja dostępu akademickiego (SSO lub weryfikacja adresu uczelnianego).
- Treści artykułów, biogramy autorów i część tytułów – demonstracyjne.
