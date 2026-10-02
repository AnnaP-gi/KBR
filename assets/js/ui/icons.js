/* Ikony liniowe (stroke 1.5) zgodne ze stylem projektu. */
KBR.icon = (function () {
  const P = {
    search: '<circle cx="11" cy="10" r="6.25"/><path d="M6.5 14.5 3 18"/>',
    globe: '<circle cx="12" cy="12" r="8.25"/><path d="M4.5 9.5c2 .5 3 1.8 3.2 3.4.2 1.5 1.3 2 2.3 2.4.9.4 1 1.6.6 3.2M14.5 4.2c-.6 1.3-.3 2.4 1 2.9 1.4.5 1.4 1.8.9 2.7-.5 1 .2 2.2 1.4 2.4 1 .2 2 .9 2.4 1.8"/>',
    user: '<circle cx="11" cy="8" r="3.75"/><path d="M4.5 19.25c.6-3.4 3.2-5.5 6.5-5.5 1.3 0 2.5.3 3.5.9M16 17.25h5M18.5 14.75l-2.5 2.5 2.5 2.5"/>',
    userPlain: '<circle cx="12" cy="8" r="3.75"/><path d="M4.75 19.5c.7-3.6 3.6-5.75 7.25-5.75s6.55 2.15 7.25 5.75"/>',
    chevRight: '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    chevLeft: '<path d="M15 5.5 8.5 12 15 18.5"/>',
    arrowRight: '<path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5"/>',
    lock: '<rect x="5.25" y="10.25" width="13.5" height="10" rx="1.5"/><path d="M8 10.25V7.5a4 4 0 0 1 8 0v2.75M12 14v2.5"/>',
    unlock: '<rect x="5.25" y="10.25" width="13.5" height="10" rx="1.5"/><path d="M8 10.25V7.5a4 4 0 0 1 7.7-1.5M12 14v2.5"/>',
    calendar: '<rect x="3.75" y="5.25" width="16.5" height="15" rx="1.5"/><path d="M3.75 9.75h16.5M8 3.25v4M16 3.25v4"/><path d="M7.5 13h1M11.5 13h1M15.5 13h1M7.5 16.5h1M11.5 16.5h1M15.5 16.5h1" stroke-width="2"/>',
    pin: '<path d="M12 20.75s6.25-5.4 6.25-10.5a6.25 6.25 0 1 0-12.5 0c0 5.1 6.25 10.5 6.25 10.5z"/><circle cx="12" cy="10.25" r="2.25"/>',
    bookmark: '<path d="M6.75 3.75h10.5v16.5L12 16.5l-5.25 3.75z"/>',
    bookmarkFill: '<path d="M6.75 3.75h10.5v16.5L12 16.5l-5.25 3.75z" fill="currentColor"/>',
    share: '<circle cx="17.5" cy="5.75" r="2.25"/><circle cx="6.5" cy="12" r="2.25"/><circle cx="17.5" cy="18.25" r="2.25"/><path d="m8.5 10.9 7-4M8.5 13.1l7 4"/>',
    check: '<path d="m4.75 12.5 4.5 4.5 10-10"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.25"/><path d="m8.25 12.25 2.5 2.5 5-5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    dash: '<path d="M6 12h12"/>',
    eye: '<path d="M2.75 12S6.25 5.75 12 5.75 21.25 12 21.25 12 17.75 18.25 12 18.25 2.75 12 2.75 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M4 4l16 16M9.9 6.1c.7-.2 1.4-.35 2.1-.35 5.75 0 9.25 6.25 9.25 6.25a17 17 0 0 1-2.6 3.3M6.4 7.6A16.5 16.5 0 0 0 2.75 12S6.25 18.25 12 18.25c1.5 0 2.8-.4 4-1M10 10a3 3 0 0 0 4 4"/>',
    alert: '<circle cx="12" cy="12" r="8.25"/><path d="M12 7.75v5M12 15.75v.5"/>',
    info: '<circle cx="12" cy="12" r="8.25"/><path d="M12 11v5M12 7.75v.5"/>',
    newspaper: '<path d="M5.25 4.75h11.5v14.5a1.5 1.5 0 0 1-1.5 1.5H5a1.75 1.75 0 0 1-1.75-1.75V9.25h2M16.75 9.25h3.5v10a1.5 1.5 0 0 1-3 0"/><path d="M8 8.25h5.5M8 11.75h5.5M8 15.25h5.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    clock: '<circle cx="12" cy="12" r="8.25"/><path d="M12 7.5V12l3 2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
    mail: '<rect x="3.75" y="5.75" width="16.5" height="12.5" rx="1.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
    external: '<path d="M13.5 4.75h5.75v5.75M19.25 4.75 11 13M17.25 13.5v5.25a1.5 1.5 0 0 1-1.5 1.5h-10a1.5 1.5 0 0 1-1.5-1.5v-10a1.5 1.5 0 0 1 1.5-1.5H11"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-8 8a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5 17 4l3 3-2.5 2.5"/>',
    logout: '<path d="M14 4.75H6.25a1.5 1.5 0 0 0-1.5 1.5v11.5a1.5 1.5 0 0 0 1.5 1.5H14M10 12h10.25M16.5 8.25 20.25 12l-3.75 3.75"/>',
    card: '<rect x="3.25" y="5.75" width="17.5" height="12.5" rx="1.5"/><path d="M3.25 9.75h17.5"/>',
    building: '<path d="M4.75 20.25V5.25l8-2v17M12.75 8.25l6.5 2v10M3 20.25h18M8 8v.5M8 11.5v.5M8 15v.5M16 13v.5M16 16.5v.5"/>',
    cap: '<path d="M2.75 9.5 12 5l9.25 4.5L12 14z"/><path d="M6.5 11.5v4.25c1.5 1.5 3.5 2.25 5.5 2.25s4-.75 5.5-2.25V11.5M21.25 9.5v5"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5.5h3v13H8zM13.5 5.5h3v13h-3z" fill="currentColor" stroke="none"/>'
  };
  return function (name, size, extra) {
    size = size || 20;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' + (extra ? ' ' + extra : '') + '>' + (P[name] || '') + '</svg>';
  };
})();
