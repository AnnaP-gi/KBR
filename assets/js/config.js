/* ==========================================================================
   Konfiguracja prototypu – JEDNO miejsce na założenia wymagające zatwierdzenia.
   Wszystkie nazwy, ceny, okresy i uprawnienia planów są DANYMI DEMONSTRACYJNYMI,
   a nie zatwierdzoną ofertą KBR.
   ========================================================================== */
window.KBR = window.KBR || {};

KBR.config = {
  storagePrefix: 'kbr.proto.v1.',

  /* Miękki paywall (licznik darmowych materiałów).
     Docelowy limit, zasady naliczania i dostępność dla niezalogowanych są DO USTALENIA.
     Wartość jest założeniem prototypu i można ją zmienić w panelu „Narzędzia demo”.
     0 = licznik wyłączony (materiały „w ramach limitu” są wtedy otwarte). */
  meter: {
    defaultLimit: 3,
    period: 'bez odnawiania (na przeglądarkę)',
    appliesTo: 'gość (niezalogowany); po limicie wymagane bezpłatne konto'
  },

  currency: 'zł',

  /* Trzy warianty subskrypcji magazynu – wyłącznie rozliczenie roczne. Ceny DEMONSTRACYJNE.
     Kolejność features jest wspólna dla wszystkich planów (tabela porównawcza). */
  featureList: [
    'Magazyn w formacie PDF do pobrania',
    'Drukowane wydanie magazynu wysyłane na podany adres',
    'Dostęp online do artykułów opublikowanych w magazynie',
    'Dostęp do wszystkich artykułów w serwisie'
  ],
  plans: [
    {
      id: 'cyfrowy',
      name: 'Cyfrowy',
      description: 'Magazyn w PDF do pobrania i dostęp do artykułów z magazynu.',
      cta: 'Wybieram cyfrowy',
      prices: { year: 199 },
      entitlements: ['magazine-pdf', 'magazine-articles'],
      includes: [true, false, true, false]
    },
    {
      id: 'drukowany',
      name: 'Drukowany',
      description: 'Magazyn drukowany wysyłany na podany adres i dostęp online do artykułów z magazynu.',
      cta: 'Wybieram drukowany',
      prices: { year: 249 },
      entitlements: ['magazine-articles'],
      print: true,
      includes: [false, true, true, false]
    },
    {
      id: 'pelny',
      name: 'Pełny',
      description: 'Magazyn w PDF, wydanie drukowane z dostawą i dostęp do wszystkich artykułów w serwisie.',
      cta: 'Wybieram pełny',
      prices: { year: 349 },
      entitlements: ['premium', 'magazine-pdf', 'magazine-articles'],
      print: true,
      includes: [true, true, true, true]
    }
  ],

  /* Wysyłka drukowanego wydania – DANE DEMONSTRACYJNE. */
  printShipping: {
    short: 'Wysyłka drukowanego wydania raz na kwartał.',
    details: 'Kwartalnik wysyłamy Pocztą Polską. Pierwszy egzemplarz otrzymasz z najbliższej wysyłki po opłaceniu zamówienia. Dostawa na terenie Polski trwa 3–5 dni roboczych.',
    next: '1–7 grudnia 2026 (Nr 04 / 2026)'
  },

  /* Zakup: jednorazowa płatność za 12 miesięcy, bez odnawiania. */
  purchase: {
    months: 12,
    priceNote: 'Jednorazowa opłata za 12 miesięcy. Bez automatycznego odnawiania',
    /* Zgody w formularzu – TREŚCI DO DOSTARCZENIA (teksty zastępcze). */
    consents: [
      { id: 'terms', required: true, text: 'Akceptuję Regulamin subskrypcji KBR.', link: '#/strona/regulamin-subskrypcji' },
      { id: 'privacy', required: true, text: 'Zapoznałam/em się z Polityką prywatności i informacją o przetwarzaniu danych.', link: '#/strona/polityka-prywatnosci' },
      { id: 'digital', required: true, text: 'Wyrażam zgodę na rozpoczęcie dostępu do treści cyfrowych przed upływem terminu na odstąpienie od umowy.' }
    ]
  },

  /* Jotform – formularz zamówienia (szablon Product Order Form).
     formUrl: Jotform → Publikuj → Szybkie udostępnianie → Kopiuj link,
              np. https://form.jotform.com/251234567890123 (lub https://eu.jotform.com/… dla serwerów UE).
     Pusty formUrl = TRYB DEMONSTRACYJNY (formularz nie jest osadzany, płatność nie działa).
     formUrlByPlan: opcjonalnie osobny formularz na pakiet (nadpisuje formUrl).
     fields: UNIKALNE NAZWY pól (pole → Właściwości → Zaawansowane → Unikalna nazwa).
             Wartości poniżej to nazwy do ustawienia w Jotform – muszą być identyczne. */
  jotform: {
    formUrl: '',
    formUrlByPlan: { cyfrowy: '', drukowany: '', pelny: '' },
    fields: {
      plan: 'pakiet',              // ukryte, np. „Cyfrowy — 12 miesięcy”
      planCode: 'kodPakietu',      // ukryte: cyfrowy | drukowany | pelny
      orderId: 'numerZamowienia',  // ukryte: numer zamówienia KBR (powiązanie z kontem)
      userId: 'idKonta',           // ukryte: identyfikator konta KBR
      amount: 'kwota',             // ukryte: kwota w zł (kontrola po stronie serwera)
      name: 'imieNazwisko',        // pole „Imię i nazwisko” (Full Name) → name[first], name[last]
      email: 'email'               // pole „E-mail”
    }
  },

  periods: {
    month: { label: 'Miesięcznie', unit: 'mies.', months: 1 },
    year: { label: 'Rocznie', unit: 'rok', months: 12 }
  },

  /* Konto demonstracyjne używane przez przełącznik stanów w panelu demo. */
  demoAccount: { firstName: 'Anna', lastName: 'Kowalska', email: 'anna.kowalska@example.com' },

  /* Minimalne wymagania hasła (założenie prototypu). */
  password: { minLength: 8 }
};
KBR.config.plans.forEach(function (p) { p.features = KBR.config.featureList.map(function (t, i) { return { text: t, included: p.includes[i] }; }); });
