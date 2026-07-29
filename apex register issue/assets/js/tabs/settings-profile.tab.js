// Settings → Profile: fill from window.CP_USER, open change-password modal
window.CP_tabs = window.CP_tabs || {};
window.CP_onViewShow = window.CP_onViewShow || {};

(function () {
  function $(sel) {
    return document.querySelector(sel);
  }

  function initials(u) {
    const f = (u.firstName || '').trim();
    const l = (u.lastName || '').trim();
    let s = '';
    if (f) s += f.charAt(0).toUpperCase();
    if (l) s += l.charAt(0).toUpperCase();
    if (s) return s;
    const em = (u.email || '').trim();
    if (em) {
      const local = em.split('@')[0] || em;
      return local.slice(0, 2).toUpperCase() || '—';
    }
    return '—';
  }

  function fullName(u) {
    const f = (u.firstName || '').trim();
    const l = (u.lastName || '').trim();
    const n = [f, l].filter(Boolean).join(' ');
    return n || '';
  }

  function populate() {
    const u = window.CP_USER;
    if (!u) return;

    const av = $('#profAvatar');
    const nm = $('#profDisplayName');
    const emHero = $('#profHeroEmail');
    const emRow = $('#profEmailRow');
    const fullRow = $('#profFullNameRow');
    const uidEl = $('#profUserId');
    const subEl = $('#profSubId');
    const subWrap = $('#profSubWrap');

    const email = (u.email || '').trim() || '—';
    const display = fullName(u) || email;
    const nameForCard = fullName(u) || '—';

    if (av) av.textContent = initials(u);
    if (nm) nm.textContent = display;
    if (emHero) emHero.textContent = email;
    if (emRow) emRow.textContent = email;
    if (fullRow) fullRow.textContent = nameForCard;
    if (uidEl) uidEl.textContent = u.userId != null && u.userId !== '' ? String(u.userId) : '—';

    if (subWrap && subEl) {
      const sid = u.subId;
      if (sid != null && String(sid).trim() !== '') {
        subWrap.hidden = false;
        subEl.textContent = String(sid);
      } else {
        subWrap.hidden = true;
      }
    }
  }

  function openChangePassword() {
    const el = document.getElementById('changePassModal');
    if (!el || typeof bootstrap === 'undefined') return;
    bootstrap.Modal.getOrCreateInstance(el).show();
  }

  function wireOnce() {
    const btn = $('#profBtnChangePass');
    if (!btn || btn.dataset.profWired === '1') return;
    btn.dataset.profWired = '1';
    btn.addEventListener('click', openChangePassword);
  }

  window.CP_tabs['settings-profile'] = function () {
    populate();
    wireOnce();
  };

  window.CP_onViewShow['settings-profile'] = function () {
    populate();
  };
})();
