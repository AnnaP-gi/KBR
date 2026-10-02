/* ==========================================================================
   Router (hash) i obsługa zdarzeń globalnych.
   Adresy: #/artykul/<id> – jeden adres materiału niezależnie od miejsca wejścia.
   ========================================================================== */
KBR.app = (function () {
  const ui = KBR.ui, P = KBR.pages, I = KBR.icon;

  const routes = [
    [/^\/$/, P.home],
    [/^\/artykuly$/, P.articles],
    [/^\/artykul\/([\w-]+)$/, P.article, ['id']],
    [/^\/tematy\/([\w-]+)$/, P.topic, ['slug']],
    [/^\/studia-przypadkow$/, P.formatList(['case'], 'Studia przypadków', 'Pogłębione analizy transformacji konkretnych organizacji.', 'Studia przypadków')],
    [/^\/podcasty$/, P.formatList(['podcast', 'video'], 'Podcasty i wideo', 'Rozmowy z praktykami biznesu i naukowcami. Jedna lista z rozróżnieniem formatów.', 'Podcasty i wideo')],
    [/^\/magazyn$/, P.magazine],
    [/^\/tematy$/, P.topics],
    [/^\/wydarzenia$/, P.events],
    [/^\/wydarzenie\/([\w-]+)$/, P.event, ['id']],
    [/^\/kluby$/, P.clubs],
    [/^\/executive-education$/, P.executive],
    [/^\/wyszukiwanie$/, P.search],
    [/^\/autorzy$/, P.authors],
    [/^\/autor\/([\w-]+)$/, P.author, ['id']],
    [/^\/rejestracja$/, P.register],
    [/^\/logowanie$/, P.login],
    [/^\/reset-hasla$/, P.resetRequest],
    [/^\/reset-hasla\/nowe$/, P.resetNew],
    [/^\/konto$/, function () { return P.redirect('#/konto/biblioteka'); }],
    [/^\/konto\/biblioteka$/, P.library],
    [/^\/konto\/subskrypcja$/, P.mySubscription],
    [/^\/konto\/dane$/, P.myData],
    [/^\/konto\/platnosci$/, P.payments],
    [/^\/konto\/preferencje$/, P.preferences],
    [/^\/subskrypcja$/, P.plans],
    [/^\/zamowienie$/, P.order],
    [/^\/zamowienie\/podsumowanie$/, P.orderSummary],
    [/^\/platnosc$/, P.payment],
    [/^\/platnosc\/wynik$/, P.paymentResult],
    [/^\/dostep\/firmy$/, P.corporate],
    [/^\/dostep\/akademicki$/, P.academic],
    [/^\/strona\/([\w-]+)$/, P.info, ['slug']]
  ];

  function parse() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const qi = raw.indexOf('?');
    const path = (qi === -1 ? raw : raw.slice(0, qi)) || '/';
    const search = qi === -1 ? '' : raw.slice(qi);
    const query = {};
    new URLSearchParams(search).forEach(function (v, k) { query[k] = v; });
    return { path: path, search: search, query: query, params: {} };
  }

  let first = true, lastPath = null;
  function render() {
    const route = parse();
    let handler = P.notFound;
    for (const r of routes) {
      const m = route.path.match(r[0]);
      if (m) { handler = r[1]; (r[2] || []).forEach(function (k, i) { route.params[k] = m[i + 1]; }); break; }
    }
    let page;
    try { page = handler(route); } catch (e) { console.error(e); page = P.notFound(); }
    if (page.redirect) { history.replaceState(null, '', page.redirect); return render(); }

    const act = document.activeElement;
    const keep = act && act !== document.body ? { id: act.id, href: act.getAttribute && act.getAttribute('href') } : null;

    document.getElementById('site-header').innerHTML = ui.header(route);
    const main = document.getElementById('main');
    main.innerHTML = page.html;
    document.title = page.title || 'Kozminski Business Review';
    if (page.mount) page.mount(main);
    ui.syncSaveButtons();

    const pathChanged = route.path !== lastPath;
    lastPath = route.path;
    if (!first && pathChanged) { window.scrollTo(0, 0); ui.focusMain(); }
    else if (!first && keep) {
      /* ta sama podstrona (np. zmiana filtra) – przywróć fokus na odpowiadający element */
      let el = keep.id ? document.getElementById(keep.id) : null;
      if (!el && keep.href) el = main.querySelector('[href="' + keep.href.replace(/"/g, '\\"') + '"]');
      if (el) el.focus({ preventScroll: true });
    }
    first = false;
  }

  function navigate(hash) {
    if (location.hash === hash) render(); else location.hash = hash;
  }

  function currentHash() { return location.hash || '#/'; }
  function isAuthRoute(h) { return /^#\/(logowanie|rejestracja|reset-hasla)/.test(h); }

  /* ------------------------------------------------ Zapis w bibliotece */
  function toggleSave(id) {
    const m = KBR.content.get(id); if (!m) return;
    if (!KBR.auth.currentUser()) {
      const d = ui.modal('<span class="t-label">Moja biblioteka</span><h2 id="modal-title">Zapisz materiał, aby wrócić do niego później</h2>' +
        '<p>Zapisywanie w bibliotece wymaga <strong>bezpłatnego konta KBR</strong>. Po założeniu konta lub zalogowaniu wrócisz do tego materiału, a my zapiszemy go automatycznie.</p>' +
        '<div class="context-box"><img src="' + ui.img(m.image) + '" alt=""><div><span class="t-label">' + ui.esc(KBR.content.topic(m.topic).name) + '</span><strong>' + ui.esc(m.title) + '</strong></div></div>' +
        '<div class="btn-row"><a class="btn btn--primary" href="#/rejestracja" data-pending-save="' + m.id + '">Załóż bezpłatne konto</a><a class="btn btn--outline" href="#/logowanie" data-pending-save="' + m.id + '">Zaloguj się</a><button type="button" class="btn btn--ghost" data-close>Anuluj</button></div>');
      d.querySelectorAll('[data-pending-save]').forEach(function (a) {
        a.addEventListener('click', function () {
          KBR.flow.setPending({ type: 'save', id: m.id });
          KBR.flow.setReturn(isAuthRoute(currentHash()) ? '#/artykul/' + m.id : currentHash());
          d.close();
        });
      });
      return;
    }
    if (KBR.library.isSaved(id)) {
      KBR.library.remove(id);
      ui.toast('Usunięto z biblioteki: „' + ui.esc(m.title) + '”. <a href="#" data-action="undo-remove" data-id="' + id + '">Cofnij</a>');
    } else {
      KBR.library.save(id);
      ui.toast('Zapisano w bibliotece. <a href="#/konto/biblioteka">Przejdź do biblioteki</a>', { kind: 'success' });
    }
  }

  /* ------------------------------------------------ Obserwowanie tematu */
  function syncFollow(id) {
    const on = !!KBR.auth.currentUser() && KBR.follow.isFollowing(id);
    document.querySelectorAll('[data-action="toggle-follow"][data-id="' + id + '"]').forEach(function (b) {
      const compact = b.classList.contains('save-btn--compact');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.innerHTML = KBR.icon(on ? 'bookmarkFill' : 'bookmark', compact ? 16 : 18) + '<span>' + (on ? (compact ? 'Obserwujesz' : 'Obserwujesz temat') : (compact ? 'Obserwuj' : 'Obserwuj cały temat')) + '</span>';
    });
  }
  function toggleFollow(id) {
    const t = KBR.content.topic(id); if (!t) return;
    if (!KBR.auth.currentUser()) {
      const d = ui.modal('<span class="t-label">Moja biblioteka</span><h2 id="modal-title">Obserwuj temat „' + ui.esc(t.name) + '”</h2>' +
        '<p>Obserwowanie tematów wymaga <strong>bezpłatnego konta KBR</strong>. Po założeniu konta lub zalogowaniu wrócisz tutaj, a temat trafi do zakładki „Obserwowane tematy” w Twojej bibliotece.</p>' +
        '<div class="btn-row"><a class="btn btn--primary" href="#/rejestracja" data-pending-follow>Załóż bezpłatne konto</a><a class="btn btn--outline" href="#/logowanie" data-pending-follow>Zaloguj się</a><button type="button" class="btn btn--ghost" data-close>Anuluj</button></div>');
      d.querySelectorAll('[data-pending-follow]').forEach(function (a) {
        a.addEventListener('click', function () {
          KBR.flow.setPending({ type: 'follow', id: id });
          KBR.flow.setReturn(isAuthRoute(currentHash()) ? '#/tematy/' + t.slug : currentHash());
          d.close();
        });
      });
      return;
    }
    const on = KBR.follow.toggle(id);
    syncFollow(id);
    ui.toast(on ? 'Obserwujesz temat „' + ui.esc(t.name) + '”. <a href="#/konto/biblioteka?zakladka=tematy">Przejdź do biblioteki</a>' : 'Nie obserwujesz już tematu „' + ui.esc(t.name) + '”.', on ? { kind: 'success' } : undefined);
  }

  function closeMenus(except) {
    document.querySelectorAll('[data-action="menu"][aria-expanded="true"]').forEach(function (b) {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      const p = document.getElementById(b.getAttribute('aria-controls')); if (p) p.hidden = true;
    });
  }

  function onClick(e) {
    const t = e.target.closest('[data-action]');
    if (!t) { if (!e.target.closest('.menu__panel')) closeMenus(); return; }
    const a = t.dataset.action;
    switch (a) {
      case 'skip': e.preventDefault(); ui.focusMain(); break;
      case 'menu': {
        const open = t.getAttribute('aria-expanded') === 'true';
        closeMenus(t);
        t.setAttribute('aria-expanded', String(!open));
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) { p.hidden = open; if (!open) { const f = p.querySelector('a, button'); if (f && e.detail === 0) f.focus(); } }
        break;
      }
      case 'toggle-save': toggleSave(t.dataset.id); break;
      case 'toggle-follow': toggleFollow(t.dataset.id); break;
      case 'close-topbar': { KBR.storage.set('topbarClosed', true, 'session'); const tb = t.closest('.topbar'); if (tb) tb.remove(); break; }
      case 'remove-saved': {
        const m = KBR.content.get(t.dataset.id);
        KBR.library.remove(t.dataset.id); render();
        ui.toast('Usunięto z zapisanych: „' + ui.esc(m.title) + '”. <a href="#" data-action="undo-remove" data-id="' + m.id + '">Cofnij</a>');
        const next = document.querySelector('.lib-item a.t-title-card') || document.querySelector('#main h1');
        if (next) { next.setAttribute('tabindex', next.tagName === 'H1' ? '-1' : '0'); next.focus(); }
        break;
      }
      case 'undo-remove': e.preventDefault(); KBR.library.save(t.dataset.id); t.closest('.toast') && t.closest('.toast').remove(); ui.toast('Przywrócono w bibliotece.', { kind: 'success' }); if (/^#\/konto\/biblioteka/.test(currentHash())) render(); break;
      case 'logout': {
        KBR.auth.logout();
        closeMenus();
        if (/^#\/(konto|zamowienie|platnosc)/.test(currentHash())) navigate('#/'); else render();
        ui.toast('Wylogowano. Do zobaczenia!');
        break;
      }
      case 'auth-link': if (!isAuthRoute(currentHash())) KBR.flow.setReturn(currentHash()); break;
      case 'toggle-pw': {
        const inp = document.getElementById(t.dataset.target);
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        t.setAttribute('aria-pressed', String(show));
        t.innerHTML = I(show ? 'eyeOff' : 'eye', 18) + '<span>' + (show ? 'Ukryj' : 'Pokaż') + '</span><span class="visually-hidden"> hasło</span>';
        break;
      }
      case 'toggle-search': case 'toggle-drawer': {
        const el = document.getElementById(t.getAttribute('aria-controls'));
        const open = !el.classList.contains('is-open');
        el.classList.toggle('is-open', open); t.setAttribute('aria-expanded', String(open));
        if (open && a === 'toggle-search') el.querySelector('input').focus();
        break;
      }
      case 'drawer-sub': {
        const el = document.getElementById(t.getAttribute('aria-controls'));
        el.hidden = !el.hidden; t.setAttribute('aria-expanded', String(!el.hidden)); break;
      }
      case 'copy-link': {
        const done = function () { ui.toast('Skopiowano link do materiału.'); closeMenus(); };
        if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () { ui.toast('Nie udało się skopiować. Adres: ' + ui.esc(location.href)); });
        else ui.toast('Adres materiału: ' + ui.esc(location.href));
        break;
      }
      case 'native-share': navigator.share({ title: document.title, url: location.href }).catch(function () {}); closeMenus(); break;
      case 'auto-renew': KBR.subscription.setAutoRenew(t.dataset.on === '1'); ui.toast(t.dataset.on === '1' ? 'Włączono automatyczne odnawianie (symulacja).' : 'Wyłączono automatyczne odnawianie (symulacja). Dostęp pozostaje aktywny do końca okresu.'); break;
      case 'cookies': ui.cookies(); break;
    }
  }

  async function onSubmit(e) {
    const form = e.target;
    if (form.dataset.form === 'search') {
      e.preventDefault();
      const q = form.querySelector('input[name="q"]').value.trim();
      navigate('#/wyszukiwanie' + (q ? '?q=' + encodeURIComponent(q) : ''));
    }
    if (form.dataset.form === 'newsletter') {
      e.preventDefault();
      const consent = form.querySelector('input[name="consent"]'), email = form.querySelector('input[name="email"]');
      const ok = KBR.forms.validate(form, [{ id: email.id, check: KBR.forms.v.email }, { id: consent.id, check: KBR.forms.v.checked('Zaznacz wymaganą zgodę, aby zapisać się do newslettera.') }]);
      if (!ok) return;
      await KBR.newsletter.subscribe(email.value);
      form.querySelector('.nl-status').innerHTML = '<p class="notice notice--success">' + I('checkCircle', 18) + '<span>Dziękujemy! Adres ' + ui.esc(email.value.trim()) + ' został zapisany (symulacja – e-mail potwierdzający nie został wysłany).</span></p>';
      email.value = ''; consent.checked = false;
    }
  }

  function init() {
    document.getElementById('site-footer').innerHTML = ui.footer();
    document.addEventListener('click', onClick);
    let hoverTimer = null;
    function setHoverMenu(li, open) {
      const b = li.querySelector('[data-action="menu"]'), p = b && document.getElementById(b.getAttribute('aria-controls'));
      if (!b || !p) return;
      if (open) closeMenus(b);
      b.setAttribute('aria-expanded', String(open)); p.hidden = !open;
    }
    document.addEventListener('mouseover', function (e) {
      const li = e.target.closest && e.target.closest('.mainnav__split');
      if (!li || !window.matchMedia('(hover: hover)').matches) return;
      clearTimeout(hoverTimer); setHoverMenu(li, true);
    });
    document.addEventListener('mouseout', function (e) {
      const li = e.target.closest && e.target.closest('.mainnav__split');
      if (!li || (e.relatedTarget && li.contains(e.relatedTarget))) return;
      clearTimeout(hoverTimer); hoverTimer = setTimeout(function () { setHoverMenu(li, false); }, 180);
    });
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      const open = document.querySelector('[data-action="menu"][aria-expanded="true"]');
      if (open) { closeMenus(); open.focus(); }
    });
    window.addEventListener('hashchange', render);
    KBR.bus.on('library:change', function () { ui.syncSaveButtons(); });
    KBR.bus.on('subscription:change', function () { if (!/^#\/platnosc/.test(currentHash())) render(); });
    KBR.demo.init();
    render();
  }

  return { init: init, render: render, navigate: navigate };
})();

document.addEventListener('DOMContentLoaded', KBR.app.init);
