/* Konto użytkownika: Moja biblioteka, Moja subskrypcja, Moje dane, Płatności, Preferencje. */
(function () {
  const ui = KBR.ui, C = KBR.content, I = KBR.icon, esc = ui.esc, F = KBR.forms;

  function guard(route) {
    if (KBR.auth.currentUser()) return null;
    KBR.flow.setReturn('#' + route.path + (route.search || ''));
    return KBR.pages.redirect('#/logowanie');
  }

  function shell(active, inner) {
    const u = KBR.auth.currentUser();
    const lib = KBR.library.get();
    const links = [['biblioteka', 'Moja biblioteka', lib.saved.length], ['subskrypcja', 'Moja subskrypcja'], ['dane', 'Moje dane'], ['platnosci', 'Płatności i faktury'], ['preferencje', 'Newslettery i preferencje']];
    return '<div class="container account"><aside class="account-nav" aria-label="Konto">' +
      '<div class="who"><div class="avatar avatar--sm" aria-hidden="true">' + esc((u.firstName || u.email).slice(0, 1).toUpperCase()) + '</div><div><strong>' + esc(u.firstName || 'Czytelnik') + '</strong><span>' + esc(u.email) + '</span></div></div>' +
      '<nav aria-label="Sekcje konta">' + links.map(function (l) { return '<a href="#/konto/' + l[0] + '"' + (l[0] === active ? ' aria-current="page"' : '') + '>' + l[1] + (l[2] ? '<span class="count" style="font-size:12px;color:var(--c-muted)">' + l[2] + '</span>' : '') + '</a>'; }).join('') + '</nav>' +
      '<button type="button" class="btn btn--ghost logout" data-action="logout">' + I('logout', 18) + 'Wyloguj się</button></aside>' +
      '<div class="account-main">' + inner + '</div></div>';
  }

  function accessNote(m) {
    if (m.access !== 'premium') return '';
    return KBR.subscription.has('premium')
      ? '<span class="unlock-note">' + I('unlock', 16) + 'Premium – pełny dostęp w ramach subskrypcji</span>'
      : '<span class="lock-note">' + I('lock', 16) + 'Premium – pełna treść po wykupieniu subskrypcji</span>';
  }

  function libItem(m, when, mode) {
    return '<li class="lib-item" data-lib-item="' + m.id + '">' + ui.media(m, { formatBadge: C.format(m.format).badge || null }) +
      '<div><a class="t-label" href="#/tematy/' + C.topic(m.topic).slug + '">' + esc(C.topic(m.topic).name) + '</a>' +
      '<h2 style="margin:0"><a class="t-title-card hover-title" href="' + ui.materialUrl(m) + '">' + esc(m.title) + '</a></h2>' +
      '<span class="t-meta">' + ui.metaLine(m) + '</span>' +
      (when ? '<p class="when">' + when + '</p>' : '') + accessNote(m) + '</div>' +
      '<div class="lib-item__actions"><a class="btn btn--blue" href="' + ui.materialUrl(m) + '">Otwórz' + I('chevRight', 16, 'stroke-width="2"') + '</a>' +
      (mode === 'saved'
        ? '<button type="button" class="btn btn--ghost" data-action="remove-saved" data-id="' + m.id + '" aria-label="Usuń z zapisanych: ' + esc(m.title) + '">' + I('close', 16) + 'Usuń</button>'
        : mode === 'topic' ? ui.saveButton(m, { compact: true }) : '') +
      '</div></li>';
  }

  KBR.pages.library = function (route) {
    const g = guard(route); if (g) return g;
    const tab = route.query.zakladka === 'ostatnio' ? 'recent' : route.query.zakladka === 'tematy' ? 'topics' : 'saved';
    const lib = KBR.library.get();
    const saved = lib.saved.map(function (s) { return { m: C.get(s.id), at: s.savedAt }; }).filter(function (x) { return x.m; });
    const recent = lib.recent.map(function (s) { return { m: C.get(s.id), at: s.readAt }; }).filter(function (x) { return x.m; });

    const savedPanel = saved.length
      ? '<ul class="lib-list">' + saved.map(function (x) { return libItem(x.m, 'Zapisano ' + ui.dateTime(x.at), 'saved'); }).join('') + '</ul>'
      : '<div class="empty">' + I('bookmark', 40) + '<h2>Nie masz jeszcze zapisanych materiałów</h2><p>Kliknij „Zapisz w bibliotece” przy artykule, studium przypadku lub podcaście, aby wrócić do niego później.</p><a class="btn btn--primary" href="#/artykuly">Przeglądaj artykuły' + I('chevRight', 16, 'stroke-width="2"') + '</a></div>';
    const recentPanel = recent.length
      ? '<ul class="lib-list">' + recent.map(function (x) { return libItem(x.m, 'Czytano ' + ui.dateTime(x.at), 'recent'); }).join('') + '</ul>'
      : '<div class="empty">' + I('clock', 40) + '<h2>Brak ostatnio czytanych materiałów</h2><p>Materiały, które otworzysz po zalogowaniu, pojawią się tutaj automatycznie.</p><a class="btn btn--primary" href="#/artykuly">Przeglądaj artykuły' + I('chevRight', 16, 'stroke-width="2"') + '</a></div>';

    const follows = KBR.follow.list().map(function (f) { return { t: C.topic(f.id), since: f.since }; }).filter(function (x) { return x.t; });
    const topicsPanel = follows.length
      ? '<p class="follow-intro"><a class="t-link" href="#/tematy">Przeglądaj wszystkie tematy' + I('chevRight', 14, 'stroke-width="2.25"') + '</a></p>' + follows.map(function (x) {
          const items = C.list({ topic: x.t.id });
          return '<section class="follow-group" aria-labelledby="fg-' + x.t.id + '"><div class="follow-group__head"><h2 id="fg-' + x.t.id + '"><a href="#/tematy/' + x.t.slug + '">' + esc(x.t.name) + '</a></h2>' +
            '<button type="button" class="save-btn save-btn--compact" data-action="toggle-follow" data-id="' + x.t.id + '" aria-pressed="true">' + I('bookmarkFill', 16) + '<span>Obserwujesz</span></button></div>' +
            '<ul class="lib-list">' + items.slice(0, 2).map(function (m) { return libItem(m, '', 'topic'); }).join('') + '</ul>' +
            (items.length > 2 ? '<a class="t-link follow-group__more" href="#/tematy/' + x.t.slug + '">Zobacz więcej (' + items.length + ')' + I('chevRight', 14, 'stroke-width="2.25"') + '</a>' : '') + '</section>';
        }).join('')
      : '<div class="empty">' + I('bookmark', 40) + '<h2>Nie obserwujesz jeszcze żadnego tematu</h2><p>Kliknij „Obserwuj temat” na stronie wybranego tematu, aby śledzić wszystkie jego materiały w tym miejscu.</p><a class="btn btn--primary" href="#/tematy">Przeglądaj tematy' + I('chevRight', 16, 'stroke-width="2"') + '</a></div>';

    const inner = '<h1>Moja biblioteka</h1><p class="sub">Zapisane materiały i historia czytania. Zapis materiału Premium nie odblokowuje jego treści – pełny dostęp daje subskrypcja.</p>' +
      '<div class="tabs" role="tablist" aria-label="Moja biblioteka">' +
        '<button type="button" role="tab" id="tab-saved" aria-controls="panel-saved" aria-selected="' + (tab === 'saved') + '" tabindex="' + (tab === 'saved' ? 0 : -1) + '" data-tab="zapisane">Zapisane <span class="count">' + saved.length + '</span></button>' +
        '<button type="button" role="tab" id="tab-recent" aria-controls="panel-recent" aria-selected="' + (tab === 'recent') + '" tabindex="' + (tab === 'recent' ? 0 : -1) + '" data-tab="ostatnio">Ostatnio czytane <span class="count">' + recent.length + '</span></button>' +
        '<button type="button" role="tab" id="tab-topics" aria-controls="panel-topics" aria-selected="' + (tab === 'topics') + '" tabindex="' + (tab === 'topics' ? 0 : -1) + '" data-tab="tematy">Obserwowane tematy <span class="count">' + follows.length + '</span></button></div>' +
      '<div role="tabpanel" id="panel-saved" aria-labelledby="tab-saved"' + (tab === 'saved' ? '' : ' hidden') + '>' + savedPanel + '</div>' +
      '<div role="tabpanel" id="panel-recent" aria-labelledby="tab-recent"' + (tab === 'recent' ? '' : ' hidden') + '>' + recentPanel + '</div>' +
      '<div role="tabpanel" id="panel-topics" aria-labelledby="tab-topics"' + (tab === 'topics' ? '' : ' hidden') + '>' + topicsPanel + '</div>';

    return { title: 'Moja biblioteka – KBR', html: shell('biblioteka', inner), mount: function (root) {
      const tabs = root.querySelectorAll('[role="tab"]');
      function select(t, focus) {
        tabs.forEach(function (x) { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; root.querySelector('#' + x.getAttribute('aria-controls')).hidden = !on; });
        if (focus) t.focus();
        history.replaceState(null, '', '#/konto/biblioteka' + (t.dataset.tab !== 'zapisane' ? '?zakladka=' + t.dataset.tab : ''));
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true); }
        });
      });
    } };
  };

  function printPanel() {
    const sh = KBR.subscription.shipments(), addr = KBR.subscription.shippingAddress();
    return '<section class="panel" aria-labelledby="h-print"><h2 id="h-print">Drukowane wydanie magazynu</h2>' +
      '<div class="ship-next">' + I('mail', 22) + '<div><span class="t-label">Najbliższa wysyłka</span><strong>' + (sh.next ? ui.dateLong(sh.next.date) + ' · ' + esc(sh.next.issue) : '–') + '</strong>' +
      '<span class="t-meta" style="font-weight:400">' + (addr ? 'Na adres: ' + esc(addr.name) + ', ' + esc(addr.street) + ', ' + esc(addr.postal) + ' ' + esc(addr.city) : 'Brak adresu wysyłki') + ' · <a class="link" href="#/konto/dane">Zmień adres</a></span></div></div>' +
      '<h3 class="ship-hist__h">Historia wysyłek</h3>' +
      (sh.past.length
        ? '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Data wysyłki</th><th scope="col">Wydanie</th><th scope="col">Status</th></tr></thead><tbody>' +
          sh.past.map(function (x) { return '<tr><td>' + ui.dateLong(x.date) + '</td><td>' + esc(x.issue) + '</td><td><span class="status-pill status-pill--ok">Wysłano</span></td></tr>'; }).join('') + '</tbody></table></div>'
        : '<p style="margin-top:8px">Nie wysłaliśmy jeszcze żadnego egzemplarza. Pierwszy numer otrzymasz z najbliższej wysyłki.</p>') +
      '<p class="hint" style="margin-top:16px">' + esc(KBR.config.printShipping.details) + '</p></section>';
  }

  KBR.pages.mySubscription = function (route) {
    const g = guard(route); if (g) return g;
    const sub = KBR.subscription.get();
    const orders = KBR.subscription.orders();
    let inner = '<h1>Moja subskrypcja</h1>';
    if (sub && sub.status === 'active') {
      const p = KBR.subscription.plan(sub.planId), per = KBR.config.periods[sub.period];
      inner += '<p class="sub">Masz pełny dostęp do materiałów Premium. Twoja biblioteka została zachowana.</p>' +
        '<section class="panel" aria-labelledby="h-sub"><div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:center"><h2 id="h-sub">Aktualny plan</h2><span class="status-pill status-pill--ok">' + I('checkCircle', 16) + 'Aktywna</span></div>' +
        '<p class="t-serif" style="font-size:36px;line-height:40px;margin-top:16px">' + esc(p.name) + ' <span class="demo-tag">Dane demonstracyjne</span></p>' +
        '<dl class="dl"><dt>Źródło dostępu</dt><dd>Zakup indywidualny</dd><dt>Okres rozliczeniowy</dt><dd>' + per.label + ' (' + ui.money(sub.amount) + ' / ' + per.unit + ')</dd>' +
        '<dt>Aktywna od</dt><dd>' + ui.dateLong(sub.startedAt) + '</dd><dt>' + (sub.autoRenew ? 'Następne odnowienie' : 'Dostęp ważny do') + '</dt><dd>' + ui.dateLong(sub.validUntil) + '</dd>' +
        '<dt>Numer zamówienia</dt><dd>' + esc(sub.orderId) + '</dd><dt>Zakres</dt><dd>' + p.features.filter(function (x) { return x.included; }).map(function (x) { return esc(x.text); }).join('<br>') + '</dd></dl>' +
        '<div class="btn-row" style="margin-top:24px"><a class="btn btn--primary" href="#/konto/biblioteka">Przejdź do biblioteki</a><a class="btn btn--outline" href="#/subskrypcja">Porównaj plany</a>' +
        '<button type="button" class="btn btn--ghost" data-action="auto-renew" data-on="' + (sub.autoRenew ? '0' : '1') + '">' + (sub.autoRenew ? 'Wyłącz automatyczne odnawianie' : 'Włącz automatyczne odnawianie') + '</button></div>' +
        '<p class="notice notice--demo" style="margin-top:20px">' + I('info', 18) + '<span>Zmiana planu, anulowanie i zasady odnawiania wymagają ustaleń biznesowych i obsługi serwerowej. Przełącznik odnawiania jest symulacją.</span></p></section>' +
        (p.print ? printPanel() : '');
    } else {
      inner += '<p class="sub">Na tym koncie nie ma aktywnej subskrypcji. Możesz czytać materiały otwarte, zapisywać materiały w bibliotece i korzystać z darmowego limitu.</p>' +
        '<section class="panel panel--tint" aria-labelledby="h-nosub"><div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:center"><h2 id="h-nosub">Status</h2><span class="status-pill status-pill--none">Brak subskrypcji</span></div>' +
        '<p style="margin-top:12px">Subskrypcja odblokowuje wszystkie materiały Premium – również te, które masz już zapisane w bibliotece.</p>' +
        '<div class="btn-row" style="margin-top:20px"><a class="btn btn--primary" href="#/subskrypcja">Wybierz subskrypcję' + I('chevRight', 16, 'stroke-width="2"') + '</a><a class="btn btn--outline" href="#/dostep/firmy">Dostęp dla firm</a><a class="btn btn--ghost" href="#/dostep/akademicki">Dostęp akademicki</a></div></section>';
    }
    inner += ordersTable(orders) +
      '<p class="notice" style="margin-top:24px">' + I('info', 18) + '<span>Dostępne opcje konta mogą zależeć od źródła uprawnień. Widok dla dostępu firmowego i akademickiego (bez faktur wystawianych organizacji) wymaga osobnego zaprojektowania.</span></p>';
    return { title: 'Moja subskrypcja – KBR', html: shell('subskrypcja', inner) };
  };

  function ordersTable(orders) {
    if (!orders.length) return '';
    return '<section class="panel" aria-labelledby="h-orders"><h2 id="h-orders">Historia płatności</h2><div class="table-wrap"><table class="table"><thead><tr><th scope="col">Data</th><th scope="col">Zamówienie</th><th scope="col">Plan</th><th scope="col">Kwota</th><th scope="col">Status</th></tr></thead><tbody>' +
      orders.map(function (o) {
        const p = KBR.subscription.plan(o.planId);
        const st = o.status === 'paid' ? '<span class="status-pill status-pill--ok">Opłacono</span>' : '<span class="status-pill status-pill--warn">Nieudana</span>';
        return '<tr><td>' + ui.dateTime(o.createdAt) + '</td><td>' + esc(o.orderId) + '</td><td>' + esc(p ? p.name : o.planId) + ', ' + KBR.config.periods[o.period].label.toLowerCase() + '</td><td>' + ui.money(o.amount) + '</td><td>' + st + '</td></tr>';
      }).join('') + '</tbody></table></div></section>';
  }

  function shipPanel() {
    const addr = KBR.subscription.shippingAddress();
    const s = KBR.subscription.get(), p = s && s.status === 'active' && KBR.subscription.plan(s.planId);
    if (!addr && !(p && p.print)) return '';
    const v = addr || {};
    return '<form class="panel" id="ship-form" novalidate aria-labelledby="h-shipaddr"><h2 id="h-shipaddr">Adres wysyłki magazynu</h2>' +
      '<p style="margin-top:12px">Na ten adres wysyłamy drukowane wydanie kwartalnika w ramach planu ' + esc(p ? p.name : 'Pełny dostęp') + '.</p>' +
      '<div class="field" style="margin-top:20px"><label for="sa-name">Imię i nazwisko odbiorcy</label><input class="input" id="sa-name" autocomplete="shipping name" value="' + esc(v.name || '') + '"></div>' +
      '<div class="field"><label for="sa-street">Ulica, numer domu i lokalu</label><input class="input" id="sa-street" autocomplete="shipping street-address" value="' + esc(v.street || '') + '"></div>' +
      '<div class="two-col"><div class="field"><label for="sa-postal">Kod pocztowy</label><input class="input" id="sa-postal" autocomplete="shipping postal-code" placeholder="00-000" value="' + esc(v.postal || '') + '"></div>' +
      '<div class="field"><label for="sa-city">Miejscowość</label><input class="input" id="sa-city" autocomplete="shipping address-level2" value="' + esc(v.city || '') + '"></div></div>' +
      '<div class="field"><label for="sa-phone">Telefon dla kuriera <span style="font-weight:400;color:var(--c-muted)">(opcjonalnie)</span></label><input class="input" id="sa-phone" type="tel" autocomplete="tel" value="' + esc(v.phone || '') + '"></div>' +
      '<p class="hint">Zmiana obowiązuje od najbliższej wysyłki.</p>' +
      '<div class="btn-row" style="margin-top:24px"><button class="btn btn--primary" type="submit">Zapisz adres</button><span role="status" class="t-meta" id="sa-status"></span></div></form>';
  }

  KBR.pages.myData = function (route) {
    const g = guard(route); if (g) return g;
    const u = KBR.auth.currentUser();
    const inner = '<h1>Moje dane</h1><p class="sub">Dane osobowe, adres wysyłki, dane do faktur i ustawienia logowania.</p>' +
      '<form class="panel" id="profile-form" novalidate><h2>Dane osobowe</h2><div class="two-col" style="margin-top:20px">' +
      '<div class="field"><label for="pf-first">Imię</label><input class="input" id="pf-first" value="' + esc(u.firstName) + '" autocomplete="given-name"></div>' +
      '<div class="field"><label for="pf-last">Nazwisko <span style="font-weight:400;color:var(--c-muted)">(opcjonalnie)</span></label><input class="input" id="pf-last" value="' + esc(u.lastName || '') + '" autocomplete="family-name"></div></div>' +
      '<div class="field"><label for="pf-email">Adres e-mail (login)</label><input class="input" id="pf-email" value="' + esc(u.email) + '" readonly aria-describedby="pf-email-hint"><p class="hint" id="pf-email-hint">Zmiana adresu e-mail wymaga potwierdzenia – funkcja do zaprojektowania.</p></div>' +
      '<div class="btn-row" style="margin-top:24px"><button class="btn btn--primary" type="submit">Zapisz zmiany</button><span role="status" class="t-meta" id="pf-status"></span></div></form>' +
      shipPanel() +
      '<section class="panel" aria-labelledby="h-login"><h2 id="h-login">Ustawienia logowania</h2><p style="margin-top:12px">Hasło możesz zmienić przez procedurę odzyskania dostępu.</p><div class="btn-row" style="margin-top:16px"><a class="btn btn--outline" href="#/reset-hasla">Zmień hasło</a></div></section>' +
      '<section class="panel" aria-labelledby="h-inv"><h2 id="h-inv">Dane do faktur</h2><p style="margin-top:12px">Dane do faktury podajesz w formularzu zamówienia. Zapisane dane rozliczeniowe – do zaprojektowania.</p></section>';
    return { title: 'Moje dane – KBR', html: shell('dane', inner), mount: function (root) {
      const sf = root.querySelector('#ship-form');
      if (sf) sf.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!F.validate(sf, [{ id: 'sa-name', check: F.v.required('imię i nazwisko odbiorcy') }, { id: 'sa-street', check: F.v.required('ulicę i numer') }, { id: 'sa-postal', check: F.v.postal }, { id: 'sa-city', check: F.v.required('miejscowość') }])) return;
        const val = function (id) { return root.querySelector('#' + id).value.trim(); };
        KBR.subscription.setShippingAddress({ name: val('sa-name'), street: val('sa-street'), postal: val('sa-postal'), city: val('sa-city'), phone: val('sa-phone') });
        root.querySelector('#sa-status').textContent = 'Zapisano adres wysyłki.';
      });
      const form = root.querySelector('#profile-form');
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!F.validate(form, [{ id: 'pf-first', check: F.v.required('imię') }])) return;
        await KBR.auth.updateProfile({ firstName: form.querySelector('#pf-first').value.trim(), lastName: form.querySelector('#pf-last').value.trim() });
        root.querySelector('#pf-status').textContent = 'Zapisano zmiany.';
      });
    } };
  };

  KBR.pages.payments = function (route) {
    const g = guard(route); if (g) return g;
    const orders = KBR.subscription.orders();
    const inner = '<h1>Płatności i faktury</h1><p class="sub">Metoda płatności, rozliczenia i dokumenty.</p>' +
      '<section class="panel" aria-labelledby="h-method"><h2 id="h-method">Metoda płatności</h2><p style="margin-top:12px">Prototyp nie przechowuje danych kart ani innych danych płatniczych. Zarządzanie metodą płatności zależy od wybranego operatora (do decyzji).</p></section>' +
      (orders.length ? ordersTable(orders) : '<section class="panel"><h2>Historia płatności</h2><p style="margin-top:12px">Brak płatności na tym koncie.</p></section>') +
      '<section class="panel" aria-labelledby="h-docs"><h2 id="h-docs">Dokumenty</h2><p style="margin-top:12px">Faktury będą dostępne do pobrania po integracji z systemem rozliczeń. <span class="demo-tag">Widok demonstracyjny</span></p></section>';
    return { title: 'Płatności i faktury – KBR', html: shell('platnosci', inner) };
  };

  KBR.pages.preferences = function (route) {
    const g = guard(route); if (g) return g;
    const u = KBR.auth.currentUser();
    const interests = u.interests || [];
    const inner = '<h1>Newslettery i preferencje</h1><p class="sub">Wybierz, jakie wiadomości chcesz otrzymywać i które tematy Cię interesują.</p>' +
      '<form class="panel" id="pref-form"><fieldset class="fieldset"><legend>Newslettery</legend>' +
      '<label class="check" for="pr-nl"><input type="checkbox" id="pr-nl"' + (u.consents.newsletter ? ' checked' : '') + '><span>Cotygodniowy newsletter KBR</span></label>' +
      '<label class="check" for="pr-mk"><input type="checkbox" id="pr-mk"' + (u.consents.marketing ? ' checked' : '') + '><span>Wydarzenia i oferta edukacyjna Akademii Leona Koźmińskiego</span></label></fieldset>' +
      '<fieldset class="fieldset" style="margin-top:28px"><legend>Interesujące mnie tematy</legend>' +
      KBR.data.topics.map(function (t) { return '<label class="check" for="pr-t-' + t.id + '"><input type="checkbox" id="pr-t-' + t.id + '" data-topic="' + t.id + '"' + (interests.indexOf(t.id) !== -1 ? ' checked' : '') + '><span>' + esc(t.name) + '</span></label>'; }).join('') + '</fieldset>' +
      '<div class="btn-row" style="margin-top:24px"><button class="btn btn--primary" type="submit">Zapisz preferencje</button><span role="status" class="t-meta" id="pr-status"></span></div></form>';
    return { title: 'Newslettery i preferencje – KBR', html: shell('preferencje', inner), mount: function (root) {
      const form = root.querySelector('#pref-form');
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const u2 = KBR.auth.currentUser();
        await KBR.auth.updateProfile({ consents: Object.assign({}, u2.consents, { newsletter: form.querySelector('#pr-nl').checked, marketing: form.querySelector('#pr-mk').checked }),
          interests: Array.from(form.querySelectorAll('[data-topic]:checked')).map(function (x) { return x.dataset.topic; }) });
        root.querySelector('#pr-status').textContent = 'Zapisano preferencje.';
      });
    } };
  };
})();
