/* Walidacja formularzy: błędy przy polach + podsumowanie na górze formularza. */
KBR.forms = (function () {
  const ui = KBR.ui;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const v = {
    required: function (label) { return function (val) { return String(val || '').trim() ? null : 'Podaj ' + label + '.'; }; },
    email: function (val) {
      if (!String(val || '').trim()) return 'Podaj adres e-mail.';
      return emailRe.test(String(val).trim()) ? null : 'Wpisz adres e-mail w formacie nazwa@domena.pl.';
    },
    password: function (val) {
      const min = KBR.config.password.minLength;
      if (!val) return 'Utwórz hasło.';
      if (val.length < min) return 'Hasło musi mieć co najmniej ' + min + ' znaków.';
      if (!/[0-9]/.test(val) || !/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(val)) return 'Hasło musi zawierać co najmniej jedną literę i jedną cyfrę.';
      return null;
    },
    checked: function (msg) { return function (val, el) { return el.checked ? null : msg; }; },
    nip: function (val) {
      const d = String(val || '').replace(/[\s-]/g, '');
      if (!d) return 'Podaj NIP firmy.';
      if (!/^\d{10}$/.test(d)) return 'NIP powinien składać się z 10 cyfr.';
      return null; /* prototyp: bez sprawdzania sumy kontrolnej */
    },
    postal: function (val) { return /^\d{2}-\d{3}$/.test(String(val || '').trim()) ? null : 'Wpisz kod pocztowy w formacie 00-000.'; }
  };

  function clear(form) {
    form.querySelectorAll('.field-error').forEach(function (e) { e.remove(); });
    form.querySelectorAll('[aria-invalid]').forEach(function (e) {
      e.removeAttribute('aria-invalid');
      const ids = (e.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x.indexOf('-error') === -1; });
      if (ids.length) e.setAttribute('aria-describedby', ids.join(' ')); else e.removeAttribute('aria-describedby');
    });
    const sum = form.querySelector('.form-errors'); if (sum) sum.remove();
  }

  function setError(el, msg) {
    const id = el.id;
    el.setAttribute('aria-invalid', 'true');
    const described = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    described.push(id + '-error');
    el.setAttribute('aria-describedby', described.join(' '));
    const anchor = el.closest('[data-error-anchor]') || el.closest('.check') || el.closest('.input-wrap') || el;
    anchor.insertAdjacentHTML('afterend', ui.fieldError(id, msg));
  }

  /* rules: [{ id, check }] ; zwraca true gdy formularz jest poprawny */
  function validate(form, rules, opts) {
    opts = opts || {};
    clear(form);
    const errors = [];
    rules.forEach(function (r) {
      const el = form.querySelector('#' + r.id);
      if (!el || el.closest('[hidden]')) return;
      const msg = r.check(el.type === 'checkbox' ? el.checked : el.value, el);
      if (msg) { errors.push({ el: el, msg: msg }); setError(el, msg); }
    });
    if (errors.length) {
      if (errors.length > 1 || opts.summary) {
        const html = '<div class="notice notice--error form-errors" role="alert" tabindex="-1">' + KBR.icon('alert', 18) +
          '<div><strong>Popraw ' + (errors.length === 1 ? '1 pole' : errors.length + (errors.length < 5 ? ' pola' : ' pól')) + ' formularza:</strong><ul>' +
          errors.map(function (e) { return '<li><a href="#' + e.el.id + '" data-focus="' + e.el.id + '">' + ui.esc(e.msg) + '</a></li>'; }).join('') + '</ul></div></div>';
        form.insertAdjacentHTML('afterbegin', html);
        const box = form.querySelector('.form-errors');
        box.addEventListener('click', function (ev) { const a = ev.target.closest('[data-focus]'); if (a) { ev.preventDefault(); document.getElementById(a.dataset.focus).focus(); } });
        box.focus();
      } else {
        errors[0].el.focus();
      }
      return false;
    }
    return true;
  }

  function serverError(form, field, msg) {
    const el = field ? form.querySelector('#' + field) : null;
    if (el) { setError(el, msg); el.focus(); return; }
    form.insertAdjacentHTML('afterbegin', '<div class="notice notice--error form-errors" role="alert" tabindex="-1">' + KBR.icon('alert', 18) + '<div>' + ui.esc(msg) + '</div></div>');
    form.querySelector('.form-errors').focus();
  }

  function busy(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.innerHTML = '<span>' + (label || 'Proszę czekać…') + '</span>'; }
    else { btn.disabled = false; btn.removeAttribute('aria-busy'); if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
  }

  /* Pole hasła z podglądem */
  function passwordField(id, label, opts) {
    opts = opts || {};
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      (opts.hint ? '<p class="hint" id="' + id + '-hint">' + opts.hint + '</p>' : '') +
      '<div class="input-wrap"><input class="input" type="password" id="' + id + '" name="' + id + '" autocomplete="' + (opts.autocomplete || 'current-password') + '"' + (opts.hint ? ' aria-describedby="' + id + '-hint"' : '') + ' required>' +
      '<button type="button" class="pw-toggle" data-action="toggle-pw" data-target="' + id + '" aria-pressed="false" aria-controls="' + id + '">' + KBR.icon('eye', 18) + '<span>Pokaż</span><span class="visually-hidden"> hasło</span></button></div>' +
      (opts.rules ? '<ul class="pw-rules" id="' + id + '-rules" aria-live="polite"><li data-rule="len">' + KBR.icon('check', 14) + 'co najmniej ' + KBR.config.password.minLength + ' znaków</li><li data-rule="mix">' + KBR.icon('check', 14) + 'litera i cyfra</li></ul>' : '') +
      '</div>';
  }

  return { v: v, validate: validate, clear: clear, serverError: serverError, busy: busy, passwordField: passwordField };
})();
