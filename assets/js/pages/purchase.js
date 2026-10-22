/* Subskrypcja i zakup: wybór pakietu → konto → formularz Jotform (dane + płatność) → status zamówienia.
   Dostęp nadaje wyłącznie potwierdzenie płatności po stronie serwera (KBR.server.paymentWebhook). */
(function () {
  const ui = KBR.ui, C = KBR.content, I = KBR.icon, esc = ui.esc, F = KBR.forms, CFG = KBR.config;

  function steps(current) {
    const list = ['Wybór pakietu', 'Konto', 'Dane i płatność', 'Potwierdzenie'];
    const hrefs = ['#/subskrypcja', null, '#/zamowienie', null];
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
    const p = KBR.subscription.plan(d.planId);
    const amount = KBR.subscription.price(d.planId, 'year');
    return '<aside class="summary" aria-labelledby="h-summary"><h2 id="h-summary">Twoje zamówienie</h2><p class="plan-name">' + esc(p.name) + ' <span class="summary__months">· 12 miesięcy</span></p>' +
      '<p style="font-size:14px;line-height:21px;margin-top:6px">' + esc(p.description) + '</p>' +
      '<dl><dt>Okres dostępu</dt><dd>12 miesięcy</dd><dt>Płatność</dt><dd>Jednorazowa</dd><dt>Start dostępu</dt><dd>Po potwierdzeniu płatności</dd>' +
      (p.print ? '<dt>Najbliższa wysyłka</dt><dd>' + esc(CFG.printShipping.next) + '</dd>' : '') +
      '<dt class="total">Do zapłaty</dt><dd class="total">' + ui.money(amount) + '</dd></dl>' +
      '<p class="summary__note">' + I('info', 16) + '<span>' + esc(CFG.purchase.priceNote) + '</span></p>' +
      (opts.change !== false ? '<a class="t-link" href="#/subskrypcja">Zmień pakiet</a>' : '') +
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
    const period = 'year';
    const src = route.query.z && C.get(route.query.z) ? route.query.z : (KBR.checkout.get() || {}).sourceId || null;
    const sub = KBR.subscription.get();
    const active = sub && sub.status === 'active';

    const plans = CFG.plans.map(function (p) {
      const current = active && sub.planId === p.id;
      return '<article class="plan' + (p.featured ? ' plan--featured' : '') + '" aria-labelledby="plan-' + p.id + '">' +
        (current ? '<span class="plan__flag badge badge--navy">Twój plan</span>' : p.featured ? '<span class="plan__flag badge badge--premium">Najczęściej wybierany</span>' : '') +
        '<h2 id="plan-' + p.id + '">' + esc(p.name) + '</h2><p class="desc">' + esc(p.description) + '</p>' +
        '<div class="price-opts">' +
          '<p class="price-opt price-opt--year"><strong>' + num(p.prices.year) + ' ' + CFG.currency + '</strong><span>/ rok</span></p>' +
          '<p class="price-opt price-opt--month">' + esc(CFG.purchase.priceNote) + '</p>' +
        '</div>' +
        (p.print ? '<p class="plan__ship">' + I('mail', 16) + '<span>' + esc(CFG.printShipping.short) + '</span></p>' : '') +
        (active
          ? '<p class="btn btn--outline" aria-disabled="true" style="margin-top:24px;height:48px">' + (current ? 'Aktywny plan' : 'Zmiana planu – do decyzji') + '</p>'
          : '<button type="button" class="btn btn--primary" data-action="select-plan" data-plan="' + p.id + '">' + esc(p.cta || ('Wybierz: ' + p.name)) + I('chevRight', 16, 'stroke-width="2"') + '</button>') +
        '<ul>' + p.features.map(function (f) { return '<li class="' + (f.included ? 'yes' : 'no') + '">' + I(f.included ? 'check' : 'dash', 20) + '<span>' + (f.included ? '' : '<span class="visually-hidden">Nie obejmuje: </span>') + esc(f.text) + '</span></li>'; }).join('') + '</ul></article>';
    }).join('');

    const html = '<div class="container">' +
      '<header class="plans-head">' + ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Subskrypcja' }]).replace('<nav class="crumbs"', '<nav class="crumbs" style="display:flex;justify-content:center"') +
        '<h1 style="margin-top:20px">Wybierz subskrypcję magazynu KBR</h1><p>Trzy warianty subskrypcji magazynu. Różnią się formatem wydania i zakresem dostępu do artykułów online.</p>' +
        (active ? '<div class="notice notice--success" style="max-width:760px;margin:24px auto 0;text-align:left">' + I('checkCircle', 18) + '<span>Masz aktywną subskrypcję. <a class="link" href="#/konto/subskrypcja">Zobacz szczegóły w koncie</a></span></div>' : '') +
        sourceBox(src, 'Wybierasz subskrypcję, aby przeczytać') +
        '<div class="notice notice--demo">' + I('info', 18) + '<span><strong>Ceny demonstracyjne.</strong> Każdy pakiet to jednorazowa płatność za 12 miesięcy dostępu, bez automatycznego odnawiania. Ceny i nazwy są w pliku config.js.</span></div>' +
      '</header>' +
      '<div class="plans">' + plans + '</div>' +
      '<section aria-labelledby="h-compare" style="margin-top:64px"><h2 class="t-section col-head" id="h-compare">Porównanie pakietów</h2>' +
        '<div class="table-wrap"><table class="table" style="min-width:560px"><thead><tr><th scope="col">Zakres</th>' + CFG.plans.map(function (p) { return '<th scope="col" style="text-align:center">' + esc(p.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        CFG.featureList.map(function (t, i) {
          return '<tr><th scope="row" style="font-size:15px;text-transform:none;letter-spacing:0;color:var(--c-ink);font-weight:400">' + esc(t) + '</th>' + CFG.plans.map(function (p) {
            const on = p.includes[i];
            return '<td style="text-align:center;color:' + (on ? 'var(--c-gold)' : 'var(--c-border-strong)') + '">' + I(on ? 'check' : 'dash', 20) + '<span class="visually-hidden">' + (on ? 'Tak' : 'Nie') + '</span></td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>' +
        '<p class="notice" style="margin-top:20px">' + I('info', 18) + '<span>Pakiet Drukowany nie obejmuje magazynu w formacie PDF ani dostępu do wszystkich artykułów w serwisie. Dostęp online dotyczy wyłącznie artykułów opublikowanych w magazynie.</span></p></section>' +
      '<div style="height:96px"></div></div>';

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

  /* Adres formularza Jotform z wypełnieniem pól (prefill przez parametry URL = unikalne nazwy pól). */
  function jotformUrl(o, u) {
    const J = CFG.jotform, f = J.fields, p = KBR.subscription.plan(o.planId);
    const base = (J.formUrlByPlan && J.formUrlByPlan[o.planId]) || J.formUrl;
    if (!base) return '';
    const q = {};
    q[f.plan] = p.name + ' — 12 miesięcy';
    q[f.planCode] = p.id;
    q[f.orderId] = o.orderId;
    q[f.userId] = u.id;
    q[f.amount] = String(o.amount);
    q[f.email] = u.email;
    if (u.firstName) q[f.name + '[first]'] = u.firstName;
    if (u.lastName) q[f.name + '[last]'] = u.lastName;
    return base + (base.indexOf('?') === -1 ? '?' : '&') + Object.keys(q).map(function (k) { return encodeURIComponent(k).replace(/%5B/g, '[').replace(/%5D/g, ']') + '=' + encodeURIComponent(q[k]); }).join('&');
  }

  /* Podgląd formularza w trybie demonstracyjnym – układ pól 1:1 z konfiguracją Jotform (bez pól karty). */
  function demoForm(o, u) {
    const p = KBR.subscription.plan(o.planId);
    const consents = CFG.purchase.consents;
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return '<div class="jf-demo-flag" role="note">' + I('info', 18) + '<div><strong>Tryb demonstracyjny – formularz Jotform nie jest jeszcze podłączony.</strong> Poniżej podgląd pól, które pojawią się w osadzonym formularzu. Płatność nie zostanie pobrana. Po podaniu linku do formularza w config.js (jotform.formUrl) w tym miejscu wyświetli się formularz Jotform z bramką płatności.</div></div>' +
      '<form id="jf-demo" class="jf-shell" novalidate>' +
        '<section class="form-section" aria-labelledby="h-buyer"><h2 id="h-buyer">Dane zamawiającego</h2>' +
          '<div class="field"><label for="o-name">Imię i nazwisko</label><input class="input" id="o-name" autocomplete="name" value="' + esc(name) + '"></div>' +
          '<div class="field"><label for="o-email">Adres e-mail</label><input class="input" id="o-email" type="email" value="' + esc(u.email) + '" readonly aria-describedby="o-email-hint"><p class="hint" id="o-email-hint">Adres konta KBR, do którego przypiszemy dostęp.</p></div></section>' +
        (p.print
          ? '<section class="form-section" aria-labelledby="h-ship"><h2 id="h-ship">Adres dostawy magazynu</h2>' +
              '<p class="hint" style="margin:0 0 16px">' + esc(CFG.printShipping.short) + ' Najbliższa wysyłka: ' + esc(CFG.printShipping.next) + '.</p>' +
              '<div class="field"><label for="s-street">Ulica, numer domu i lokalu</label><input class="input" id="s-street" autocomplete="shipping street-address"></div>' +
              '<div class="two-col"><div class="field"><label for="s-postal">Kod pocztowy</label><input class="input" id="s-postal" autocomplete="shipping postal-code" placeholder="00-000"></div>' +
              '<div class="field"><label for="s-city">Miejscowość</label><input class="input" id="s-city" autocomplete="shipping address-level2"></div></div>' +
              '<div class="field"><label for="s-phone">Telefon dla kuriera <span class="opt">(opcjonalnie)</span></label><input class="input" id="s-phone" type="tel" autocomplete="tel"></div></section>'
          : '') +
        '<section class="form-section" aria-labelledby="h-invoice"><h2 id="h-invoice">Faktura</h2>' +
          '<label class="check" for="o-inv"><input type="checkbox" id="o-inv" aria-controls="inv-fields" aria-expanded="false"><span>Chcę otrzymać fakturę na firmę</span></label>' +
          '<div id="inv-fields" hidden style="margin-top:20px">' +
            '<div class="field"><label for="o-company">Nazwa firmy</label><input class="input" id="o-company" autocomplete="organization"></div>' +
            '<div class="field"><label for="o-nip">NIP</label><input class="input" id="o-nip" inputmode="numeric" aria-describedby="o-nip-hint"><p class="hint" id="o-nip-hint">10 cyfr, np. 5260250274 (numer testowy).</p></div>' +
            '<div class="field"><label for="o-street">Adres firmy</label><input class="input" id="o-street" autocomplete="street-address"></div>' +
            '<div class="two-col"><div class="field"><label for="o-postal">Kod pocztowy</label><input class="input" id="o-postal" placeholder="00-000"></div>' +
            '<div class="field"><label for="o-city">Miejscowość</label><input class="input" id="o-city"></div></div></div></section>' +
        '<section class="form-section" aria-labelledby="h-pkg"><h2 id="h-pkg">Podsumowanie</h2>' +
          '<div class="jf-product"><div><strong>' + esc(p.name) + ' — 12 miesięcy</strong><span>' + esc(p.description) + '</span></div><b>' + ui.money(o.amount) + '</b></div>' +
          '<div class="jf-total"><span>Razem</span><strong>' + ui.money(o.amount) + '</strong></div>' +
          '<p class="jf-note">' + esc(CFG.purchase.priceNote) + '</p></section>' +
        '<section class="form-section" aria-labelledby="h-terms"><h2 id="h-terms">Zgody</h2>' +
          consents.map(function (c) { return '<label class="check" for="c-' + c.id + '"><input type="checkbox" id="c-' + c.id + '"><span>' + (c.link ? esc(c.text).replace(/(Regulamin subskrypcji KBR|Polityką prywatności)/, '<a href="' + c.link + '" target="_blank">$1</a>') : esc(c.text)) + (c.required ? ' (wymagane)' : '') + ' <span class="demo-tag">Treść do dostarczenia</span></span></label>'; }).join('') + '</section>' +
        '<section class="form-section" aria-labelledby="h-pay"><h2 id="h-pay">Płatność</h2>' +
          '<div class="jf-gateway">' + I('lock', 18) + '<span>Tu wyświetli się bramka płatności skonfigurowana w Jotform (płatność jednorazowa). Prototyp nie zawiera pól karty i nie zbiera danych płatniczych.</span></div></section>' +
        '<div class="step-actions"><a class="btn btn--ghost" href="#/subskrypcja">Wróć do pakietów</a><button class="btn btn--primary" type="submit" style="height:48px">Zamawiam i płacę ' + ui.money(o.amount) + I('chevRight', 16, 'stroke-width="2"') + '</button></div>' +
        '<p class="hint" style="margin-top:12px">Wysłanie formularza nie aktywuje dostępu. Aktywujemy go po potwierdzeniu płatności przez operatora.</p>' +
      '</form>';
  }

  /* ------------------------------------------- Dane i płatność (Jotform) */
  KBR.pages.order = function (route) {
    const r = requireDraft(route); if (r) return r;
    const u = KBR.auth.currentUser();
    if (KBR.subscription.isActive()) return KBR.pages.redirect('#/konto/subskrypcja');
    let d = KBR.checkout.get();
    let o = d.orderId && KBR.orders.get(d.orderId);
    if (!o || o.planId !== d.planId || ['created', 'awaiting_payment'].indexOf(o.status) === -1) {
      o = KBR.orders.create(d);
      d = KBR.checkout.update({ orderId: o.orderId, period: 'year' });
    }
    const src = jotformUrl(o, u);
    const html = '<div class="container">' + steps(3) + '<div class="checkout"><div>' +
      '<h1>Dane i płatność</h1><p style="margin-top:8px">Zalogowano jako <strong>' + esc(u.email) + '</strong>. Zakup zostanie przypisany do tego konta. Numer zamówienia: <strong>' + esc(o.orderId) + '</strong>.</p>' +
      (src
        ? '<div class="jf-frame"><iframe id="jf-iframe" title="Formularz zamówienia subskrypcji KBR" src="' + esc(src) + '" allow="payment; fullscreen" scrolling="no" style="width:100%;min-height:900px;border:0;display:block"></iframe></div>' +
          '<p class="hint" style="margin-top:12px">' + I('lock', 14) + ' Formularz i płatność obsługuje Jotform wraz z operatorem płatności. Dostęp aktywujemy po potwierdzeniu płatności. <a class="link" href="#/zamowienie/status?nr=' + encodeURIComponent(o.orderId) + '">Sprawdź status zamówienia</a></p>'
        : demoForm(o, u)) +
      '</div><div id="summary-slot">' + summaryAside(d) + '</div></div></div>';

    return { title: 'Dane i płatność – KBR', html: html, mount: function (root) {
      const frame = root.querySelector('#jf-iframe');
      if (frame) {
        /* Jotform wysyła do strony nadrzędnej komunikaty „setHeight:<px>:<formId>” */
        const onMsg = function (e) {
          if (!/jotform/.test(e.origin) || typeof e.data !== 'string') return;
          const a = e.data.split(':');
          if (a[0] === 'setHeight' && !isNaN(a[1])) frame.style.height = (parseInt(a[1], 10) + 24) + 'px';
          if (a[0] === 'scrollIntoView') window.scrollTo({ top: frame.getBoundingClientRect().top + window.scrollY - 24 });
        };
        window.addEventListener('message', onMsg);
        const off = function () { window.removeEventListener('message', onMsg); window.removeEventListener('hashchange', off); };
        window.addEventListener('hashchange', off);
        return;
      }
      const form = root.querySelector('#jf-demo'); if (!form) return;
      const p = KBR.subscription.plan(o.planId);
      const invBox = root.querySelector('#o-inv'), invFields = root.querySelector('#inv-fields');
      invBox.addEventListener('change', function () { invFields.hidden = !invBox.checked; invBox.setAttribute('aria-expanded', String(invBox.checked)); });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const rules = [{ id: 'o-name', check: F.v.required('imię i nazwisko') }];
        if (p.print) rules.push({ id: 's-street', check: F.v.required('ulicę i numer') }, { id: 's-postal', check: F.v.postal }, { id: 's-city', check: F.v.required('miejscowość') });
        if (invBox.checked) rules.push({ id: 'o-company', check: F.v.required('nazwę firmy') }, { id: 'o-nip', check: F.v.nip }, { id: 'o-street', check: F.v.required('adres firmy') }, { id: 'o-postal', check: F.v.postal }, { id: 'o-city', check: F.v.required('miejscowość') });
        form.querySelectorAll('[id^="c-"]').forEach(function (c) { rules.push({ id: c.id, check: F.v.checked('Zaznacz wymaganą zgodę.') }); });
        if (!F.validate(form, rules)) return;
        const val = function (id) { const el = root.querySelector('#' + id); return el ? el.value.trim() : ''; };
        KBR.orders.markSubmitted(o.orderId, {
          customer: { name: val('o-name'), email: u.email },
          shipping: p.print ? { name: val('o-name'), street: val('s-street'), postal: val('s-postal'), city: val('s-city'), phone: val('s-phone') } : null,
          invoice: invBox.checked ? { company: val('o-company'), nip: val('o-nip').replace(/[\s-]/g, ''), street: val('o-street'), postal: val('o-postal'), city: val('o-city') } : null
        });
        KBR.app.navigate('#/zamowienie/status?nr=' + encodeURIComponent(o.orderId));
      });
    } };
  };

  /* ---------------------------------------- Status zamówienia i płatności
     Adres strony podziękowania w Jotform: https://<domena>/#/zamowienie/status?nr={numerZamowienia} */
  KBR.pages.orderStatus = function (route) {
    if (window.top !== window.self) { try { window.top.location.href = location.href; } catch (e) {} }
    const u = KBR.auth.currentUser();
    if (!u) { KBR.flow.setReturn('#' + route.path + '?nr=' + encodeURIComponent(route.query.nr || '')); return KBR.pages.redirect('#/logowanie'); }
    const o = route.query.nr && KBR.orders.get(route.query.nr);
    if (!o) {
      return { title: 'Zamówienie – KBR', html: '<div class="container"><div class="result"><div class="result__icon result__icon--cancel">' + I('alert', 40) + '</div><h1>Nie znaleźliśmy zamówienia</h1><p>Zamówienie nie istnieje albo należy do innego konta. Zaloguj się na konto, na które składano zamówienie.</p><div class="btn-row"><a class="btn btn--primary" href="#/subskrypcja">Wybierz pakiet</a><a class="btn btn--ghost" href="#/konto/subskrypcja">Moja subskrypcja</a></div></div></div>' };
    }
    const p = KBR.subscription.plan(o.planId);
    const src = o.sourceId && C.get(o.sourceId);
    const demo = !((CFG.jotform.formUrlByPlan && CFG.jotform.formUrlByPlan[o.planId]) || CFG.jotform.formUrl);
    const head = '<div class="container">' + steps(o.status === 'paid' ? 5 : 4) + '<div class="result">';
    let body;
    if (o.status === 'paid') {
      KBR.checkout.clear();
      body = '<div class="result__icon result__icon--ok">' + I('checkCircle', 40) + '</div>' +
        '<h1>Subskrypcja jest aktywna</h1>' +
        '<p>Płatność za zamówienie <strong>' + esc(o.orderId) + '</strong> została potwierdzona. Pakiet <strong>' + esc(p.name) + '</strong> jest aktywny do <strong>' + ui.dateLong(o.validUntil) + '</strong>. Subskrypcja nie odnowi się automatycznie.</p>' +
        (src ? '<div class="context-box" style="max-width:560px;margin:28px auto 0;text-align:left"><img src="' + ui.img(src.image) + '" alt=""><div><span class="t-label">Możesz dokończyć lekturę</span><strong>' + esc(src.title) + '</strong></div></div>' : '') +
        '<div class="btn-row">' + (src ? '<a class="btn btn--primary" href="' + ui.materialUrl(src) + '">Wróć do artykułu' + I('chevRight', 16, 'stroke-width="2"') + '</a>' : '<a class="btn btn--primary" href="#/magazyn">Przejdź do magazynu' + I('chevRight', 16, 'stroke-width="2"') + '</a>') +
        '<a class="btn btn--outline" href="#/konto/subskrypcja">Moja subskrypcja</a></div>';
    } else if (o.status === 'failed' || o.status === 'canceled') {
      const failed = o.status === 'failed';
      body = '<div class="result__icon ' + (failed ? 'result__icon--err' : 'result__icon--cancel') + '">' + I(failed ? 'alert' : 'close', 40) + '</div>' +
        '<h1>' + (failed ? 'Płatność nie powiodła się' : 'Płatność została anulowana') + '</h1>' +
        '<p>Zamówienie <strong>' + esc(o.orderId) + '</strong> nie zostało opłacone. ' + (failed ? 'Operator odrzucił płatność. ' : 'Nie pobrano żadnej opłaty. ') + 'Dostęp <strong>nie został aktywowany</strong>.</p>' +
        '<div class="btn-row"><a class="btn btn--primary" href="#/zamowienie" data-retry="' + esc(o.planId) + '">Spróbuj ponownie' + I('chevRight', 16, 'stroke-width="2"') + '</a><a class="btn btn--outline" href="#/subskrypcja">Zmień pakiet</a>' +
        (src ? '<a class="btn btn--ghost" href="' + ui.materialUrl(src) + '">Wróć do artykułu</a>' : '') + '</div>';
    } else if (o.status === 'review') {
      body = '<div class="result__icon result__icon--cancel">' + I('info', 40) + '</div><h1>Weryfikujemy płatność</h1>' +
        '<p>Płatność za zamówienie <strong>' + esc(o.orderId) + '</strong> wymaga sprawdzenia przez obsługę KBR. Dostęp aktywujemy po wyjaśnieniu. Skontaktujemy się z Tobą e-mailem.</p>' +
        '<div class="btn-row"><a class="btn btn--outline" href="#/strona/kontakt">Kontakt</a></div>';
    } else {
      body = '<div class="result__icon result__icon--wait" aria-hidden="true"><span class="spinner"></span></div>' +
        '<h1>Czekamy na potwierdzenie płatności</h1>' +
        '<p role="status">Zamówienie <strong>' + esc(o.orderId) + '</strong> · pakiet <strong>' + esc(p.name) + ' — 12 miesięcy</strong> · ' + ui.money(o.amount) + '.<br>Dostęp aktywujemy, gdy operator płatności potwierdzi wpłatę. Zwykle trwa to kilka sekund, ta strona odświeży się sama.</p>' +
        '<p class="hint" style="margin-top:12px">Samo wysłanie formularza nie aktywuje dostępu.</p>' +
        (demo
          ? '<div class="pay-sim" role="group" aria-labelledby="h-sim" style="text-align:left;margin-top:32px"><h2 id="h-sim">Symulacja serwera (webhook płatności)</h2><p>W produkcji ten krok wykonuje serwer KBR po otrzymaniu potwierdzenia od Jotform i operatora płatności. Wybierz wynik, aby sprawdzić kolejne stany.</p>' +
            '<div class="btn-row" style="margin-top:16px;justify-content:flex-start"><button type="button" class="btn btn--primary" data-hook="paid">Płatność potwierdzona</button><button type="button" class="btn btn--outline" data-hook="failed">Płatność odrzucona</button><button type="button" class="btn btn--ghost" data-hook="canceled">Anulowano</button></div></div>'
          : '');
    }
    const html = head + body + '</div></div>';
    return { title: 'Status zamówienia – KBR', html: html, mount: function (root) {
      if (['created', 'awaiting_payment'].indexOf(o.status) !== -1) {
        const timer = setInterval(function () {
          if (!document.contains(root)) { clearInterval(timer); return; }
          const cur = KBR.orders.get(o.orderId);
          if (cur && cur.status !== o.status) { clearInterval(timer); KBR.app.render(); }
        }, 3000);
      }
      root.querySelectorAll('[data-hook]').forEach(function (b) {
        b.addEventListener('click', async function () {
          root.querySelectorAll('[data-hook]').forEach(function (x) { x.disabled = true; });
          await KBR.server.paymentWebhook({ orderId: o.orderId, paymentStatus: b.dataset.hook, amount: o.amount, transactionId: 'demo-' + Date.now().toString(36) });
          KBR.app.render();
        });
      });
      const retry = root.querySelector('[data-retry]');
      if (retry) retry.addEventListener('click', function () { KBR.checkout.start(o.planId, 'year', o.sourceId); KBR.checkout.update({ orderId: null }); });
    } };
  };

  /* Dawne adresy procesu zakupu */
  KBR.pages.orderSummary = function () { return KBR.pages.redirect('#/zamowienie'); };
  KBR.pages.payment = function () { return KBR.pages.redirect('#/zamowienie'); };
  KBR.pages.paymentResult = function () {
    const d = KBR.checkout.get();
    return KBR.pages.redirect(d && d.orderId ? '#/zamowienie/status?nr=' + encodeURIComponent(d.orderId) : '#/konto/subskrypcja');
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
