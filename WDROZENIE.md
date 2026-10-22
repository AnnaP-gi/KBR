# KBR – wdrożenie (Git + Vercel)

Statyczna strona bez kroku budowania. Plik startowy: `index.html`.

```
index.html        strona startowa
vercel.json       ustawienia Vercel (cache)
assets/css        style
assets/js         logika (config.js – ceny, Jotform)
assets/img, fonts obrazy i fonty
docs/jotform      instrukcja i CSS dla Jotform
```

Podgląd lokalny: w folderze uruchom `npx serve .` i otwórz http://localhost:3000
(otwarcie index.html dwuklikiem też zadziała w większości przeglądarek).

## A. Masz już repozytorium ze starą wersją – zachowaj ją

1. Zapisz obecny stan jako tag i osobną gałąź:
   ```
   cd sciezka/do/repo
   git checkout main
   git pull
   git tag wersja-poprzednia-2026-10
   git branch archiwum/wersja-poprzednia
   git push origin wersja-poprzednia-2026-10 archiwum/wersja-poprzednia
   ```
2. Nową wersję wrzuć na osobną gałąź:
   ```
   git checkout -b nowa-wersja
   ```
   Usuń stare pliki strony (bez folderu `.git`) i skopiuj zawartość folderu `kbr-vercel`.
   ```
   git add -A
   git commit -m "Nowa wersja KBR: zakup Jotform, autorzy, magazyn"
   git push -u origin nowa-wersja
   ```
3. Vercel automatycznie zbuduje **podgląd** gałęzi `nowa-wersja` (osobny adres, produkcja bez zmian).
4. Gdy podgląd jest OK – na GitHubie: Pull request `nowa-wersja` → `main` → Merge. Vercel wdroży produkcję.

Powrót do starej wersji w każdej chwili:
- Vercel → Deployments → stare wdrożenie → **Promote to Production** (najszybciej), albo
- `git checkout archiwum/wersja-poprzednia` / tag `wersja-poprzednia-2026-10`.

## B. Nowe repozytorium

```
cd kbr-vercel
git init
git add -A
git commit -m "KBR – pierwsza wersja"
git branch -M main
git remote add origin https://github.com/<konto>/kbr.git
git push -u origin main
```

## Vercel

1. vercel.com → Add New → Project → Import repozytorium.
2. Framework Preset: **Other**. Build Command: puste. Output Directory: puste (katalog główny).
3. Deploy. Każdy push na `main` = produkcja, inne gałęzie = podglądy.

## Uwaga

To prototyp: konta, zamówienia i płatności są symulowane w przeglądarce (localStorage).
Przed uruchomieniem sprzedaży potrzebny jest backend (patrz `docs/jotform/README.md`, pkt 5).
