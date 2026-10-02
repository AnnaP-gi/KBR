/* Narzędzia demonstracyjne – poza główną nawigacją serwisu.
   Pozwalają przełączyć stan (gość / konto bez subskrypcji / subskrybent),
   zmienić limit bezpłatnych materiałów i zresetować dane. */
KBR.demo = (function () {
  const I = KBR.icon, ui = KBR.ui;

  function stateLabel() {
    const u = KBR.auth.currentUser();
    if (!u) return 'Gość (niezalogowany)';
    return (KBR.subscription.isActive(u) ? 'Aktywny subskrybent' : 'Konto bez subskrypcji') + ' – ' + ui.esc(u.email);
  }

  function open() {
    const meter = KBR.access.meterState();
    const d = document.createElement('dialog');
    d.className = 'demo';
    d.setAttribute('aria-labelledby', 'demo-title');
    d.innerHTML = '<div class="demo__head"><h2 id="demo-title">Narzędzia demo</h2><p>Panel testowy prototypu. Nie jest częścią projektu serwisu.</p></div>' +
      '<button type="button" class="modal__close" data-close aria-label="Zamknij narzędzia demo">' + I('close', 22) + '</button>' +
      '<div class="demo__body">' +
        '<div><h3>Bieżący stan</h3><p class="demo__state" id="demo-state">' + stateLabel() + '</p></div>' +
        '<div><h3>Przełącz stan</h3><div class="demo__grid">' +
          '<button type="button" class="btn btn--outline" data-demo="guest">' + I('userPlain', 18) + 'Gość (wyloguj)</button>' +
          '<button type="button" class="btn btn--outline" data-demo="free">' + I('bookmark', 18) + 'Konto bez subskrypcji</button>' +
          '<button type="button" class="btn btn--outline" data-demo="sub">' + I('unlock', 18) + 'Aktywny subskrybent (plan Cyfrowy)</button></div>' +
          '<p style="margin-top:8px;font-size:12px;color:var(--c-muted)">Konto testowe: ' + ui.esc(KBR.config.demoAccount.email) + '. Biblioteka konta jest zachowywana przy przełączaniu.</p></div>' +
        '<div><h3>Limit bezpłatnych materiałów (założenie)</h3><form class="demo__row" id="demo-meter"><label for="demo-limit">Limit / miesiąc</label><input class="input" id="demo-limit" type="number" min="0" max="20" value="' + meter.limit + '"><button class="btn btn--outline" type="submit">Zastosuj</button></form>' +
          '<p style="margin-top:6px;font-size:12px;color:var(--c-muted)">Wykorzystano: ' + meter.used + '. 0 = licznik wyłączony.</p>' +
          '<button type="button" class="btn btn--ghost" data-demo="meter-reset" style="margin-top:4px">Wyzeruj licznik</button></div>' +
        '<div><h3>Szybkie przejścia</h3><div class="demo__grid">' +
          '<a class="btn btn--ghost" href="#/artykul/ai-zdolnosc-organizacyjna" data-close>Artykuł Premium</a>' +
          '<a class="btn btn--ghost" href="#/artykul/gmina-plan-ogolny" data-close>Artykuł otwarty</a>' +
          '<a class="btn btn--ghost" href="#/artykul/nowy-kontrakt-lidera" data-close>Artykuł w ramach limitu</a></div></div>' +
        '<div><h3>Dane</h3><button type="button" class="btn btn--primary" data-demo="reset">Resetuj wszystkie dane demo</button></div>' +
      '</div>';
    document.body.appendChild(d);
    const opener = document.activeElement;
    d.addEventListener('close', function () { d.remove(); if (opener && document.contains(opener)) opener.focus(); });
    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('[data-close]')) { d.close(); return; }
      const b = e.target.closest('[data-demo]'); if (!b) return;
      const a = b.dataset.demo;
      if (a === 'guest') { KBR.auth.logout(); ui.toast('Stan demo: gość.'); }
      if (a === 'free') { KBR.auth.demoSignIn(KBR.config.demoAccount); KBR.subscription.demoClear(); ui.toast('Stan demo: konto bez subskrypcji.'); }
      if (a === 'sub') { KBR.auth.demoSignIn(KBR.config.demoAccount); KBR.subscription.demoActivate('cyfrowy'); ui.toast('Stan demo: aktywny subskrybent.'); }
      if (a === 'meter-reset') { KBR.access.resetMeter(); ui.toast('Licznik bezpłatnych materiałów wyzerowany.'); }
      if (a === 'reset') { KBR.resetDemo(); ui.toast('Dane demo zostały zresetowane.'); d.close(); KBR.app.navigate('#/'); return; }
      d.querySelector('#demo-state').textContent = stateLabel().replace(/&amp;/g, '&');
      KBR.app.render();
    });
    d.querySelector('#demo-meter').addEventListener('submit', function (e) {
      e.preventDefault(); KBR.access.setMeterLimit(d.querySelector('#demo-limit').value); ui.toast('Limit ustawiony na ' + KBR.access.meterLimit() + '.'); KBR.app.render();
    });
    d.showModal();
  }

  function init() {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'demo-fab'; b.innerHTML = I('wrench', 16) + '<span class="lbl">Narzędzia demo</span>';
    b.addEventListener('click', open);
    document.body.appendChild(b);
  }
  return { init: init, open: open };
})();
