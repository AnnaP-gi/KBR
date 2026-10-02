/* Subskrypcja i zakup: porównanie planów → konto → dane → podsumowanie → symulowana płatność → wynik. */
(function () {
  const ui = KBR.ui, C = KBR.content, I = KBR.icon, esc = ui.esc, F = KBR.forms, CFG = KBR.config;

  function steps(current) {
    const list = ['Wybór planu', 'Konto', 'Dane zamówienia', 'Podsumowanie', 'Płatność'];
    const dr = KBR.checkout.get() || {};
    const hrefs = ['#/subskrypcja' + (dr.period === 'month' ? '?okres=mies' : ''), null, '#/zamowienie', '#/zamowienie/podsumowanie', null];
    return '<ol class="steps" aria-label="Etapy zakupu">' + list.map(function (s, i) {
      const n = i + 1;
      const inner = '<span class="n">' + (n < current ? I('check', 14, 'stroke-width="2.5"') : n) + '</span><span class="lbl">' + s + (n < current ? '<span class="visually-hidden"> (ukończono)</span>' : '') + '</span>';
      const href = n < current && hrefs[i];
      return '<li' + (n < current ? ' data-state="done"' : '') + (n === current ? ' aria-current="step"' : '') + '>' + (href ? '<a href="' + href + '" title="Wróć do kroku: ' + s + '">' + inner + '</a>' : inner) + '</li>';
    }).join('') + '</ol>';
  }

  function sourceBox(id, label) {
    const m = id && C.get(id); if (!m) return '';
    return '<div class="context-box"><img src="' + ui.img(m.image) + '" alt=""><div><span class="t-label">' + label + '</span><strong>' + esc(m.title) + '</strong></div></div>';
  }

  function summaryAside(d, opts) {
    opts = opts || {};
    const p = KBR.subscription.plan(d.planId), per = CFG.periods[d.period];
    const amount = KBR.checkout.amount(d);
    return '<aside class="summary" aria-labelledby="h-summary"><h2 id="h-summary">Twoje zamówienie</h2><p class="plan-name">' + esc(p.name) + '</p>' +
      '<p style="font-size:14px;margin-top:4px">' + esc(p.description) + '</p>' +
      '<dl><dt>Okres rozliczeniowy</dt><dd>' + per.label + '</dd><dt>Start dostępu</dt><dd>Po opłaceniu</dd><dt>Odnawianie</dt><dd>Automatyczne*</dd>' +
      (p.print ? '<dt>Najbliższa wysyłka magazynu</dt><dd>' + esc(CFG.printShipping.next) + '</dd>' + (d.shipping ? '<dt>Adres wysyłki</dt><dd>' + esc(d.shipping.name) + '<br>' + esc(d.shipping.street) + '<br>' + esc(d.shipping.postal) + ' ' + esc(d.shipping.city) + '</dd>' : '') : '') +
      '<dt class="total">Do zapłaty</dt><dd class="total">' + ui.money(amount) + '</dd></dl>' +
      '<p style="font-size:12px;line-height:18px;margin-top:10px;color:var(--c-muted)">*Zasady odnawiania, VAT i ceny to dane demonstracyjne do zatwierdzenia.</p>' +
      (opts.change !== false ? '<a class="t-link" href="#/subskrypcja">Zmień plan</a>' : '') +
      sourceBox(d.sourceId, 'Po zakupie wrócisz do') + '</aside>';
  }

  /* Informacja o rabacie rocznym liczona z konfiguracji (pokazywana tylko, gdy jest jednakowa dla planów) */
  function yearlyNote() {
    const saved = CFG.plans.map(function (p) { return Math.round(12 - p.prices.year / p.prices.month); });
    if (saved.some(function (x) { return x !== saved[0]; }) || saved[0] < 1) return '';
    return ' <em>' + saved[0] + (saved[0] === 1 ? ' miesiąc' : saved[0] < 5 ? ' miesiące' : ' miesięcy') + ' taniej</em>';
  }

  function num(n) { return (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0).replace('.', ','); }

  /* ------------------------------------------------------------ Plany */
  KBR.pages.plans = function (route) {
    const period = route.query.okres === 'mies' ? 'month' : 'year';
    const src = route.query.z && C.get(route.query.z) ? route.query.z : (KBR.checkout.get() || {}).sourceId || null;
    const sub = KBR.subscription.get();
    const active = sub && sub.status === 'active';

    const plans = CFG.plans.map(function (p) {
      const current = active && sub.planId === p.id;
      return '<article class="plan' + (p.featured ? ' plan--featured' : '') + '" aria-labelledby="plan-' + p.id + '">' +
        (current ? '<span class="plan__flag badge badge--navy">Twój plan</span>' : p.featured ? '<span class="plan__flag badge badge--premium">Najczęściej wybierany</span>' : '') +
        '<h2 id="plan-' + p.id + '">' + esc(p.name) + '</h2><p class="desc">' + esc(p.description) + '</p>' +
        '<div class="price-opts">' +
          '<p class="price-opt price-opt--year"><strong>' + num(p.prices.year / 12) + ' ' + CFG.currency + '</strong><span>/ mies. (rozliczenie roczne)</span></p>' +
          '<p class="price-opt price-opt--month">lub <strong>' + num(p.prices.month) + ' ' + CFG.currency + '</strong> / miesięcznie</p>' +
        '</div>' +
        (p.print ? '<p class="plan__ship">' + I('mail', 16) + '<span>' + esc(CFG.printShipping.short) + '</span></p>' : '') +
        (active
          ? '<p class="btn btn--outline" aria-disabled="true" style="margin-top:24px;height:48px">' + (current ? 'Aktywny plan' : 'Zmiana planu – do decyzji') + '</p>'
          : '<button type="button" class="btn btn--primary" data-action="select-plan" data-plan="' + p.id + '">Wybierz: ' + esc(p.name) + I('chevRight', 16, 'stroke-width="2"') + '</button>') +
        '<ul>' + p.features.map(function (f) { return '<li class="' + (f.included ? 'yes' : 'no') + '">' + I(f.included ? 'check' : 'dash', 20) + '<span>' + (f.included ? '' : '<span class="visually-hidden">Nie obejmuje: </span>') + esc(f.text) + '</span></li>'; }).join('') + '</ul></article>';
    }).join('');

    const html = '<div class="container">' +
      '<header class="plans-head">' + ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Subskrypcja' }]).replace('<nav class="crumbs"', '<nav class="crumbs" style="display:flex;justify-content:center"') +
        '<h1 style="margin-top:20px">Wybierz subskrypcję KBR</h1><p>Pełny dostęp do analiz, studiów przypadków i materiałów Premium tworzonych z ekspertami Akademii Leona Koźmińskiego.</p>' +
        (active ? '<div class="notice notice--success" style="max-width:760px;margin:24px auto 0;text-align:left">' + I('checkCircle', 18) + '<span>Masz aktywną subskrypcję. <a class="link" href="#/konto/subskrypcja">Zobacz szczegóły w koncie</a></span></div>' : '') +
        sourceBox(src, 'Wybierasz subskrypcję, aby przeczytać') +
        '<div class="notice notice--demo">' + I('info', 18) + '<span><strong>Dane demonstracyjne.</strong> Nazwy, ceny, okresy rozliczeniowe i zakres planów są założeniami prototypu, a nie zatwierdzoną ofertą KBR. Konfiguracja znajduje się w jednym pliku (config.js).</span></div>' +
      '</header>' +
      '<div class="plans">' + plans + '</div>' +
      '<div class="access-alt">' +
        '<div class="community-card"><div><h3>' + 'Dostęp dla firm</h3><p>Pakiet dla wielu pracowników zamawiany przez kontakt z doradcą.</p></div><a class="t-link" href="#/dostep/firmy">Skontaktuj się z doradcą' + KBR.icon('chevRight', 14, 'stroke-width="2.25"') + '</a></div>' +
        '<div class="community-card"><div><h3>Dostęp akademicki</h3><p>Dla studentów i pracowników Akademii Leona Koźmińskiego.</p></div><a class="t-link" href="#/dostep/akademicki">Sprawdź zasady' + KBR.icon('chevRight', 14, 'stroke-width="2.25"') + '</a></div>' +
        '<div class="community-card"><div><h3>Faktura na firmę</h3><p>Kupujesz indywidualnie, ale potrzebujesz faktury? Zaznacz to w formularzu zamówienia.</p></div><span class="t-link" style="color:var(--c-muted)">Opcja w zamówieniu</span></div>' +
      '</div></div>';

    return { title: 'Subskrypcja – KBR', html: html, mount: function (root) {
      root.querySelectorAll('[data-action="select-plan"]').forEach(function (b) {
        b.addEventListener('click', function () {
          KBR.checkout.start(b.dataset.plan, period, src);
          if (KBR.auth.currentUser()) { KBR.app.navigate('#/zamowienie'); return; }
          KBR.flow.setReturn('#/zamowienie');
          KBR.app.navigate('#/rejestracja');
          setTimeout(function () { ui.toast('Aby kontynuować zakup, załóż bezpłatne konto lub zaloguj się. Wybrany plan został zachowany.'); }, 60);
        });
      });
    } };
  };

  function requireDraft(route) {
    const d = KBR.checkout.get();
    if (!d || !d.planId) return KBR.pages.redirect('#/subskrypcja');
    if (!KBR.auth.currentUser()) { KBR.flow.setReturn('#' + route.path); return KBR.pages.redirect('#/rejestracja'); }
    return null;
  }

  /* ------------------------------------------------ Dane zamówienia */
  KBR.pages.order = function (route) {
    const r = requireDraft(route); if (r) return r;
    const d = KBR.checkout.get(), u = KBR.auth.currentUser();
    if (KBR.subscription.isActive()) return KBR.pages.redirect('#/konto/subskrypcja');
    const inv = d.invoice || {};
    const shp = d.shipping || {};
    const isPrint = !!(KBR.subscription.plan(d.planId) || {}).print;
    const cust = d.customer || { name: [u.firstName, u.lastName].filter(Boolean).join(' ') };
    const html = '<div class="container">' + steps(3) + '<div class="checkout"><div>' +
      '<h1>Dane zamówienia</h1><p style="margin-top:8px">Jesteś zalogowana/y jako <strong>' + esc(u.email) + '</strong>. Nie musisz ponownie zakładać konta.</p>' +
      '<form id="order-form" novalidate>' +
        '<section class="form-section" aria-labelledby="h-plan"><h2 id="h-plan">Plan i okres</h2><div class="two-col">' +
          '<div class="field"><label for="o-plan">Plan</label><select class="input" id="o-plan">' + CFG.plans.map(function (p) { return '<option value="' + p.id + '"' + (p.id === d.planId ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label for="o-period">Okres rozliczeniowy</label><select class="input" id="o-period"><option value="month"' + (d.period === 'month' ? ' selected' : '') + '>Miesięcznie</option><option value="year"' + (d.period === 'year' ? ' selected' : '') + '>Rocznie</option></select></div></div></section>' +
        '<section class="form-section" aria-labelledby="h-buyer"><h2 id="h-buyer">Dane kupującego</h2>' +
          '<div class="field"><label for="o-name">Imię i nazwisko</label><input class="input" id="o-name" autocomplete="name" value="' + esc(cust.name || '') + '"></div>' +
          '<div class="field"><label for="o-email">Adres e-mail</label><input class="input" id="o-email" value="' + esc(u.email) + '" readonly aria-describedby="o-email-hint"><p class="hint" id="o-email-hint">Na ten adres wyślemy potwierdzenie zamówienia (w prototypie nie jest wysyłane).</p></div></section>' +
        '<section class="form-section" aria-labelledby="h-ship" id="ship-section"' + (isPrint ? '' : ' hidden') + '><h2 id="h-ship">Adres wysyłki magazynu</h2>' +
          '<p class="notice" style="margin:0 0 20px">' + I('mail', 18) + '<span>' + esc(CFG.printShipping.details) + '<br><strong>Najbliższa wysyłka: ' + esc(CFG.printShipping.next) + '.</strong></span></p>' +
          '<div class="field"><label for="s-name">Imię i nazwisko odbiorcy</label><input class="input" id="s-name" autocomplete="shipping name" value="' + esc(shp.name || cust.name || '') + '"></div>' +
          '<div class="field"><label for="s-street">Ulica, numer domu i lokalu</label><input class="input" id="s-street" autocomplete="shipping street-address" value="' + esc(shp.street || '') + '"></div>' +
          '<div class="two-col"><div class="field"><label for="s-postal">Kod pocztowy</label><input class="input" id="s-postal" autocomplete="shipping postal-code" placeholder="00-000" value="' + esc(shp.postal || '') + '"></div>' +
          '<div class="field"><label for="s-city">Miejscowość</label><input class="input" id="s-city" autocomplete="shipping address-level2" value="' + esc(shp.city || '') + '"></div></div>' +
          '<div class="field"><label for="s-phone">Telefon dla kuriera <span style="font-weight:400;color:var(--c-muted)">(opcjonalnie)</span></label><input class="input" id="s-phone" type="tel" autocomplete="tel" value="' + esc(shp.phone || '') + '"></div>' +
          '<p class="hint">Wysyłka tylko na terenie Polski. <span class="demo-tag">Zasady do zatwierdzenia</span></p></section>' +
        '<section class="form-section" aria-labelledby="h-invoice"><h2 id="h-invoice">Faktura <span style="font-weight:400;text-transform:none;letter-spacing:0">(opcjonalnie)</span></h2>' +
          '<label class="check" for="o-inv"><input type="checkbox" id="o-inv" aria-controls="inv-fields" aria-expanded="' + (inv.wanted ? 'true' : 'false') + '"' + (inv.wanted ? ' checked' : '') + '><span>Potrzebuję faktury na firmę (zakup indywidualny z fakturą VAT)</span></label>' +
          '<div id="inv-fields"' + (inv.wanted ? '' : ' hidden') + ' style="margin-top:20px">' +
            '<div class="field"><label for="o-company">Nazwa firmy</label><input class="input" id="o-company" autocomplete="organization" value="' + esc(inv.company || '') + '"></div>' +
            '<div class="field"><label for="o-nip">NIP</label><input class="input" id="o-nip" inputmode="numeric" aria-describedby="o-nip-hint" value="' + esc(inv.nip || '') + '"><p class="hint" id="o-nip-hint">10 cyfr, np. 5260250274 (przykładowy numer do testów).</p></div>' +
            '<div class="field"><label for="o-street">Ulica i numer</label><input class="input" id="o-street" autocomplete="street-address" value="' + esc(inv.street || '') + '"></div>' +
            '<div class="two-col"><div class="field"><label for="o-postal">Kod pocztowy</label><input class="input" id="o-postal" autocomplete="postal-code" placeholder="00-000" value="' + esc(inv.postal || '') + '"></div>' +
            '<div class="field"><label for="o-city">Miejscowość</label><input class="input" id="o-city" autocomplete="address-level2" value="' + esc(inv.city || '') + '"></div></div>' +
          '</div>' +
          '<p class="notice" style="margin-top:20px">' + I('building', 18) + '<span>Kupujesz dostęp dla zespołu? To osobna oferta: <a class="link" href="#/dostep/firmy">skontaktuj się z doradcą</a>.</span></p></section>' +
        '<section class="form-section" aria-labelledby="h-terms"><h2 id="h-terms">Zgody</h2>' +
          '<label class="check" for="o-terms"><input type="checkbox" id="o-terms"' + (d.termsAccepted ? ' checked' : '') + '><span>Akceptuję <a href="#/strona/regulamin-subskrypcji" target="_blank">Regulamin subskrypcji</a> (wymagane). <span class="demo-tag">Treść do zatwierdzenia</span></span></label></section>' +
        '<div class="step-actions"><a class="btn btn--ghost" href="#/subskrypcja">Wróć do planów</a><button class="btn btn--primary" type="submit" style="height:48px">Przejdź do podsumowania' + I('chevRight', 16, 'stroke-width="2"') + '</button></div>' +
      '</form></div>' + '<div id="summary-slot">' + summaryAside(d) + '</div></div></div>';

    return { title: 'Dane zamówienia – KBR', html: html, mount: function (root) {
      const form = root.querySelector('#order-form');
      const invBox = root.querySelector('#o-inv'), invFields = root.querySelector('#inv-fields');
      invBox.addEventListener('change', function () { invFields.hidden = !invBox.checked; invBox.setAttribute('aria-expanded', String(invBox.checked)); });
      function syncPlan() {
        const nd = KBR.checkout.update({ planId: root.querySelector('#o-plan').value, period: root.querySelector('#o-period').value });
        root.querySelector('#ship-section').hidden = !(KBR.subscription.plan(nd.planId) || {}).print;
        root.querySelector('#summary-slot').innerHTML = summaryAside(nd);
      }
      root.querySelector('#o-plan').addEventListener('change', syncPlan);
      root.querySelector('#o-period').addEventListener('change', syncPlan);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const ok = F.validate(form, [
          { id: 'o-name', check: F.v.required('imię i nazwisko') },
          { id: 's-name', check: F.v.required('imię i nazwisko odbiorcy') },
          { id: 's-street', check: F.v.required('ulicę i numer') },
          { id: 's-postal', check: F.v.postal },
          { id: 's-city', check: F.v.required('miejscowość') },
          { id: 'o-company', check: F.v.required('nazwę firmy') },
          { id: 'o-nip', check: F.v.nip },
          { id: 'o-street', check: F.v.required('ulicę i numer') },
          { id: 'o-postal', check: F.v.postal },
          { id: 'o-city', check: F.v.required('miejscowość') },
          { id: 'o-terms', check: F.v.checked('Zaakceptuj Regulamin subskrypcji, aby kontynuować.') }
        ]);
        if (!ok) return;
        const val = function (id) { return root.querySelector('#' + id).value.trim(); };
        KBR.checkout.update({
          customer: { name: val('o-name'), email: u.email },
          invoice: invBox.checked ? { wanted: true, company: val('o-company'), nip: val('o-nip').replace(/[\s-]/g, ''), street: val('o-street'), postal: val('o-postal'), city: val('o-city') } : { wanted: false },
          shipping: !root.querySelector('#ship-section').hidden ? { name: val('s-name'), street: val('s-street'), postal: val('s-postal'), city: val('s-city'), phone: val('s-phone') } : null,
          termsAccepted: true
        });
        KBR.app.navigate('#/zamowienie/podsumowanie');
      });
    } };
  };

  /* --------------------------------------------------- Podsumowanie */
  KBR.pages.orderSummary = function (route) {
    const r = requireDraft(route); if (r) return r;
    const d = KBR.checkout.get();
    if (!d.termsAccepted || !d.customer) return KBR.pages.redirect('#/zamowienie');
    const p = KBR.subscription.plan(d.planId), per = CFG.periods[d.period];
    const inv = d.invoice && d.invoice.wanted ? d.invoice : null;
    const html = '<div class="container">' + steps(4) + '<div class="checkout"><div>' +
      '<h1>Podsumowanie zamówienia</h1><p style="margin-top:8px">Sprawdź dane przed przejściem do płatności.</p>' +
      '<section class="panel" aria-labelledby="h-s1"><div style="display:flex;justify-content:space-between;gap:12px"><h2 id="h-s1">Subskrypcja</h2><a class="link" href="#/zamowienie">Zmień</a></div>' +
        '<dl class="dl"><dt>Plan</dt><dd>' + esc(p.name) + '</dd><dt>Okres rozliczeniowy</dt><dd>' + per.label + '</dd><dt>Kwota</dt><dd>' + ui.money(KBR.checkout.amount(d)) + ' / ' + per.unit + '</dd><dt>Zakres</dt><dd>' + p.features.filter(function (x) { return x.included; }).map(function (x) { return esc(x.text); }).join('<br>') + '</dd></dl></section>' +
      '<section class="panel" aria-labelledby="h-s2"><div style="display:flex;justify-content:space-between;gap:12px"><h2 id="h-s2">Kupujący i faktura</h2><a class="link" href="#/zamowienie">Zmień</a></div>' +
        '<dl class="dl"><dt>Imię i nazwisko</dt><dd>' + esc(d.customer.name) + '</dd>' + (p.print && d.shipping ? '<dt>Wysyłka magazynu</dt><dd>' + esc(d.shipping.name) + '<br>' + esc(d.shipping.street) + ', ' + esc(d.shipping.postal) + ' ' + esc(d.shipping.city) + (d.shipping.phone ? '<br>tel. ' + esc(d.shipping.phone) : '') + '<br><span style="color:var(--c-muted)">Najbliższa wysyłka: ' + esc(CFG.printShipping.next) + '</span></dd>' : '') + '<dt>E-mail</dt><dd>' + esc(d.customer.email) + '</dd><dt>Faktura</dt><dd>' +
        (inv ? esc(inv.company) + '<br>NIP ' + esc(inv.nip) + '<br>' + esc(inv.street) + ', ' + esc(inv.postal) + ' ' + esc(inv.city) : 'Nie – potwierdzenie zakupu na adres e-mail') + '</dd></dl></section>' +
      '<div class="step-actions"><a class="btn btn--ghost" href="#/zamowienie">Wróć</a><button type="button" class="btn btn--primary" data-go-pay style="height:48px">Zamawiam i płacę' + I('chevRight', 16, 'stroke-width="2"') + '</button></div>' +
      '<p style="font-size:13px;margin-top:12px;color:var(--c-muted)">Etykieta przycisku i obowiązki informacyjne wymagają weryfikacji prawnej. <span class="demo-tag">Demo</span></p>' +
      '</div>' + summaryAside(d) + '</div></div>';
    return { title: 'Podsumowanie zamówienia – KBR', html: html, mount: function (root) {
      root.querySelector('[data-go-pay]').addEventListener('click', function () {
        const cur = KBR.checkout.get();
        if (!cur.orderId) KBR.checkout.update({ orderId: 'KBR-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase() });
        KBR.app.navigate('#/platnosc');
      });
    } };
  };

  /* ---------------------------------------------- Symulowana płatność */
  KBR.pages.payment = function (route) {
    const r = requireDraft(route); if (r) return r;
    const d = KBR.checkout.get();
    if (!d.orderId) return KBR.pages.redirect('#/zamowienie/podsumowanie');
    if (KBR.subscription.isActive()) return KBR.pages.redirect('#/konto/subskrypcja');
    const amount = ui.money(KBR.checkout.amount(d));
    const recurring = d.period === 'month';
    const methods = recurring ? [['karta', 'Karta płatnicza']] : [['blik', 'BLIK'], ['przelew', 'Szybki przelew'], ['karta', 'Karta płatnicza']];
    const defMethod = recurring ? 'karta' : (d.method || 'blik');
    const html = '<div class="container">' + steps(5) + '<div class="checkout"><div>' +
      '<h1>Płatność</h1><p style="margin-top:8px">Zamówienie <strong>' + esc(d.orderId) + '</strong> · do zapłaty <strong>' + amount + '</strong></p>' +
      (d.lastError ? '<div class="notice notice--error" style="margin-top:20px" role="alert">' + I('alert', 18) + '<span>Poprzednia próba płatności nie powiodła się. Twój wybór planu został zachowany – możesz spróbować ponownie.</span></div>' : '') +
      '<div class="pay-sim" role="note"><h2>Symulowana płatność</h2><p>To prototyp. Żadne pieniądze nie są pobierane, a dane kart nie są zbierane ani zapisywane. Operator płatności i liczba ekranów są do decyzji.</p></div>' +
      '<form id="pay-form" style="margin-top:28px"><fieldset class="fieldset"><legend>Metoda płatności</legend><div class="pay-methods">' +
        methods.map(function (mt, i) { return '<label class="radio-card"><input type="radio" name="method" value="' + mt[0] + '"' + (defMethod === mt[0] ? ' checked' : '') + '><span><strong style="color:var(--c-ink)">' + mt[1] + '</strong><br><span style="font-size:13px;color:var(--c-muted)">' + (recurring ? 'Karta zostanie zapisana u operatora i obciążana automatycznie co miesiąc. Subskrypcję możesz anulować w dowolnym momencie.' : 'Obsługa u operatora płatności – w prototypie bez pól do wpisywania danych') + '</span></span></label>'; }).join('') +
        (recurring ? '<p class="hint" style="margin-top:4px">Przy płatności co miesiąc dostępna jest tylko karta – BLIK i szybki przelew nie obsługują automatycznego pobierania opłat. <a class="link" href="#/subskrypcja">Wybierz okres roczny</a>, aby zapłacić BLIK-iem lub przelewem.</p>' : '') +
      '</div></fieldset>' +
      '<div class="step-actions pay-actions"><button type="button" class="btn btn--ghost" data-pay="canceled">Anuluj płatność</button>' +
        '<div class="step-actions__fwd"><button type="button" class="btn btn--outline" data-pay="failure">Symuluj odrzuconą płatność</button>' +
        '<button type="button" class="btn btn--primary" data-pay="success">Zapłać ' + amount + ' <span style="font-weight:600;text-transform:none;letter-spacing:0">(symulacja)</span></button></div></div>' +
      '<p id="pay-status" role="status" aria-live="polite" class="t-meta" style="margin-top:16px"></p></form>' +
      '</div>' + summaryAside(d, { change: false }) + '</div></div>';

    return { title: 'Płatność – KBR', html: html, mount: function (root) {
      const buttons = root.querySelectorAll('[data-pay]');
      buttons.forEach(function (b) {
        b.addEventListener('click', async function () {
          const outcome = b.dataset.pay;
          const method = root.querySelector('input[name="method"]:checked').value;
          const draft = KBR.checkout.update({ method: method });
          buttons.forEach(function (x) { x.disabled = true; });
          root.querySelector('#pay-status').textContent = outcome === 'canceled' ? 'Anulowanie płatności…' : 'Przetwarzanie płatności… (symulacja)';
          const order = await KBR.payments.simulate(draft, outcome);
          const status = order.status === 'paid' ? 'sukces' : order.status === 'failed' ? 'blad' : 'anulowano';
          if (order.status === 'paid') {
            KBR.storage.set('lastOrder', { order: order, sourceId: draft.sourceId || null }, 'session');
            KBR.checkout.clear();
          } else {
            KBR.checkout.update({ lastError: status });
          }
          KBR.app.navigate('#/platnosc/wynik?status=' + status);
        });
      });
    } };
  };

  /* ------------------------------------------------ Wynik płatności */
  KBR.pages.paymentResult = function (route) {
    const status = route.query.status;
    let html;
    if (status === 'sukces') {
      const last = KBR.storage.get('lastOrder', null, 'session');
      const sub = KBR.subscription.get();
      if (!last || !sub || sub.status !== 'active') return KBR.pages.redirect('#/konto/subskrypcja');
      const p = KBR.subscription.plan(sub.planId);
      const src = last.sourceId && C.get(last.sourceId);
      const savedCount = KBR.library.get().saved.length;
      html = '<div class="container"><div class="result">' +
        '<div class="result__icon result__icon--ok">' + I('checkCircle', 40) + '</div>' +
        '<h1>Subskrypcja jest aktywna</h1>' +
        '<p>Płatność za zamówienie <strong>' + esc(last.order.orderId) + '</strong> została przyjęta (symulacja). Plan <strong>' + esc(p.name) + '</strong> jest aktywny do ' + ui.dateLong(sub.validUntil) + '. Materiały Premium są już odblokowane.</p>' +
        (src ? '<div class="context-box" style="max-width:560px;margin:28px auto 0;text-align:left"><img src="' + ui.img(src.image) + '" alt=""><div><span class="t-label">Możesz dokończyć lekturę</span><strong>' + esc(src.title) + '</strong></div></div>' : '') +
        '<div class="btn-row">' + (src ? '<a class="btn btn--primary" href="' + ui.materialUrl(src) + '">Wróć do artykułu' + I('chevRight', 16, 'stroke-width="2"') + '</a><a class="btn btn--outline" href="#/konto/biblioteka">Przejdź do biblioteki' + (savedCount ? ' (' + savedCount + ')' : '') + '</a>'
          : '<a class="btn btn--primary" href="#/konto/biblioteka">Przejdź do biblioteki' + I('chevRight', 16, 'stroke-width="2"') + '</a><a class="btn btn--outline" href="#/artykuly?dostep=premium">Przeglądaj treści Premium</a>') +
        '<a class="btn btn--ghost" href="#/konto/subskrypcja">Moja subskrypcja</a></div>' +
        '<p class="notice notice--demo" style="margin-top:32px;text-align:left">' + I('info', 18) + '<span>Potwierdzenie e-mail nie zostało wysłane (prototyp). Docelowo aktywacja następuje po potwierdzeniu płatności przez serwer.</span></p>' +
        '</div></div>';
    } else if (status === 'blad' || status === 'anulowano') {
      const d = KBR.checkout.get();
      const p = d && KBR.subscription.plan(d.planId);
      const src = d && d.sourceId && C.get(d.sourceId);
      const failed = status === 'blad';
      html = '<div class="container"><div class="result">' +
        '<div class="result__icon ' + (failed ? 'result__icon--err' : 'result__icon--cancel') + '">' + I(failed ? 'alert' : 'close', 40) + '</div>' +
        '<h1>' + (failed ? 'Płatność nie powiodła się' : 'Płatność została anulowana') + '</h1>' +
        '<p>' + (failed ? 'Operator odrzucił płatność (symulacja). ' : 'Nie pobrano żadnej opłaty. ') + 'Subskrypcja <strong>nie została aktywowana</strong>.' + (p ? ' Twój wybór – plan <strong>' + esc(p.name) + '</strong>, ' + KBR.config.periods[d.period].label.toLowerCase() + ' – został zachowany.' : '') + '</p>' +
        '<div class="btn-row">' + (p ? '<a class="btn btn--primary" href="#/platnosc">Spróbuj ponownie' + I('chevRight', 16, 'stroke-width="2"') + '</a><a class="btn btn--outline" href="#/zamowienie">Zmień dane zamówienia</a>' : '<a class="btn btn--primary" href="#/subskrypcja">Wybierz plan</a>') +
        (src ? '<a class="btn btn--ghost" href="' + ui.materialUrl(src) + '">Wróć do artykułu</a>' : '') + '</div></div></div>';
    } else {
      return KBR.pages.redirect('#/subskrypcja');
    }
    return { title: 'Wynik płatności – KBR', html: html };
  };

  /* ------------------------------------------------ Dostęp dla firm */
  KBR.pages.corporate = function (route) {
    const sent = route.query.wyslano === '1';
    const html = '<div class="container"><header class="page-head">' + ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Subskrypcja', href: '#/subskrypcja' }, { label: 'Dostęp dla firm' }]) +
      '<h1>Dostęp dla firm</h1><p>Pakiet KBR dla wielu pracowników: wspólny dostęp do treści Premium, wydań magazynu i raportów. Ofertę przygotowuje doradca – nie prowadzimy zakupu zespołowego online.</p></header>' +
      '<div class="info-grid info"><div>' +
        (sent ? '<div class="notice notice--success" role="status">' + I('checkCircle', 20) + '<div><strong>Dziękujemy za zapytanie.</strong><br>Doradca skontaktuje się z Tobą w ciągu 2 dni roboczych (termin do potwierdzenia). W prototypie wiadomość nie została wysłana.</div></div><div class="btn-row" style="margin-top:24px"><a class="btn btn--outline" href="#/">Wróć na stronę główną</a></div>'
        : '<form id="corp-form" novalidate><h2 class="t-section" style="margin-bottom:20px">Formularz zapytania</h2>' +
          '<div class="two-col"><div class="field"><label for="c-company">Nazwa firmy</label><input class="input" id="c-company" autocomplete="organization"></div>' +
          '<div class="field"><label for="c-size">Liczba osób z dostępem</label><select class="input" id="c-size"><option value="">Wybierz</option><option>5–20</option><option>21–100</option><option>101–500</option><option>Powyżej 500</option></select></div></div>' +
          '<div class="two-col"><div class="field"><label for="c-name">Imię i nazwisko</label><input class="input" id="c-name" autocomplete="name"></div>' +
          '<div class="field"><label for="c-email">Służbowy e-mail</label><input class="input" id="c-email" type="email" autocomplete="email"></div></div>' +
          '<div class="field"><label for="c-phone">Telefon <span style="font-weight:400;color:var(--c-muted)">(opcjonalnie)</span></label><input class="input" id="c-phone" type="tel" autocomplete="tel"></div>' +
          '<div class="field"><label for="c-msg">Wiadomość <span style="font-weight:400;color:var(--c-muted)">(opcjonalnie)</span></label><textarea class="input" id="c-msg" rows="4" style="height:auto;padding:10px 12px"></textarea></div>' +
          '<div class="consents"><label class="check" for="c-consent"><input type="checkbox" id="c-consent"><span>Wyrażam zgodę na kontakt w sprawie oferty (wymagane). <span class="demo-tag">Treść do zatwierdzenia</span></span></label></div>' +
          '<div class="btn-row" style="margin-top:28px"><button class="btn btn--primary" type="submit" style="height:48px">Wyślij zapytanie' + I('chevRight', 16, 'stroke-width="2"') + '</button></div></form>') +
      '</div><aside><div class="auth-side"><h2>Twój doradca</h2><p style="margin-top:12px;font-size:15px;line-height:22px;color:var(--c-ink)"><strong>[Imię i nazwisko doradcy]</strong><br>Opiekun klientów korporacyjnych KBR<br>[e-mail] · [telefon]</p><p class="demo-tag" style="margin-top:12px">Dane do uzupełnienia</p>' +
        '<ul><li>' + I('check', 18) + 'Pakiet dla wielu pracowników</li><li>' + I('check', 18) + 'Oferta dopasowana do wielkości zespołu</li><li>' + I('check', 18) + 'Rozliczenie na podstawie umowy</li></ul></div>' +
        '<p class="notice" style="margin-top:20px">' + I('info', 18) + '<span>Kupujesz tylko dla siebie, ale potrzebujesz faktury na firmę? <a class="link" href="#/subskrypcja">Wybierz plan indywidualny</a> i zaznacz fakturę w zamówieniu.</span></p></aside></div></div>';
    return { title: 'Dostęp dla firm – KBR', html: html, mount: function (root) {
      const form = root.querySelector('#corp-form'); if (!form) return;
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const ok = F.validate(form, [{ id: 'c-company', check: F.v.required('nazwę firmy') }, { id: 'c-size', check: function (v) { return v ? null : 'Wybierz przybliżoną liczbę osób.'; } }, { id: 'c-name', check: F.v.required('imię i nazwisko') }, { id: 'c-email', check: F.v.email }, { id: 'c-consent', check: F.v.checked('Zaznacz zgodę na kontakt.') }]);
        if (!ok) return;
        const btn = form.querySelector('[type="submit"]'); F.busy(btn, true, 'Wysyłanie…');
        await new Promise(function (r) { setTimeout(r, 400); });
        KBR.app.navigate('#/dostep/firmy?wyslano=1');
      });
    } };
  };

  KBR.pages.academic = function () {
    const html = '<div class="container"><header class="page-head">' + ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Subskrypcja', href: '#/subskrypcja' }, { label: 'Dostęp akademicki' }]) +
      '<h1>Dostęp akademicki</h1><p>Studenci, doktoranci i pracownicy Akademii Leona Koźmińskiego mogą korzystać z treści KBR na zasadach dostępu akademickiego.</p></header>' +
      '<div class="info-grid info"><div class="prose"><h2 style="margin-top:0">Uprawnienia</h2><p>Zakres dostępu akademickiego (np. treści Premium, wydania magazynu) wymaga potwierdzenia. <span class="demo-tag">Do decyzji</span></p>' +
      '<h2>Sposób aktywacji</h2><p>Rozważane są dwa warianty: logowanie przez konto uczelniane (SSO) lub weryfikacja adresu e-mail w domenie uczelni. Wybór wariantu wpływa na liczbę ekranów i nie został jeszcze podjęty.</p>' +
      '<ul><li>SSO – jedno logowanie, automatyczna weryfikacja statusu.</li><li>Weryfikacja e-mail – link aktywacyjny wysyłany na adres uczelniany.</li></ul>' +
      '<p>Do czasu decyzji aktywacja nie jest dostępna w prototypie.</p></div>' +
      '<aside class="auth-side"><h2>Masz pytania?</h2><p style="margin-top:12px">Skontaktuj się z redakcją KBR.</p><div class="btn-row" style="margin-top:16px"><a class="btn btn--outline" href="#/strona/kontakt">Kontakt</a></div></aside></div></div>';
    return { title: 'Dostęp akademicki – KBR', html: html };
  };
})();
