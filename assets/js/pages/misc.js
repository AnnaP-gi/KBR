/* Widoki podstawowe spoza głównego zakresu: magazyn, wydarzenia, kluby, strony informacyjne. */
(function () {
  const ui = KBR.ui, C = KBR.content, I = KBR.icon, esc = ui.esc;
  const demoNote = function (txt) { return '<p class="notice notice--demo" style="margin-bottom:32px">' + I('info', 18) + '<span>' + (txt || 'Widok podstawowy – zakres demonstracyjny. Szczegółowy projekt tej podstrony jest poza zakresem prototypu.') + '</span></p>'; };

  KBR.pages.redirect = function (hash) { return { redirect: hash }; };

  KBR.pages.notFound = function () {
    return { title: 'Nie znaleziono strony – KBR', html: '<div class="container"><div class="result"><div class="result__icon result__icon--cancel">' + I('search', 36) + '</div><h1>Nie znaleźliśmy tej strony</h1><p>Adres mógł się zmienić albo materiał nie jest już dostępny.</p><div class="btn-row"><a class="btn btn--primary" href="#/">Strona główna</a><a class="btn btn--outline" href="#/artykuly">Artykuły</a></div></div></div>' };
  };

  KBR.pages.magazine = function () {
    const issue = C.currentIssue();
    const toc = issue.toc.map(C.get);
    const more = issue.tocMore || [];
    const noImg = '<span class="img-ph" aria-hidden="true"></span>';
    const archived = KBR.data.issues.filter(function (i) { return i.archived; });
    const tocReal = toc.map(function (m) { return '<a class="toc-item" href="' + ui.materialUrl(m) + '"><span class="t-label">' + esc(C.topic(m.topic).name) + '</span><span class="t-title-card">' + esc(m.title) + '</span><span class="t-meta">' + ui.metaLine(m) + (m.access === 'premium' ? ' · <span style="color:var(--c-gold);font-weight:700">Premium</span>' : '') + '</span></a>'; }).join('');
    const tocMore = more.map(function (x) { return '<div class="toc-item"><span class="t-label">' + esc(x.section) + '</span><span class="t-title-card">' + esc(x.title) + '</span><span class="t-meta">' + esc(x.author) + '</span></div>'; }).join('');
    const arch = archived.map(function (i) {
      return '<article class="arch-item" data-arch="' + esc((i.label + ' ' + i.title + ' ' + i.description + ' ' + i.articles.join(' ')).toLowerCase()) + '">' + noImg +
        '<div><h3 class="arch-item__nr">' + esc(i.label) + '</h3><p class="arch-item__title">' + esc(i.title) + '</p><p class="arch-item__desc">' + esc(i.description) + '</p>' +
        '<p class="arch-item__feat">W numerze</p><ul id="arch-' + i.id + '">' + i.articles.map(function (t, n) { return '<li data-arch-art="' + esc(t.toLowerCase()) + '"' + (n > 2 ? ' data-more hidden' : '') + '>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        (i.articles.length > 3 ? '<button type="button" class="toc-toggle arch-toggle" data-arch-toggle aria-expanded="false" aria-controls="arch-' + i.id + '" data-count="' + i.articles.length + '"><span>Pokaż wszystkie artykuły (' + i.articles.length + ')</span>' + I('chevDown', 16, 'stroke-width="2"') + '</button>' : '') + '</div></article>';
    }).join('');
    const html = '<div class="container"><header class="page-head">' + ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Magazyn' }]) + '<h1>Magazyn KBR</h1><p>Aktualny numer kwartalnika i archiwum wydań.</p></header>' +
      '<div class="issue"><div class="issue__cover"><img src="' + ui.img(issue.cover) + '" alt="Okładka ' + esc(issue.label) + ': ' + esc(issue.title) + '">' +
        '<div class="issue__actions"><button type="button" class="btn btn--primary btn--block" data-action="mag-open">Otwórz wersję elektroniczną' + I('chevRight', 16, 'stroke-width="2"') + '</button>' +
        '<button type="button" class="btn btn--outline btn--block" data-action="mag-download">Pobierz PDF' + I('chevRight', 16, 'stroke-width="2"') + '</button></div></div>' +
      '<div><span class="t-label">Aktualny numer</span><h2 class="magazine__nr" style="margin-top:8px">' + esc(issue.label.toUpperCase()) + '</h2><p class="t-lead" style="margin-top:16px">' + esc(issue.title) + '</p><p style="margin-top:8px">' + esc(issue.description) + '</p>' +
      '<h3 class="t-section" style="margin-top:32px;padding-bottom:10px;border-bottom:1px solid var(--c-border-blue)">Spis treści</h3><nav aria-label="Spis treści">' + tocReal +
        (more.length ? '<div id="toc-more" hidden>' + tocMore + '</div><button type="button" class="toc-toggle" data-action="toc-toggle" aria-expanded="false" aria-controls="toc-more"><span>Pokaż pełny spis treści (' + (toc.length + more.length) + ')</span>' + I('chevDown', 16, 'stroke-width="2"') + '</button>' : '') +
      '</nav></div></div></div>' +
      '<section class="mag-archive" aria-labelledby="h-archive"><div class="container">' +
        '<div class="mag-archive__head"><h2 id="h-archive">Archiwum wydań</h2><label class="mag-search"><span class="visually-hidden">Szukaj w archiwum</span>' + I('search', 20) + '<input type="search" class="input" data-arch-search placeholder="Znajdź artykuł w archiwum"></label></div>' +
        '<div class="mag-archive__list">' + arch + '</div><p class="mag-archive__empty" data-arch-empty hidden>Brak wyników w archiwum. Spróbuj innej frazy.</p>' +
      '</div></section>';
    return { title: 'Magazyn ' + issue.label + ' – KBR', html: html, mount: function (root) {
      const tg = root.querySelector('[data-action="toc-toggle"]');
      if (tg) tg.addEventListener('click', function () {
        const box = root.querySelector('#toc-more'), open = box.hidden;
        box.hidden = !open; tg.setAttribute('aria-expanded', String(open));
        tg.querySelector('span').textContent = open ? 'Zwiń spis treści' : 'Pokaż pełny spis treści (' + (toc.length + more.length) + ')';
      });
      root.querySelectorAll('[data-action="mag-open"],[data-action="mag-download"]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!KBR.subscription.has('magazine')) { KBR.app.navigate('#/subskrypcja'); setTimeout(function () { ui.toast('Wydanie elektroniczne magazynu jest dostępne w planach „Cyfrowy + Magazyn” i „Pełny dostęp”.'); }, 60); return; }
          ui.toast(b.dataset.action === 'mag-open' ? 'Otwieranie czytnika wydania (symulacja prototypu).' : 'Pobieranie PDF (symulacja prototypu).');
        });
      });
      function setArch(btn, open) {
        btn.setAttribute('aria-expanded', String(open));
        btn.closest('.arch-item').querySelectorAll('[data-more]').forEach(function (li) { li.hidden = !open; });
        btn.querySelector('span').textContent = open ? 'Zwiń listę artykułów' : 'Pokaż wszystkie artykuły (' + btn.dataset.count + ')';
      }
      root.querySelectorAll('[data-arch-toggle]').forEach(function (b) { b.addEventListener('click', function () { setArch(b, b.getAttribute('aria-expanded') !== 'true'); }); });
      const q = root.querySelector('[data-arch-search]');
      q.addEventListener('input', function () {
        const v = q.value.trim().toLowerCase(); let n = 0;
        root.querySelectorAll('.arch-item').forEach(function (it) {
          const hit = !v || it.dataset.arch.indexOf(v) !== -1; it.hidden = !hit; if (hit) n++;
          let deep = false;
          it.querySelectorAll('[data-arch-art]').forEach(function (li) { const h = !!v && li.dataset.archArt.indexOf(v) !== -1; li.classList.toggle('is-hit', h); if (h && li.hasAttribute('data-more')) deep = true; });
          const tb = it.querySelector('[data-arch-toggle]'); if (tb && deep) setArch(tb, true);
        });
        root.querySelector('[data-arch-empty]').hidden = n > 0;
      });
    } };
  };

  KBR.pages.events = function () {
    return { title: 'Wydarzenia – KBR', html: '<div class="container"><header class="page-head">' + ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Wydarzenia' }]) + '<h1>Wydarzenia</h1><p>Wydarzenia, webinary, kluby i programy Executive Education Akademii Leona Koźmińskiego. Zapisy prowadzą do serwisów uczelni.</p>' +
      '</header>' +
      '<div class="grid-4" style="padding-bottom:96px">' + KBR.data.events.map(function (e) {
        return '<article class="card event-card"><a class="card__media" href="#/wydarzenie/' + e.id + '" tabindex="-1" aria-hidden="true"><img src="' + ui.img(e.image) + '" alt="" loading="lazy"></a><span class="t-label card__cat">' + esc(e.category) + '</span>' +
          '<h2 class="card__title"><a class="t-title-card t-title-card--loose hover-title" href="#/wydarzenie/' + e.id + '">' + esc(e.title) + '</a></h2>' +
          '<div class="card__eventmeta"><div>' + I('calendar', 24) + '<span>' + esc(e.date) + '</span></div><div>' + I('pin', 24) + '<span>' + esc(e.place) + '</span></div></div>' +
          '<a class="btn btn--tint" href="#/wydarzenie/' + e.id + '" aria-label="Zapisz się: ' + esc(e.title) + '">Zapisz się' + I('chevRight', 16, 'stroke-width="2"') + '</a></article>';
      }).join('') + '</div></div>' };
  };

  KBR.pages.event = function (route) {
    const e = C.event(route.params.id);
    if (!e) return KBR.pages.notFound();
    return { title: e.title + ' – KBR', html: '<div class="container"><header class="page-head">' + ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Wydarzenia', href: '#/wydarzenia' }, { label: e.title }]) +
      '<span class="t-label">' + esc(e.category) + '</span><h1 style="margin-top:12px;max-width:960px">' + esc(e.title) + '</h1></header>' +
      '<div class="event-page"><div><img src="' + ui.img(e.image) + '" alt="' + esc(e.imageAlt) + '"><div class="prose" style="margin-top:32px"><p>Opis wydarzenia zostanie uzupełniony przez organizatora. Na tym etapie strona pokazuje najważniejsze informacje i przejście do zapisów w serwisie uczelni.</p></div></div>' +
      '<aside class="auth-side"><h2>Informacje</h2><div class="card__eventmeta" style="margin-top:20px"><div>' + I('calendar', 24) + '<span>' + esc(e.date) + '</span></div><div>' + I('pin', 24) + '<span>' + esc(e.place) + '</span></div></div>' +
      '<a class="btn btn--primary btn--block" style="margin-top:28px;height:48px" href="https://www.kozminski.edu.pl/pl" target="_blank" rel="noopener">Przejdź do zapisów' + I('external', 16) + '<span class="visually-hidden"> (serwis uczelni, nowa karta)</span></a>' +
      '<p style="font-size:13px;line-height:19px;margin-top:12px;color:var(--c-muted)">Zapis odbywa się w zewnętrznym serwisie uczelni. Docelowy adres zapisów dla tego wydarzenia – do uzupełnienia.</p></aside></div></div>' };
  };

  function simplePage(title, crumb, intro, body) {
    return { title: title + ' – KBR', html: '<div class="container"><header class="page-head">' + ui.crumbs([{ label: 'Strona główna', href: '#/' }].concat(crumb)) + '<h1>' + esc(title) + '</h1>' + (intro ? '<p>' + intro + '</p>' : '') + '</header><div class="info">' + demoNote() + '<div class="prose">' + body + '</div></div></div>' };
  }

  KBR.pages.clubs = function () {
    return simplePage('Kluby', [{ label: 'Wydarzenia', href: '#/wydarzenia' }, { label: 'Kluby' }], 'Społeczności praktyków, liderów i absolwentów.',
      '<p>Lista klubów i ich proste strony zostaną przygotowane na podstawie oferty Kozminski Business Hub. Każdy klub będzie miał opis, najbliższe spotkania i przejście do zapisu w serwisie uczelni.</p><p><a href="https://www.kozminski.edu.pl/pl" target="_blank" rel="noopener">Przejdź do serwisu uczelni</a> (link zewnętrzny).</p>');
  };
  KBR.pages.executive = function () {
    return simplePage('Strefa Kozminski Executive Education', [{ label: 'Wydarzenia', href: '#/wydarzenia' }, { label: 'Executive Education' }], 'Programy MBA, studia podyplomowe i szkolenia dla menedżerów.',
      '<p>Lista programów i szkoleń oraz proste strony programów zostaną przygotowane na podstawie oferty uczelni. Rekrutacja prowadzi do zewnętrznych serwisów Akademii Leona Koźmińskiego.</p><p><a href="https://www.kozminski.edu.pl/pl" target="_blank" rel="noopener">Zobacz ofertę w serwisie uczelni</a> (link zewnętrzny).</p>');
  };

  const INFO = {
    'o-kbr': ['O KBR – misja i wizja', 'Kozminski Business Review to polska platforma wiedzy biznesowej dla menedżerów, liderek i liderów, wydawana przez Akademię Leona Koźmińskiego.', '<p>Treść misji i wizji serwisu zostanie przygotowana przez redakcję.</p>'],
    'redakcja': ['Redakcja i rada programowa', 'Jedna wspólna strona zespołu redakcyjnego i rady programowej.', '<p>Skład redakcji i rady programowej – do uzupełnienia przez redakcję.</p>'],
    'dla-autorow': ['Dla autorów', 'Zasady publikowania i kontakt dla autorów.', '<p>Zasady zgłaszania tekstów zostaną opublikowane przez redakcję. Panel samodzielnego przesyłania tekstów nie jest przewidziany w tym etapie.</p>'],
    'reklama': ['Reklama i partnerstwa', 'Współpraca reklamowa i partnerstwa merytoryczne.', '<p>Media pack i dane kontaktowe działu sprzedaży – do uzupełnienia.</p>'],
    'kontakt': ['Kontakt', 'Kontakt z redakcją KBR.', '<p>Adres redakcji, e-mail i telefon – do uzupełnienia.</p>'],
    'kanaly': ['Nasze kanały', 'Kanały społecznościowe KBR i Akademii Leona Koźmińskiego.', '<p>Adresy profili w mediach społecznościowych – do uzupełnienia.</p>'],
    'nota-prawna': ['Nota prawna', '', '<p>Treść prawna wymaga przygotowania i zatwierdzenia przez uczelnię. Prototyp nie zawiera treści prawnych.</p>'],
    'polityka-prywatnosci': ['Polityka prywatności', '', '<p>Treść polityki prywatności wymaga przygotowania i zatwierdzenia. Prototyp nie zawiera treści prawnych.</p>'],
    'regulamin-serwisu': ['Regulamin serwisu', '', '<p>Treść regulaminu wymaga przygotowania i zatwierdzenia. Prototyp nie zawiera treści prawnych.</p>'],
    'regulamin-subskrypcji': ['Regulamin subskrypcji', '', '<p>Treść regulaminu subskrypcji wymaga przygotowania i zatwierdzenia. Prototyp nie zawiera treści prawnych.</p>'],
    'informacje-wydawnicze': ['Informacje wydawnicze', '', '<p>Wydawca: Akademia Leona Koźmińskiego. Numer ISSN i pozostałe dane wydawnicze – do uzupełnienia.</p>']
  };
  KBR.pages.info = function (route) {
    const p = INFO[route.params.slug];
    if (!p) return KBR.pages.notFound();
    return simplePage(p[0], [{ label: p[0] }], p[1], p[2]);
  };

  /* Ustawienia cookies – mechanizm (okno), nie osobna strona */
  KBR.ui.cookies = function () {
    const prefs = KBR.storage.get('cookies', { analytics: false, marketing: false });
    const d = KBR.ui.modal('<h2 id="modal-title">Ustawienia cookies</h2><p>Wybierz, na jakie kategorie plików cookies się zgadzasz. <span class="demo-tag">Kategorie i opisy do zatwierdzenia</span></p>' +
      '<form id="cookie-form" style="margin-top:20px"><label class="check" for="ck-nec"><input type="checkbox" id="ck-nec" checked disabled><span><strong>Niezbędne</strong> – zawsze aktywne</span></label>' +
      '<label class="check" for="ck-an"><input type="checkbox" id="ck-an"' + (prefs.analytics ? ' checked' : '') + '><span><strong>Analityczne</strong></span></label>' +
      '<label class="check" for="ck-mk"><input type="checkbox" id="ck-mk"' + (prefs.marketing ? ' checked' : '') + '><span><strong>Marketingowe</strong></span></label>' +
      '<div class="btn-row"><button class="btn btn--primary" type="submit">Zapisz ustawienia</button><button class="btn btn--ghost" type="button" data-close>Anuluj</button></div></form>', { focus: '#ck-an' });
    d.querySelector('#cookie-form').addEventListener('submit', function (e) {
      e.preventDefault();
      KBR.storage.set('cookies', { analytics: d.querySelector('#ck-an').checked, marketing: d.querySelector('#ck-mk').checked });
      d.close(); KBR.ui.toast('Zapisano ustawienia cookies.');
    });
  };
})();
