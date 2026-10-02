/* Rejestracja, logowanie, odzyskanie hasła. Po sukcesie użytkownik wraca do miejsca,
   z którego rozpoczął (artykuł, zakup), a odłożona akcja (np. zapis) wykonuje się automatycznie. */
(function () {
  const ui = KBR.ui, F = KBR.forms, I = KBR.icon, esc = ui.esc, C = KBR.content;

  function contextBox() {
    const pending = KBR.flow.peekPending();
    const ret = KBR.flow.peekReturn() || '';
    if (pending && pending.type === 'save') {
      const m = C.get(pending.id);
      if (m) return '<div class="context-box"><img src="' + ui.img(m.image) + '" alt=""><div><span class="t-label">Po zalogowaniu zapiszemy w bibliotece</span><strong>' + esc(m.title) + '</strong></div></div>';
    }
    if (ret.indexOf('#/zamowienie') === 0) {
      const d = KBR.checkout.get(); const p = d && KBR.subscription.plan(d.planId);
      if (p) return '<div class="context-box" style="grid-template-columns:1fr"><div><span class="t-label">Kontynuujesz zakup subskrypcji</span><strong>' + esc(p.name) + ' · ' + ui.money(KBR.checkout.amount(d)) + ' / ' + KBR.config.periods[d.period].unit + '</strong></div></div>';
    }
    const am = ret.match(/^#\/artykul\/([^?]+)/);
    if (am && C.get(am[1])) { const m = C.get(am[1]); return '<div class="context-box"><img src="' + ui.img(m.image) + '" alt=""><div><span class="t-label">Po zalogowaniu wrócisz do</span><strong>' + esc(m.title) + '</strong></div></div>'; }
    return '';
  }

  function side() {
    return '<aside class="auth-side" aria-labelledby="h-benefits"><h2 id="h-benefits">Bezpłatne konto KBR</h2><ul>' +
      '<li>' + I('check', 18) + 'Zapisuj artykuły, studia przypadków i podcasty w Mojej bibliotece</li>' +
      '<li>' + I('check', 18) + 'Wracaj do ostatnio czytanych materiałów na każdym urządzeniu</li>' +
      '<li>' + I('check', 18) + 'Wybieraj newslettery i tematy, które Cię interesują</li>' +
      '<li>' + I('check', 18) + 'Kup subskrypcję, gdy potrzebujesz pełnego dostępu do treści Premium</li></ul>' +
      '<p class="notice notice--demo" style="margin-top:24px">' + I('info', 18) + '<span>Prototyp: konta są symulowane w przeglądarce. Hasła nie są zapisywane ani weryfikowane, a wiadomości e-mail nie są wysyłane.</span></p></aside>';
  }

  /* Wspólne dokończenie po zalogowaniu / rejestracji */
  function afterAuth(user, isNew) {
    const pending = KBR.flow.takePending();
    let ret = KBR.flow.takeReturn() || '#/';
    if (/^#\/(logowanie|rejestracja|reset-hasla)/.test(ret)) ret = '#/';
    let msg = isNew ? 'Konto zostało utworzone. Witaj, ' + esc(user.firstName || user.email) + '!' : 'Zalogowano jako ' + esc(user.email) + '.';
    if (pending && pending.type === 'save' && C.get(pending.id)) {
      KBR.library.save(pending.id);
      msg = (isNew ? 'Konto zostało utworzone, a ' : '') + (isNew ? 'materiał' : 'Materiał') + ' „' + esc(C.get(pending.id).title) + '” zapisano w Twojej bibliotece. <a href="#/konto/biblioteka">Przejdź do biblioteki</a>';
      if (!/^#\/artykul\//.test(ret)) ret = '#/artykul/' + pending.id;
    }
    if (pending && pending.type === 'follow' && C.topic(pending.id)) {
      KBR.follow.toggle(pending.id, true);
      msg = (isNew ? 'Konto zostało utworzone. ' : '') + 'Obserwujesz temat „' + esc(C.topic(pending.id).name) + '”. <a href="#/konto/biblioteka?zakladka=tematy">Przejdź do biblioteki</a>';
    }
    KBR.app.navigate(ret);
    setTimeout(function () { ui.toast(msg, { kind: 'success', timeout: 9000 }); }, 60);
  }

  function bindPwToggles(root) {
    root.querySelectorAll('input[type="password"][id]').forEach(function (inp) {
      const rules = root.querySelector('#' + inp.id + '-rules');
      if (!rules) return;
      inp.addEventListener('input', function () {
        const v = inp.value;
        rules.querySelector('[data-rule="len"]').dataset.ok = String(v.length >= KBR.config.password.minLength);
        rules.querySelector('[data-rule="mix"]').dataset.ok = String(/[0-9]/.test(v) && /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(v));
      });
    });
  }

  KBR.pages.register = function () {
    if (KBR.auth.currentUser()) return KBR.pages.redirect('#/konto/biblioteka');
    const html = '<div class="container auth-wrap"><div class="auth-card">' +
      ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Rejestracja' }]) +
      '<h1 style="margin-top:20px">Załóż bezpłatne konto</h1><p class="intro">Zajmie to mniej niż minutę. Masz już konto? <a class="link" href="#/logowanie">Zaloguj się</a></p>' + contextBox() +
      '<form id="register-form" novalidate>' +
        '<div class="field"><label for="reg-name">Imię</label><input class="input" id="reg-name" name="firstName" autocomplete="given-name" required></div>' +
        '<div class="field"><label for="reg-email">Adres e-mail</label><input class="input" id="reg-email" name="email" type="email" autocomplete="email" inputmode="email" required></div>' +
        F.passwordField('reg-password', 'Hasło', { autocomplete: 'new-password', rules: true }) +
        '<div class="consents"><div class="group"><h2>Wymagane</h2>' +
          '<label class="check" for="reg-terms"><input type="checkbox" id="reg-terms" name="terms" required><span>Akceptuję <a href="#/strona/regulamin-serwisu" target="_blank">Regulamin serwisu</a> i zapoznałam/em się z <a href="#/strona/polityka-prywatnosci" target="_blank">Polityką prywatności</a>. <span class="demo-tag">Treść do zatwierdzenia</span></span></label></div>' +
          '<div class="group"><h2>Opcjonalne</h2>' +
          '<label class="check" for="reg-newsletter"><input type="checkbox" id="reg-newsletter" name="newsletter"><span>Chcę otrzymywać cotygodniowy newsletter KBR.</span></label>' +
          '<label class="check" for="reg-marketing"><input type="checkbox" id="reg-marketing" name="marketing"><span>Chcę otrzymywać informacje o wydarzeniach i ofercie edukacyjnej Akademii Leona Koźmińskiego.</span></label></div></div>' +
        '<button class="btn btn--primary" type="submit">Załóż bezpłatne konto' + I('chevRight', 16, 'stroke-width="2"') + '</button>' +
      '</form><p class="alt">Masz już konto? <a href="#/logowanie">Zaloguj się</a></p></div>' + side() + '</div>';
    return { title: 'Rejestracja – KBR', html: html, mount: function (root) {
      bindPwToggles(root);
      const form = root.querySelector('#register-form');
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const ok = F.validate(form, [
          { id: 'reg-name', check: F.v.required('imię') },
          { id: 'reg-email', check: F.v.email },
          { id: 'reg-password', check: F.v.password },
          { id: 'reg-terms', check: F.v.checked('Zaakceptuj Regulamin serwisu, aby założyć konto.') }
        ]);
        if (!ok) return;
        const btn = form.querySelector('[type="submit"]'); F.busy(btn, true, 'Tworzenie konta…');
        try {
          const user = await KBR.auth.register({ firstName: form.firstName.value, email: form.email.value, newsletter: form.newsletter.checked, marketing: form.marketing.checked });
          form.querySelector('#reg-password').value = '';   // hasło nie jest nigdzie przechowywane
          afterAuth(user, true);
        } catch (err) { F.busy(btn, false); F.serverError(form, err.field === 'email' ? 'reg-email' : null, err.message); }
      });
    } };
  };

  KBR.pages.login = function () {
    if (KBR.auth.currentUser()) return KBR.pages.redirect(KBR.flow.takeReturn() || '#/konto/biblioteka');
    const html = '<div class="container auth-wrap"><div class="auth-card">' +
      ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Logowanie' }]) +
      '<h1 style="margin-top:20px">Zaloguj się</h1><p class="intro">Nie masz konta? <a class="link" href="#/rejestracja">Załóż bezpłatne konto</a></p>' + contextBox() +
      '<form id="login-form" novalidate>' +
        '<div class="field"><label for="login-email">Adres e-mail</label><input class="input" id="login-email" name="email" type="email" autocomplete="email" inputmode="email" required></div>' +
        F.passwordField('login-password', 'Hasło', { autocomplete: 'current-password' }) +
        '<p style="margin-top:12px;font-size:14px"><a class="link" href="#/reset-hasla">Nie pamiętasz hasła?</a></p>' +
        '<button class="btn btn--primary" type="submit">Zaloguj się' + I('chevRight', 16, 'stroke-width="2"') + '</button>' +
      '</form><p class="alt">Nie masz konta? <a href="#/rejestracja">Załóż bezpłatne konto</a></p>' +
      '<p class="alt" style="font-size:14px">Dostęp firmowy lub akademicki? <a href="#/dostep/firmy">Dostęp dla firm</a> · <a href="#/dostep/akademicki">Dostęp akademicki</a></p></div>' + side() + '</div>';
    return { title: 'Logowanie – KBR', html: html, mount: function (root) {
      const form = root.querySelector('#login-form');
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const ok = F.validate(form, [{ id: 'login-email', check: F.v.email }, { id: 'login-password', check: function (v) { return v ? null : 'Wpisz hasło.'; } }]);
        if (!ok) return;
        const btn = form.querySelector('[type="submit"]'); F.busy(btn, true, 'Logowanie…');
        try { const user = await KBR.auth.login({ email: form.email.value }); form.querySelector('#login-password').value = ''; afterAuth(user, false); }
        catch (err) { F.busy(btn, false); F.serverError(form, null, err.message + ' Sprawdź dane albo załóż konto.'); }
      });
    } };
  };

  KBR.pages.resetRequest = function (route) {
    const sent = route.query.wyslano === '1';
    const html = '<div class="container auth-wrap"><div class="auth-card">' +
      ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Logowanie', href: '#/logowanie' }, { label: 'Odzyskanie dostępu' }]) +
      '<h1 style="margin-top:20px">Odzyskaj dostęp</h1>' +
      (sent
        ? '<div class="notice notice--success" role="status" style="margin-top:24px">' + I('checkCircle', 20) + '<div><strong>Sprawdź skrzynkę e-mail.</strong><br>Jeśli konto o podanym adresie istnieje, wysłaliśmy link do ustawienia nowego hasła. Link jest ważny przez określony czas (do ustalenia).</div></div>' +
          '<div class="notice notice--demo" style="margin-top:16px">' + I('info', 18) + '<div>Prototyp nie wysyła wiadomości. Użyj przycisku poniżej, aby zasymulować kliknięcie linku z e-maila.</div></div>' +
          '<div class="btn-row" style="margin-top:24px"><a class="btn btn--primary" href="#/reset-hasla/nowe">Symulacja: otwórz link z wiadomości</a><a class="btn btn--ghost" href="#/logowanie">Wróć do logowania</a></div>'
        : '<p class="intro">Podaj adres e-mail przypisany do konta. Wyślemy link do ustawienia nowego hasła.</p>' +
          '<form id="reset-form" novalidate><div class="field"><label for="reset-email">Adres e-mail</label><input class="input" id="reset-email" type="email" autocomplete="email" required></div>' +
          '<button class="btn btn--primary" type="submit">Wyślij link</button></form><p class="alt"><a href="#/logowanie">Wróć do logowania</a></p>') +
      '</div>' + side() + '</div>';
    return { title: 'Odzyskanie dostępu – KBR', html: html, mount: function (root) {
      const form = root.querySelector('#reset-form'); if (!form) return;
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!F.validate(form, [{ id: 'reset-email', check: F.v.email }])) return;
        const btn = form.querySelector('[type="submit"]'); F.busy(btn, true, 'Wysyłanie…');
        await KBR.auth.requestPasswordReset(form.querySelector('#reset-email').value);
        KBR.app.navigate('#/reset-hasla?wyslano=1');
      });
    } };
  };

  KBR.pages.resetNew = function (route) {
    const done = route.query.gotowe === '1';
    const html = '<div class="container auth-wrap"><div class="auth-card">' +
      ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: 'Logowanie', href: '#/logowanie' }, { label: 'Nowe hasło' }]) +
      '<h1 style="margin-top:20px">' + (done ? 'Hasło zostało zmienione' : 'Ustaw nowe hasło') + '</h1>' +
      (done ? '<div class="notice notice--success" role="status" style="margin-top:24px">' + I('checkCircle', 20) + '<div>Możesz teraz zalogować się, używając nowego hasła.</div></div><div class="btn-row" style="margin-top:24px"><a class="btn btn--primary" href="#/logowanie">Przejdź do logowania</a></div>'
        : '<form id="newpw-form" novalidate>' + F.passwordField('new-password', 'Nowe hasło', { autocomplete: 'new-password', rules: true }) +
          F.passwordField('new-password2', 'Powtórz nowe hasło', { autocomplete: 'new-password' }) +
          '<button class="btn btn--primary" type="submit">Zapisz nowe hasło</button></form>') +
      '</div>' + side() + '</div>';
    return { title: 'Nowe hasło – KBR', html: html, mount: function (root) {
      bindPwToggles(root);
      const form = root.querySelector('#newpw-form'); if (!form) return;
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const ok = F.validate(form, [{ id: 'new-password', check: F.v.password }, { id: 'new-password2', check: function (v) { return v === form.querySelector('#new-password').value ? null : 'Hasła nie są takie same.'; } }]);
        if (!ok) return;
        await KBR.auth.completePasswordReset();
        form.reset(); KBR.app.navigate('#/reset-hasla/nowe?gotowe=1');
      });
    } };
  };
})();
