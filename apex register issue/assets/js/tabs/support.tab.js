// Support tab — Contacts, Tickets, Meetings (session-backed API proxies)
window.CP_tabs = window.CP_tabs || {};
window.CP_onViewShow = window.CP_onViewShow || {};

(function () {
  const LIST = 'api/support/tickets_list.php';
  const GET = 'api/support/ticket_get.php';
  const CREATE = 'api/support/ticket_create.php';
  const COMMENT = 'api/support/ticket_comment.php';
  const PATCH = 'api/support/ticket_patch.php';
  const DEPT_API = 'api/support/ticket_departments.php';
  const MEET_LIST = 'api/support/meetings_list.php';
  const MEET_CREATE = 'api/support/meeting_create.php';
  const MEET_SLOTS = 'api/support/meeting_time_slots.php';
  const MEET_DELETE = 'api/support/meeting_delete.php';
  const MEET_UPDATE = 'api/support/meeting_update.php';
  /** Meetings table: short preview in cell (no table horizontal scroll); full text in tooltip / Preview. */
  const MEET_DESC_PREVIEW_LEN_NARROW = 48;
  /** Slightly more only at 1440px+; still conservative so the row fits without a horizontal scrollbar. */
  const MEET_DESC_PREVIEW_LEN_WIDE = 64;

  function meetDescPreviewLimit() {
    if (typeof window.matchMedia !== 'function') return MEET_DESC_PREVIEW_LEN_NARROW;
    return window.matchMedia('(min-width: 1440px)').matches
      ? MEET_DESC_PREVIEW_LEN_WIDE
      : MEET_DESC_PREVIEW_LEN_NARROW;
  }

  /** Optional label for default department UUID (display only). */
  const DEPT_LABELS = {
    '01cbe2c0-0e16-45e7-8f2b-e7e4e2836aaf': 'test department'
  };

  let tickets = [];
  /** Ticket departments from GET clientzone/lead/ticket/department */
  let departments = [];
  let meetings = [];
  /** Meetings table pagination (client-side slice of loaded list). */
  let meetingPage = 1;
  const MEETINGS_PAGE_SIZE = 10;
  let expandedId = null;
  let ticketDetails = {};

  /** Meetings: schedule modal */
  let meetEditId = null;
  let meetCalView = null;
  let meetSelectedDate = null;
  let meetCancelId = null;

  /** Tickets list pagination (open / closed each paginated separately via filter) */
  let ticketPage = 1;
  const TICKETS_PAGE_SIZE = 10;
  /** Last total used by ticket pager (for resize refresh; does not replace live pagination logic). */
  let lastTicketsPagerTotal = 0;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function disposeTicketTooltips(container) {
    if (!container || typeof bootstrap === 'undefined') return;
    container.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      const inst = bootstrap.Tooltip.getInstance(el);
      if (inst) inst.dispose();
    });
  }

  function initTicketTooltips(container) {
    if (!container || typeof bootstrap === 'undefined') return;
    container.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      new bootstrap.Tooltip(el, {
        container: 'body',
        customClass: 'sup-ticket-tooltip',
        delay: { show: 200, hide: 80 },
        html: false,
        trigger: 'hover focus'
      });
    });
  }

  function disposeMeetingTableTooltips(tbody) {
    if (!tbody || typeof bootstrap === 'undefined') return;
    tbody.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      const inst = bootstrap.Tooltip.getInstance(el);
      if (inst) inst.dispose();
    });
  }

  function initMeetingTableTooltips(tbody) {
  if (!tbody || typeof bootstrap === 'undefined') return;
  // Select ALL elements with data-bs-toggle="tooltip", not just truncated ones
  tbody.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    // Dispose existing tooltip if any
    const existingInst = bootstrap.Tooltip.getInstance(el);
    if (existingInst) existingInst.dispose();
    
    // Create new tooltip
    new bootstrap.Tooltip(el, {
      container: 'body',
      customClass: 'sup-meet-desc-tooltip',
      delay: { show: 180, hide: 60 },
      html: false,
      trigger: 'hover focus'
    });
  });
}

  /** Toggle class for fade hint + ensure layout after fonts (horizontal strip may overflow). */
  function updateTicketMetaScrollOverflow() {
    const list = $('#supTicketsList');
    if (!list) return;
    list.querySelectorAll('.sup-ticket-head-meta-scroll').forEach((el) => {
      const overflow = el.scrollWidth > el.clientWidth + 1;
      el.classList.toggle('sup-ticket-head-meta-scroll--overflow', overflow);
    });
  }

  /**
   * Stable id for GET clientzone/lead/ticket/{id}. Backend expects the user-ticket id
   * (Postman: root id === userTicketComments[0].userTicketId). List payloads may put a
   * different uuid in `id` (e.g. comment id), so prefer userTicketId first.
   */
  function ticketRecordId(t) {
    if (!t || typeof t !== 'object') return '';
    const c0 = Array.isArray(t.userTicketComments) && t.userTicketComments[0] ? t.userTicketComments[0] : null;
    const fromComment = c0 && c0.userTicketId != null && c0.userTicketId !== '' ? String(c0.userTicketId).trim() : '';
    const nested = t.userTicket && typeof t.userTicket === 'object' && t.userTicket.id ? String(t.userTicket.id).trim() : '';
    const v =
      (t.userTicketId != null && t.userTicketId !== '' ? String(t.userTicketId).trim() : '') ||
      (t.ticketId != null && t.ticketId !== '' ? String(t.ticketId).trim() : '') ||
      (t.userTicketID != null && t.userTicketID !== '' ? String(t.userTicketID).trim() : '') ||
      fromComment ||
      (t.id != null && t.id !== '' ? String(t.id).trim() : '') ||
      (t.Id != null && t.Id !== '' ? String(t.Id).trim() : '') ||
      nested;
    return v;
  }

  /** Ensure root userTicketId is set when list only has it on comments (helps GET + keys). */
  function normalizeTicketRow(t) {
    if (!t || typeof t !== 'object') return t;
    const c0 = Array.isArray(t.userTicketComments) && t.userTicketComments[0] ? t.userTicketComments[0] : null;
    const ut = c0 && c0.userTicketId ? String(c0.userTicketId).trim() : '';
    if (ut && !t.userTicketId) t.userTicketId = ut;
    return t;
  }

  function initials() {
    const u = window.CP_USER;
    if (!u) return '—';
    const f = (u.firstName || '').trim();
    const l = (u.lastName || '').trim();
    let t = '';
    if (f) t += f.charAt(0).toUpperCase();
    if (l) t += l.charAt(0).toUpperCase();
    if (t) return t;
    const em = (u.email || '').trim();
    if (em) return em.split('@')[0].slice(0, 2).toUpperCase();
    return '—';
  }

  function formatDt(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return escapeHtml(String(iso));
    const pad = (n) => String(n).padStart(2, '0');
    /* NBSP so date + time stay on one line in ticket headers */
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}\u00A0${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function formatYMD(d) {
    if (!d || Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function formatLongMeeting(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return escapeHtml(String(iso));
    return d.toLocaleString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatOrdinalDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = d.getDate();
    const k = day % 100;
    const j = day % 10;
    let ord = 'th';
    if (j === 1 && k !== 11) ord = 'st';
    else if (j === 2 && k !== 12) ord = 'nd';
    else if (j === 3 && k !== 13) ord = 'rd';
    return day + ord + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function parseSlotStart(slotStr) {
    const m = normalizeSlotLabel(slotStr).match(/^(\d{1,2}):(\d{2})/);
    if (!m) return null;
    return { h: parseInt(m[1], 10), mi: parseInt(m[2], 10) };
  }

  function normalizeSlotLabel(slotStr) {
    return String(slotStr || '')
      .replace(/\u2013/g, '-')
      .replace(/\u2014/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseSlotRange(slotStr) {
    const m = normalizeSlotLabel(slotStr).match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const sh = parseInt(m[1], 10);
    const sm = parseInt(m[2], 10);
    const eh = parseInt(m[3], 10);
    const em = parseInt(m[4], 10);
    const start = sh * 60 + sm;
    let end = eh * 60 + em;
    if (end < start) end += 24 * 60;
    return { start, end, span: end - start };
  }

  function minutesToHHMM(total) {
    const h = Math.floor(total / 60) % 24;
    const mi = total % 60;
    return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
  }

  /** API may use isDisabled, disabled, available, etc. */
  function slotIsDisabled(s) {
    if (s == null || typeof s !== 'object') return false;
    if (s.isDisabled === true || s.disabled === true) return true;
    if (s.isDisabled === false || s.disabled === false) return false;
    if (s.available === false) return true;
    if (s.isBooked === true || s.booked === true) return true;
    const a = s.isDisabled;
    if (typeof a === 'string') {
      const t = a.toLowerCase();
      return t === 'true' || t === '1' || t === 'yes';
    }
    const d = s.disabled;
    if (typeof d === 'string') {
      const t = d.toLowerCase();
      return t === 'true' || t === '1' || t === 'yes';
    }
    return false;
  }

  function applySlotSelection(slotEl, preferPrefix) {
    if (!slotEl || slotEl.options.length <= 1) return;
    if (preferPrefix) {
      for (let i = 1; i < slotEl.options.length; i++) {
        const o = slotEl.options[i];
        if (o.value && o.value.indexOf(preferPrefix) === 0 && !o.disabled) {
          slotEl.selectedIndex = i;
          return;
        }
      }
    }
    for (let i = 1; i < slotEl.options.length; i++) {
      const o = slotEl.options[i];
      if (o.value && !o.disabled) {
        slotEl.selectedIndex = i;
        return;
      }
    }
    slotEl.selectedIndex = 0;
  }

  /** Reference hourly list: last start is 21:00 (21:00 - 22:00); no 21:30+ starts */
  const HOURLY_LAST_START_MIN = 21 * 60;

  /**
   * Build reference-style 1-hour options from 30-minute API rows (sliding pairs).
   * Same labels as Chakra: 00:00 - 01:00, 00:30 - 01:30, …, 21:00 - 22:00
   */
  function normalizeSlotsForHourly(slots) {
    if (!Array.isArray(slots) || slots.length < 2) return slots;
    const v0 = normalizeSlotLabel(slotObjectToLabel(slots[0]));
    const r0 = parseSlotRange(v0);
    if (r0 && r0.span === 60) return trimHourlySlotsToReference(slots);

    const out = [];
    for (let i = 0; i < slots.length - 1; i++) {
      const a = slots[i];
      const b = slots[i + 1];
      const va = normalizeSlotLabel(slotObjectToLabel(a));
      const vb = normalizeSlotLabel(slotObjectToLabel(b));
      const ra = parseSlotRange(va);
      const rb = parseSlotRange(vb);
      if (!ra || !rb || ra.span !== 30 || rb.span !== 30) continue;
      if (ra.end !== rb.start) continue;
      if (ra.start > HOURLY_LAST_START_MIN) continue;
      const disabled = slotIsDisabled(a) || slotIsDisabled(b);
      const combined = minutesToHHMM(ra.start) + ' - ' + minutesToHHMM(rb.end);
      out.push({ key: combined, value: combined, isDisabled: disabled });
    }
    return out.length ? out : slots;
  }

  function trimHourlySlotsToReference(slots) {
    if (!Array.isArray(slots)) return slots;
    return slots.filter((s) => {
      const v = normalizeSlotLabel(s.value != null ? s.value : s.key);
      const r = parseSlotRange(v);
      if (!r || r.span !== 60) return true;
      return r.start <= HOURLY_LAST_START_MIN;
    });
  }

  function slotObjectToLabel(s) {
    if (s == null) return '';
    if (typeof s === 'string') return s;
    if (typeof s === 'object') {
      if (s.value != null) return String(s.value);
      if (s.key != null) return String(s.key);
      if (s.label != null) return String(s.label);
      if (s.from != null && s.to != null) return `${s.from} - ${s.to}`;
    }
    return '';
  }

  function sortSlotsByStartTime(slots) {
    if (!Array.isArray(slots)) return slots;
    return [...slots].sort((a, b) => {
      const va = parseSlotRange(normalizeSlotLabel(slotObjectToLabel(a)));
      const vb = parseSlotRange(normalizeSlotLabel(slotObjectToLabel(b)));
      if (!va || !vb) return 0;
      return va.start - vb.start;
    });
  }

  /** For the selected calendar day: disable slot if its start time is already in the past (today only). */
  function applyPastTimeDisabling(slots, day) {
    if (!Array.isArray(slots) || !day) return slots;
    const now = new Date();
    const d0 = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (d0.getTime() !== t0.getTime()) return slots;

    return slots.map((s) => {
      const val = normalizeSlotLabel(slotObjectToLabel(s));
      const t = parseSlotStart(val);
      if (!t) return s;
      const slotStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), t.h, t.mi, 0, 0);
      const inPast = slotStart.getTime() < now.getTime();
      const apiOff = slotIsDisabled(s);
      return Object.assign({}, s, { value: val, key: val, isDisabled: inPast || apiOff });
    });
  }

  function combineDateAndSlot(day, slotValue) {
    const t = parseSlotStart(slotValue);
    if (!t || !day) return null;
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), t.h, t.mi, 0, 0);
  }

  function deptLabel(id) {
    if (!id) return '—';
    const d = departments.find((x) => String(x.id) === String(id));
    if (d) {
      const n = d.name || (d.localization && d.localization.en && d.localization.en.name);
      if (n) return String(n);
    }
    return DEPT_LABELS[id] || id.slice(0, 8) + '…';
  }

  function ticketStatusBadgeClass(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'new') return 'sup-ticket-status sup-ticket-status--new';
    if (s === 'closed') return 'sup-ticket-status sup-ticket-status--closed';
    return 'sup-ticket-status sup-ticket-status--default';
  }

  async function loadDepartments() {
    try {
      const res = await fetch(DEPT_API, { credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Could not load departments');
      }
      departments = Array.isArray(data.data) ? data.data : [];
      const sel = $('#supNewDepartment');
      if (sel) {
        const prev = sel.value;
        sel.innerHTML = '<option value="">Select A department</option>';
        departments.forEach((d) => {
          const opt = document.createElement('option');
          opt.value = d.id;
          opt.textContent =
            d.name || (d.localization && d.localization.en && d.localization.en.name) || d.id;
          sel.appendChild(opt);
        });
        if (prev && departments.some((x) => String(x.id) === String(prev))) {
          sel.value = prev;
        }
      }
    } catch (e) {
      departments = [];
      console.warn('[support] departments:', e);
    }
  }

  function isClosed(t) {
    const s = String(t.status || '').toLowerCase();
    return s === 'closed';
  }

  function ticketCreatedMs(t) {
    const raw = t && (t.createdAt || t.created || t.updatedAt);
    const d = raw ? new Date(raw) : new Date(0);
    const ms = d.getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }

  function sortTicketsNewestFirst(arr) {
    arr.sort((a, b) => ticketCreatedMs(b) - ticketCreatedMs(a));
  }

  function showGlobal(msg, kind) {
    const el = $('#supGlobalMsg');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.remove('d-none', 'sup-msg--ok', 'sup-msg--err');
    if (!msg) {
      el.classList.add('d-none');
      return;
    }
    el.classList.add(kind === 'err' ? 'sup-msg--err' : 'sup-msg--ok');
  }

  function clearScheduleModalMsg() {
    const el = $('#supSchedFormMsg');
    if (!el) return;
    el.textContent = '';
    el.classList.add('d-none');
    el.classList.remove('sup-msg--ok', 'sup-msg--err');
  }

  /** Errors / validation for schedule flow — shown inside #supModalSchedule, not only #supGlobalMsg. */
  function showScheduleModalMsg(msg, kind) {
    const el = $('#supSchedFormMsg');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.remove('d-none', 'sup-msg--ok', 'sup-msg--err');
    if (!msg) {
      el.classList.add('d-none');
      return;
    }
    el.classList.add(kind === 'err' ? 'sup-msg--err' : 'sup-msg--ok');
    if (msg && kind === 'err') {
      requestAnimationFrame(() => {
        try {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } catch (e) {
          /* ignore */
        }
      });
    }
  }

  function setContactsMailto() {
    const a = $('#supMailtoCard');
    if (!a) return;
    const email = 'support@apexaiexperts.com';
    a.href = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('Support request');
  }

  function setActiveTab(name) {
    document.querySelectorAll('.sup-tab').forEach((btn) => {
      const on = btn.dataset.supTab === name;
      btn.classList.toggle('sup-tab--active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    const panels = {
      contacts: $('#supPanelContacts'),
      tickets: $('#supPanelTickets'),
      meetings: $('#supPanelMeetings')
    };
    Object.keys(panels).forEach((key) => {
      const p = panels[key];
      if (!p) return;
      const show = key === name;
      p.classList.toggle('d-none', !show);
      p.hidden = !show;
    });
  }

  async function loadTickets(opts) {
    const keepPage = opts && opts.keepPage === true;
    const loading = $('#supTicketsLoading');
    const empty = $('#supTicketsEmpty');
    const listEl = $('#supTicketsList');
    if (loading) loading.classList.remove('d-none');
    if (empty) empty.classList.add('d-none');
    if (listEl) listEl.innerHTML = '';

    try {
      const res = await fetch(LIST, { credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Could not load tickets');
      }
      tickets = Array.isArray(data.data) ? data.data.map(normalizeTicketRow) : [];
      sortTicketsNewestFirst(tickets);
      ticketDetails = {};
      if (!keepPage) ticketPage = 1;
      renderTickets();
    } catch (e) {
      showGlobal(e.message || 'Failed to load tickets', 'err');
      tickets = [];
      if (!keepPage) ticketPage = 1;
      renderTickets();
    } finally {
      if (loading) loading.classList.add('d-none');
    }
  }

  function goToTicketPage(id) {
    const all = filteredTickets();
    const idx = all.findIndex((t) => ticketRecordId(t) === String(id));
    if (idx < 0) {
      ticketPage = 1;
      return;
    }
    const totalPages = Math.max(1, Math.ceil(all.length / TICKETS_PAGE_SIZE));
    ticketPage = Math.min(Math.floor(idx / TICKETS_PAGE_SIZE) + 1, totalPages);
  }

  /** Legacy ticket pager windowing (replaced by CP_compactPaginationHtml); kept if shared script fails to load. */
  function buildTicketPaginationItems(current, total, compact, narrow) {
    if (total <= 1) {
      return total === 1 ? [1] : [];
    }
    if (narrow && total > 7) {
      const e = 'ellipsis';
      const cur = current;
      const last = total;
      if (cur === 1) {
        return last > 1 ? [1, e, last] : [1];
      }
      if (cur === last) {
        return [1, e, last];
      }
      if (cur === 2) {
        return [1, 2, e, last];
      }
      if (cur === last - 1) {
        return [1, e, last - 1, last];
      }
      if (cur === 3) {
        return [1, 2, 3, e, last];
      }
      if (cur === last - 2) {
        return [1, e, last - 2, last - 1, last];
      }
      if (cur <= 4) {
        return [1, 2, 3, e, last];
      }
      if (cur === last - 3) {
        return [1, e, last - 3, e, last];
      }
      return [1, e, cur, e, last];
    }
    if (total <= 9) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const r = compact ? 1 : 2;
    const items = [];
    items.push(1);
    let start = Math.max(2, current - r);
    let end = Math.min(total - 1, current + r);
    if (current <= 4) {
      start = 2;
      end = compact ? Math.min(4, total - 1) : Math.min(6, total - 1);
    }
    if (current >= total - 3) {
      start = Math.max(2, total - (compact ? 4 : 5));
      end = total - 1;
    }
    if (start > 2) items.push('ellipsis');
    for (let i = start; i <= end; i++) {
      items.push(i);
    }
    if (end < total - 1) items.push('ellipsis');
    if (items[items.length - 1] !== total) items.push(total);
    return items;
  }

  function renderTicketsPager(totalCount) {
    const pager = $('#supTicketsPager');
    if (!pager) return;
    const totalPages = Math.max(1, Math.ceil(totalCount / TICKETS_PAGE_SIZE) || 1);
    if (ticketPage > totalPages) ticketPage = totalPages;
    if (ticketPage < 1) ticketPage = 1;

    if (totalCount <= TICKETS_PAGE_SIZE) {
      pager.classList.add('d-none');
      pager.innerHTML = '';
      lastTicketsPagerTotal = 0;
      return;
    }

    const from = (ticketPage - 1) * TICKETS_PAGE_SIZE + 1;
    const to = Math.min(ticketPage * TICKETS_PAGE_SIZE, totalCount);
    pager.classList.remove('d-none');
    let pagesHtml = '';
    if (typeof window.CP_compactPaginationHtml === 'function') {
      pagesHtml = window.CP_compactPaginationHtml(totalCount, ticketPage, TICKETS_PAGE_SIZE, 'sup-page').html;
    } else {
      const mm =
        typeof window !== 'undefined' && window.matchMedia
          ? window.matchMedia.bind(window)
          : null;
      const narrow = mm ? mm('(max-width: 768px)').matches : false;
      const compact = mm ? mm('(max-width: 766px)').matches : false;
      const pageItems = buildTicketPaginationItems(ticketPage, totalPages, compact, narrow);
      pageItems.forEach((item) => {
        if (item === 'ellipsis') {
          pagesHtml += '<span class="dash-page-ellipsis" aria-hidden="true">…</span>';
          return;
        }
        const p = item;
        pagesHtml += `<button type="button" class="dash-page-btn${p === ticketPage ? ' is-active' : ''}" data-sup-page="${p}">${p}</button>`;
      });
      pagesHtml = `
          <button type="button" class="dash-page-btn dash-page-btn--arrow" data-sup-page="prev" ${ticketPage <= 1 ? 'disabled' : ''} aria-label="Previous">&lt;</button>
          ${pagesHtml}
          <button type="button" class="dash-page-btn dash-page-btn--arrow" data-sup-page="next" ${ticketPage >= totalPages ? 'disabled' : ''} aria-label="Next">&gt;</button>`;
    }
    pager.innerHTML = `
      <div class="dash-pagination sup-tickets-dpagination" role="navigation" aria-label="Ticket list pages">
        <span class="sup-tickets-pageinfo text-muted small">Showing ${from}–${to} of ${totalCount}</span>
        <div class="sup-tickets-pagebtns">${pagesHtml}</div>
      </div>`;
    lastTicketsPagerTotal = totalCount;
  }

  function renderMeetingsPager(totalCount) {
    const pager = $('#supMeetPager');
    if (!pager) return;
    const totalPages = Math.max(1, Math.ceil(totalCount / MEETINGS_PAGE_SIZE) || 1);
    if (meetingPage > totalPages) meetingPage = totalPages;
    if (meetingPage < 1) meetingPage = 1;

    if (totalCount <= MEETINGS_PAGE_SIZE) {
      pager.classList.add('d-none');
      pager.innerHTML = '';
      return;
    }

    const from = (meetingPage - 1) * MEETINGS_PAGE_SIZE + 1;
    const to = Math.min(meetingPage * MEETINGS_PAGE_SIZE, totalCount);
    pager.classList.remove('d-none');
    let pagesHtml = '';
    if (typeof window.CP_compactPaginationHtml === 'function') {
      pagesHtml = window.CP_compactPaginationHtml(totalCount, meetingPage, MEETINGS_PAGE_SIZE, 'meet-page').html;
    } else {
      const mm =
        typeof window !== 'undefined' && window.matchMedia
          ? window.matchMedia.bind(window)
          : null;
      const narrow = mm ? mm('(max-width: 768px)').matches : false;
      const compact = mm ? mm('(max-width: 766px)').matches : false;
      const pageItems = buildTicketPaginationItems(meetingPage, totalPages, compact, narrow);
      pageItems.forEach((item) => {
        if (item === 'ellipsis') {
          pagesHtml += '<span class="dash-page-ellipsis" aria-hidden="true">…</span>';
          return;
        }
        const p = item;
        pagesHtml += `<button type="button" class="dash-page-btn${p === meetingPage ? ' is-active' : ''}" data-meet-page="${p}">${p}</button>`;
      });
      pagesHtml = `
          <button type="button" class="dash-page-btn dash-page-btn--arrow" data-meet-page="${meetingPage <= 1 ? 1 : meetingPage - 1}" ${meetingPage <= 1 ? 'disabled' : ''} aria-label="Previous">&lt;</button>
          ${pagesHtml}
          <button type="button" class="dash-page-btn dash-page-btn--arrow" data-meet-page="${meetingPage >= totalPages ? totalPages : meetingPage + 1}" ${meetingPage >= totalPages ? 'disabled' : ''} aria-label="Next">&gt;</button>`;
    }
    pager.innerHTML = `
      <div class="dash-pagination sup-tickets-dpagination" role="navigation" aria-label="Meeting list pages">
        <span class="sup-tickets-pageinfo text-muted small">Showing ${from}–${to} of ${totalCount}</span>
        <div class="sup-tickets-pagebtns">${pagesHtml}</div>
      </div>`;
  }

  async function ensureTicketDetail(id) {
    const sid = id != null ? String(id).trim() : '';
    if (!sid) return null;
    if (ticketDetails[sid] && ticketDetails[sid].userTicketComments) {
      return ticketDetails[sid];
    }
    const fromList = tickets.find((x) => ticketRecordId(x) === sid);
    if (
      fromList &&
      Array.isArray(fromList.userTicketComments) &&
      fromList.userTicketComments.length > 0
    ) {
      ticketDetails[sid] = Object.assign({}, fromList);
      return ticketDetails[sid];
    }
    try {
      const res = await fetch(GET + '?id=' + encodeURIComponent(sid), { credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === 'error') {
        return null;
      }
      const row = data.data ? normalizeTicketRow(data.data) : null;
      if (row) {
        const canon = ticketRecordId(row) || sid;
        ticketDetails[sid] = row;
        if (canon !== sid) ticketDetails[canon] = row;
      }
      return row;
    } catch {
      return null;
    }
  }

  function currentFilter() {
    const r = document.querySelector('input[name="supTicketFilter"]:checked');
    return r && r.value === 'closed' ? 'closed' : 'open';
  }

  function filteredTickets() {
    const f = currentFilter();
    return tickets.filter((t) => (f === 'closed' ? isClosed(t) : !isClosed(t)));
  }

  function renderTickets() {
    const empty = $('#supTicketsEmpty');
    const listEl = $('#supTicketsList');
    if (!listEl) return;

    const all = filteredTickets();
    const totalCount = all.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / TICKETS_PAGE_SIZE) || 1);
    if (ticketPage > totalPages) ticketPage = totalPages;
    if (ticketPage < 1) ticketPage = 1;

    const start = (ticketPage - 1) * TICKETS_PAGE_SIZE;
    const rows = all.slice(start, start + TICKETS_PAGE_SIZE);

    if (expandedId && !rows.some((x) => ticketRecordId(x) === String(expandedId))) {
      expandedId = null;
    }
    if (empty) empty.classList.toggle('d-none', totalCount > 0);

    renderTicketsPager(totalCount);

    disposeTicketTooltips(listEl);

    listEl.innerHTML = rows
      .map((t) => {
        const id = ticketRecordId(t);
        if (!id) return '';
        const open = expandedId === id;
        const cat = escapeHtml(t.category || '—');
        const title = escapeHtml(t.title || 'Ticket');
        const titleTip = escapeHtml(String(t.title || 'Ticket'));
        const created = formatDt(t.createdAt);
        const stRaw = t.status || '—';
        const st = escapeHtml(stRaw);
        const dept = escapeHtml(deptLabel(t.departmentId));
        const metaTip = escapeHtml(
          `Category: ${String(t.category || '—')} · Department: ${deptLabel(t.departmentId)}`
        );
        const stClass = ticketStatusBadgeClass(stRaw);
        return `
          <div class="sup-ticket${open ? ' sup-ticket--open' : ''}" data-ticket-id="${escapeHtml(id)}">
            <div class="sup-ticket-head" role="button" tabindex="0" data-action="toggle-ticket" data-id="${escapeHtml(
              id
            )}" aria-expanded="${open ? 'true' : 'false'}">
              <div class="sup-ticket-head-left">
                <span class="${stClass}" aria-label="Status">${st}</span>
                <i class="bi bi-chat-dots sup-ticket-icon" aria-hidden="true"></i>
                <div class="sup-ticket-title-row">
                  <span class="sup-ticket-title" data-bs-toggle="tooltip" data-bs-placement="top" title="${titleTip}">${title}</span>
                  <span class="sup-ticket-date">${created}</span>
                </div>
              </div>
              <div class="sup-ticket-head-right">
                <div class="sup-ticket-head-meta" aria-label="${metaTip}">
                  <div class="sup-ticket-head-meta-scroll">
                    <div class="sup-ticket-head-meta-inner">
                      <span class="sup-ticket-kv-label">Category:</span>
                      <span class="sup-ticket-kv-badge sup-ticket-kv-badge--cat">${cat}</span>
                      <span class="sup-ticket-kv-label">Department:</span>
                      <span class="sup-ticket-kv-badge sup-ticket-kv-badge--dept">${dept}</span>
                    </div>
                  </div>
                </div>
                <i class="bi bi-chevron-down sup-ticket-chevron" aria-hidden="true"></i>
              </div>
            </div>
            <div class="sup-ticket-body" data-thread="${escapeHtml(id)}"></div>
          </div>`;
      })
      .join('');

    initTicketTooltips(listEl);
    requestAnimationFrame(() => {
      updateTicketMetaScrollOverflow();
      setTimeout(updateTicketMetaScrollOverflow, 120);
    });

    rows.forEach((t) => {
      const id = ticketRecordId(t);
      if (id && expandedId === id) {
        renderThread(id, t);
      }
    });
  }

  function sortComments(comments) {
    if (!Array.isArray(comments)) return [];
    return [...comments].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return ta - tb;
    });
  }

  /** True if comment is from the logged-in user (handles alternate API field names). */
  function commentIsMine(c) {
    if (!c || typeof c !== 'object') return false;
    if (c.isAgent === true || c.isStaff === true || c.fromAgent === true || c.fromSupport === true) return false;
    if (c.isClient === true || c.isUser === true || c.fromUser === true) return true;
    const uid =
      window.CP_USER && window.CP_USER.userId != null ? String(window.CP_USER.userId).trim() : '';
    if (!uid) return false;
    const ids = [c.userId, c.userID, c.user_id, c.createdByUserId, c.authorUserId].filter(
      (x) => x != null && x !== ''
    );
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i]).trim() === uid) return true;
    }
    return false;
  }

  function renderThread(ticketId, ticketFallback) {
    const body = document.querySelector('[data-thread="' + ticketId + '"]');
    if (!body) return;

    const detail = ticketDetails[ticketId] || ticketFallback;
    const comments = sortComments(detail.userTicketComments || []);

    const bubbles = comments
      .map((c) => {
        const mine = commentIsMine(c);
        const text = escapeHtml(c.text || '');
        const ts = formatDt(c.createdAt);
        const av = mine ? escapeHtml(initials()) : 'A';
        return `
          <div class="sup-msg${mine ? ' sup-msg--user' : ' sup-msg--agent'}">
            <div class="sup-msg-av" aria-hidden="true">${av}</div>
            <div class="sup-msg-col">
              <div class="sup-msg-bubble">
                <div class="sup-msg-text">${text}</div>
                <div class="sup-msg-time"><i class="bi bi-clock" aria-hidden="true"></i> ${ts}</div>
              </div>
            </div>
          </div>`;
      })
      .join('');

    const closed = isClosed(detail);
    const replyBlock = closed
      ? '<p class="small text-muted mb-0">This ticket is closed.</p>'
      : `
        <div class="sup-reply">
          <label class="sup-field mb-0">
            <span>Reply</span>
            <textarea class="sup-textarea sup-reply-text" rows="2" placeholder="Type your message" data-ticket-id="${escapeHtml(ticketId)}"></textarea>
          </label>
          <div class="sup-reply-actions">
            <button type="button" class="sup-btn-primary sup-btn-send" data-id="${escapeHtml(ticketId)}">Send</button>
            <button type="button" class="sup-btn-danger sup-btn-close-ticket" data-id="${escapeHtml(ticketId)}">Close ticket</button>
          </div>
        </div>`;

    body.innerHTML = `<div class="sup-thread">${bubbles || '<p class="small text-muted">No messages yet.</p>'}</div>${replyBlock}`;
  }

  async function toggleTicket(id) {
    const sid = id != null ? String(id) : '';
    if (expandedId === sid) {
      expandedId = null;
    } else {
      expandedId = sid;
      const t = tickets.find((x) => ticketRecordId(x) === sid);
      const detail = await ensureTicketDetail(sid);
      if (detail) {
        ticketDetails[sid] = Object.assign({}, t || {}, detail);
      } else if (t) {
        ticketDetails[sid] = t;
      }
    }
    renderTickets();
  }

  async function sendComment(ticketId) {
    const ta = document.querySelector('textarea.sup-reply-text[data-ticket-id="' + ticketId + '"]');
    const text = (ta && ta.value) ? ta.value.trim() : '';
    if (!text) {
      showGlobal('Please enter a message.', 'err');
      return;
    }
    showGlobal('', 'ok');
    try {
      const res = await fetch(COMMENT, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userTicketId: ticketId })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to send');
      }
      if (ta) ta.value = '';
      delete ticketDetails[ticketId];
      await loadTickets({ keepPage: true });
      expandedId = ticketId;
      goToTicketPage(ticketId);
      const d = await ensureTicketDetail(ticketId);
      if (d) ticketDetails[ticketId] = d;
      renderTickets();
      showGlobal('Message sent.', 'ok');
      setTimeout(() => showGlobal('', 'ok'), 2500);
    } catch (e) {
      showGlobal(e.message || 'Failed to send', 'err');
    }
  }

  async function closeTicket(ticketId) {
    if (!window.confirm('Close this ticket? You can still view it under Closed tickets.')) return;
    showGlobal('', 'ok');
    try {
      const res = await fetch(PATCH + '?id=' + encodeURIComponent(ticketId), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Closed' })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to close ticket');
      }
      expandedId = null;
      showGlobal('Ticket closed.', 'ok');
      setTimeout(() => showGlobal('', 'ok'), 2500);
      await loadTickets();
    } catch (e) {
      showGlobal(e.message || 'Failed to close', 'err');
    }
  }

  async function submitNewTicket(e) {
  e.preventDefault();
  const title = ($('#supNewTitle') && $('#supNewTitle').value.trim()) || '';
  const initialMessage = ($('#supNewBody') && $('#supNewBody').value.trim()) || '';
  const category = ($('#supNewCategory') && $('#supNewCategory').value) || '';
  const btn = $('#supNewSubmit');
  
  // Validate category is selected
  if (!category) {
    showModalError('supModalNewTicket', 'Please select a ticket type');
    return;
  }
  
  // Remove any existing error message
  const existingError = document.querySelector('#supModalNewTicket .sup-modal-error');
  if (existingError) existingError.remove();
  
  if (btn) btn.disabled = true;
  
  try {
    const res = await fetch(CREATE, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, initialMessage, category })
    });
    const data = await res.json();
    if (!res.ok || data.status === 'error') {
      throw new Error(data.message || 'Failed to create ticket');
    }
    const modalEl = document.getElementById('supModalNewTicket');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const inst = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
      inst.hide();
    }
    e.target.reset();
    const catSel = $('#supNewCategory');
    const depSel = $('#supNewDepartment');
    if (catSel) catSel.selectedIndex = 0;
    if (depSel) depSel.selectedIndex = 0;
    showGlobal('Ticket created.', 'ok');
    setTimeout(() => showGlobal('', 'ok'), 3000);
    await loadTickets();
  } catch (err) {
    // Show error inside the modal
    showModalError('supModalNewTicket', err.message || 'Error creating ticket');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// Helper function to show errors inside modal
function showModalError(modalId, errorMessage) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Remove existing error message
  const existingError = modal.querySelector('.sup-modal-error');
  if (existingError) existingError.remove();
  
  // Find the form or modal body
  const form = modal.querySelector('#supFormNewTicket');
  const modalBody = modal.querySelector('.modal-body');
  const targetElement = form || modalBody;
  
  if (targetElement) {
    // Create error alert
    const errorDiv = document.createElement('div');
    errorDiv.className = 'sup-modal-error alert alert-danger alert-dismissible fade show';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>${escapeHtml(errorMessage)}</span>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    
    // Insert at the top of the target
    targetElement.insertBefore(errorDiv, targetElement.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (errorDiv && errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
}

  function meetingStatusCanceled(m) {
    const s = String(m.status || '').toLowerCase();
    return s === 'canceled' || s === 'cancelled';
  }

  /** Plain-language status (table + preview badge). */
  function meetingStatusPlainLabel(m) {
    const canceled = meetingStatusCanceled(m);
    const raw = m.status != null && String(m.status).trim() !== '' ? String(m.status).trim() : '';
    const norm = raw.toLowerCase().replace(/\s+/g, '_');
    if (canceled) return 'Canceled';
    if (!raw) return 'Scheduled';
    if (norm === 'pending' || norm === 'awaiting' || norm === 'requested') return 'Pending';
    if (norm === 'confirmed' || norm === 'approved' || norm === 'active') return 'Confirmed';
    if (norm === 'completed' || norm === 'done') return 'Completed';
    return raw
      .replace(/[_-]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  /** Colored pill for meetings table row. */
  function meetingStatusLabelHtml(m) {
    const label = meetingStatusPlainLabel(m);
    const canceled = meetingStatusCanceled(m);
    const raw = m.status != null && String(m.status).trim() !== '' ? String(m.status).trim() : '';
    const norm = raw.toLowerCase().replace(/\s+/g, '_');
    const pillClass = canceled
      ? 'sup-meet-status-pill sup-meet-status-pill--muted'
      : norm === 'pending' || norm === 'awaiting' || norm === 'requested' || !raw
        ? 'sup-meet-status-pill sup-meet-status-pill--pending'
        : 'sup-meet-status-pill sup-meet-status-pill--live';
    return `<span class="${pillClass}">${escapeHtml(label)}</span>`;
  }

  function renderMeetingsTable() {
  const tbody = $('#supMeetTableBody');
  const empty = $('#supMeetEmpty');
  const wrap = $('#supMeetTableWrap');
  if (!tbody) return;

  const sorted = [...meetings].sort((a, b) => {
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return tb - ta;
  });

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / MEETINGS_PAGE_SIZE) || 1);
  if (meetingPage > totalPages) meetingPage = totalPages;
  if (meetingPage < 1) meetingPage = 1;
  const start = (meetingPage - 1) * MEETINGS_PAGE_SIZE;
  const pageRows = sorted.slice(start, start + MEETINGS_PAGE_SIZE);

  if (empty) empty.classList.toggle('d-none', totalCount > 0);
  if (wrap) wrap.classList.toggle('d-none', totalCount === 0);

  renderMeetingsPager(totalCount);

  disposeMeetingTableTooltips(tbody);

  tbody.innerHTML = pageRows
    .map((m) => {
      const id = escapeHtml(m.id || '');
      const canceled = meetingStatusCanceled(m);
      const stHtml = meetingStatusLabelHtml(m);
      const created = formatLongMeeting(m.createdAt);
      const createdTitle = escapeHtml(created);
      const descRaw = m.description != null ? String(m.description) : '';
      const descLim = meetDescPreviewLimit();
      let descCell = '—';
      
      if (descRaw.trim()) {
        const tip = escapeHtml(descRaw);
        // ALWAYS add tooltip if there's any description content
        const shortPlain = descRaw.length <= descLim 
          ? descRaw 
          : descRaw.slice(0, descLim - 1).trimEnd();
        const short = escapeHtml(shortPlain) + (descRaw.length <= descLim ? '' : '…');
        
        // Always create tooltip span, even for short text
        descCell = `<span class="sup-meet-desc-truncate" tabindex="0" data-bs-toggle="tooltip" data-bs-placement="top" title="${tip}">${short}</span>`;
      }
      
      const actions = canceled
        ? `<div class="sup-meet-actions">
        <button type="button" class="sup-btn-action" data-action="meet-preview" data-id="${id}"><i class="bi bi-eye"></i> Preview</button>
      </div>`
        : `<div class="sup-meet-actions">
        <button type="button" class="sup-btn-action" data-action="meet-reschedule" data-id="${id}"><i class="bi bi-calendar3"></i> Change date</button>
        <button type="button" class="sup-btn-action sup-btn-action--danger" data-action="meet-cancel" data-id="${id}"><i class="bi bi-x-lg"></i> Cancel</button>
        <button type="button" class="sup-btn-action" data-action="meet-preview" data-id="${id}"><i class="bi bi-eye"></i> Preview</button>
      </div>`;
      return `<tr>
        <td class="sup-meet-col-status">${stHtml}</td>
        <td class="sup-meet-col-date" title="${createdTitle}">${escapeHtml(created)}</td>
        <td class="sup-meet-desc">${descCell}</td>
        <td class="sup-meet-col-actions">${actions}</td>
      </tr>`;
    })
    .join('');

  requestAnimationFrame(() => initMeetingTableTooltips(tbody));
}

  async function loadMeetings() {
    const loading = $('#supMeetLoading');
    const tbody = $('#supMeetTableBody');
    if (loading) loading.classList.remove('d-none');
    if (tbody) tbody.innerHTML = '';

    try {
      const res = await fetch(MEET_LIST, { credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Could not load meetings');
      }
      meetings = Array.isArray(data.data) ? data.data : [];
      meetingPage = 1;
      renderMeetingsTable();
    } catch (e) {
      showGlobal(e.message || 'Failed to load meetings', 'err');
      meetings = [];
      meetingPage = 1;
      renderMeetingsTable();
    } finally {
      if (loading) loading.classList.add('d-none');
    }
  }

  function updateMeetSelectedLabel() {
    const el = $('#supMeetSelectedLabel');
    if (!el || !meetSelectedDate) return;
    const noon = new Date(
      meetSelectedDate.getFullYear(),
      meetSelectedDate.getMonth(),
      meetSelectedDate.getDate(),
      12,
      0,
      0
    );
    el.textContent = formatOrdinalDate(noon.toISOString());
  }

  function renderCalendar() {
    const grid = $('#supCalGrid');
    const label = $('#supCalMonthLabel');
    if (!grid || !meetCalView) return;

    const y = meetCalView.getFullYear();
    const mo = meetCalView.getMonth();
    if (label) {
      label.textContent = meetCalView.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    }

    const first = new Date(y, mo, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells = [];
    for (let i = 0; i < startPad; i++) {
      cells.push('<div class="sup-cal-day sup-cal-day--muted"></div>');
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(y, mo, d);
      const isEditSameDay =
        meetEditId &&
        meetSelectedDate &&
        dayDate.getFullYear() === meetSelectedDate.getFullYear() &&
        dayDate.getMonth() === meetSelectedDate.getMonth() &&
        dayDate.getDate() === meetSelectedDate.getDate();
      const isPast = dayDate < today && !isEditSameDay;
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
      const isToday =
        dayDate.getFullYear() === today.getFullYear() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getDate() === today.getDate();
      const isSel =
        meetSelectedDate &&
        meetSelectedDate.getFullYear() === y &&
        meetSelectedDate.getMonth() === mo &&
        meetSelectedDate.getDate() === d;
      let cls = 'sup-cal-day';
      if (isWeekend) cls += ' sup-cal-day--weekend';
      if (isToday) cls += ' sup-cal-day--today';
      if (isSel) cls += ' sup-cal-day--selected';
      const dis = isPast ? ' disabled' : '';
      cells.push(
        `<button type="button" class="${cls}" data-cal-day="${d}"${dis}>${d}</button>`
      );
    }
    grid.innerHTML = cells.join('');

    grid.querySelectorAll('button[data-cal-day]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = parseInt(btn.getAttribute('data-cal-day'), 10);
        meetSelectedDate = new Date(y, mo, d);
        renderCalendar();
        updateMeetSelectedLabel();
        loadTimeSlots();
      });
    });
  }

  async function loadTimeSlots(selectValue) {
    const slotEl = $('#supSchedSlot');
    const durEl = $('#supSchedDuration');
    if (!slotEl || !meetSelectedDate) return;
    const dur = durEl ? parseInt(durEl.value, 10) || 30 : 30;
    /** Backend often returns the same 30-min list for both 30 and 60; merge needs that grid. */
    const apiDuration = dur === 60 ? 30 : dur;
    const ymd = formatYMD(meetSelectedDate);
    slotEl.innerHTML = '<option value="">Loading…</option>';
    slotEl.disabled = true;
    try {
      const res = await fetch(
        MEET_SLOTS + '?date=' + encodeURIComponent(ymd) + '&duration=' + encodeURIComponent(apiDuration),
        { credentials: 'same-origin' }
      );
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Could not load time slots');
      }
      let slots = Array.isArray(data.data) ? data.data : [];
      if (!slots.length && data.data && typeof data.data === 'object') {
        slots = Object.values(data.data);
      }
      slots = slots.map((row) =>
        typeof row === 'string' ? { key: row, value: row, isDisabled: false } : row
      );

      const wantsOneHour = parseInt(String(durEl && durEl.value), 10) === 60;

      if (wantsOneHour) {
        slots = sortSlotsByStartTime(slots);
        slots = normalizeSlotsForHourly(slots);
      } else {
        slots = sortSlotsByStartTime(slots);
      }

      slots = applyPastTimeDisabling(slots, meetSelectedDate);

      slotEl.innerHTML = '<option value="">Please Select Meeting Time</option>';
      slots.forEach((s) => {
        const val = normalizeSlotLabel(slotObjectToLabel(s));
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        if (slotIsDisabled(s)) opt.disabled = true;
        slotEl.appendChild(opt);
      });
      applySlotSelection(slotEl, selectValue || null);
    } catch (e) {
      slotEl.innerHTML = '<option value="">Please Select Meeting Time</option>';
      showScheduleModalMsg(e.message || 'Time slots failed', 'err');
    } finally {
      slotEl.disabled = false;
    }
  }

  function openScheduleModal(editMeeting) {
    clearScheduleModalMsg();
    meetEditId = editMeeting && editMeeting.id ? editMeeting.id : null;
    const modalEl = document.getElementById('supModalSchedule');
    const titleEl = $('#supModalScheduleTitle');
    if (titleEl) {
      titleEl.textContent = meetEditId ? 'Change meeting date' : 'Schedule a meeting with your Agent';
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    todayStart.setHours(0, 0, 0, 0);

    if (editMeeting && editMeeting.date) {
      const d = new Date(editMeeting.date);
      meetSelectedDate = Number.isNaN(d.getTime()) ? new Date(todayStart) : d;
    } else {
      meetSelectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    let bumpedPastMeetingToToday = false;
    if (meetEditId) {
      const sel = new Date(
        meetSelectedDate.getFullYear(),
        meetSelectedDate.getMonth(),
        meetSelectedDate.getDate()
      );
      sel.setHours(0, 0, 0, 0);
      if (sel < todayStart) {
        meetSelectedDate = new Date(todayStart);
        bumpedPastMeetingToToday = true;
      }
    }

    meetCalView = new Date(meetSelectedDate.getFullYear(), meetSelectedDate.getMonth(), 1);

    $('#supSchedTitle').value = editMeeting && editMeeting.title ? editMeeting.title : '';
    $('#supSchedDesc').value = editMeeting && editMeeting.description ? editMeeting.description : '';
    const imp =
      editMeeting && String(editMeeting.importance || '').toLowerCase() === 'urgent' ? true : false;
    const urgentEl = $('#supSchedUrgent');
    const urgentLabel = $('#supSchedUrgentLabel');
    if (urgentEl) urgentEl.checked = imp;
    if (urgentLabel) urgentLabel.textContent = imp ? 'Urgent' : 'Normal';

    const durEl = $('#supSchedDuration');
    if (durEl) {
      const p = parseInt(editMeeting && editMeeting.meetingPeriod, 10);
      durEl.value = p === 60 ? '60' : '30';
    }

    updateMeetSelectedLabel();
    renderCalendar();

    let preSlot = null;
    if (editMeeting && editMeeting.date && !bumpedPastMeetingToToday) {
      const md = new Date(editMeeting.date);
      const pad = (n) => String(n).padStart(2, '0');
      preSlot = pad(md.getHours()) + ':' + pad(md.getMinutes());
    }
    loadTimeSlots(preSlot);

    if (modalEl && typeof bootstrap !== 'undefined') {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }

  function openPreview(m) {
    const modal = document.getElementById('supModalMeetPreview');
    const st = $('#supPreviewStatus');
    const canceled = meetingStatusCanceled(m);
    if (st) {
      st.textContent = meetingStatusPlainLabel(m);
      st.className = 'sup-preview-badge' + (canceled ? ' sup-preview-badge--canceled' : '');
    }
    $('#supPreviewTitle').textContent = m.title || 'Meeting';
    $('#supPreviewDesc').textContent = m.description || '—';
    const period = String(m.meetingPeriod || '30');
    $('#supPreviewWhen').textContent =
      'Your meeting time is ' +
      period +
      ' minutes at ' +
      formatLongMeeting(m.date) +
      '.';
    const impEl = $('#supPreviewImp');
    if (impEl) {
      const raw = String(m.importance || 'normal').trim();
      impEl.textContent = raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : 'Normal';
    }
    if (modal && typeof bootstrap !== 'undefined') {
      bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  async function submitScheduleForm(e) {
    e.preventDefault();
    const title = ($('#supSchedTitle') && $('#supSchedTitle').value.trim()) || '';
    const description = ($('#supSchedDesc') && $('#supSchedDesc').value.trim()) || '';
    const slotVal = ($('#supSchedSlot') && $('#supSchedSlot').value) || '';
    const meetingPeriod = parseInt(($('#supSchedDuration') && $('#supSchedDuration').value) || '30', 10);
    const importance = $('#supSchedUrgent') && $('#supSchedUrgent').checked ? 'urgent' : 'normal';
    const btn = $('#supSchedSubmit');

    if (!meetSelectedDate || !slotVal) {
      showScheduleModalMsg('Please choose a date and time slot.', 'err');
      return;
    }
    const slotSelect = $('#supSchedSlot');
    const selOpt = slotSelect && slotSelect.selectedOptions && slotSelect.selectedOptions[0];
    if (selOpt && selOpt.disabled) {
      showScheduleModalMsg('That time slot is not available. Please choose another.', 'err');
      return;
    }
    const combined = combineDateAndSlot(meetSelectedDate, slotVal);
    if (!combined) {
      showScheduleModalMsg('Invalid time slot.', 'err');
      return;
    }
    const dateIso = combined.toISOString();

    if (btn) btn.disabled = true;
    clearScheduleModalMsg();
    try {
      if (meetEditId) {
        const res = await fetch(MEET_UPDATE + '?id=' + encodeURIComponent(meetEditId), {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateIso,
            title,
            description,
            importance,
            meetingPeriod,
            isUserConfirmed: true
          })
        });
        const data = await res.json();
        if (!res.ok || data.status === 'error') {
          throw new Error(data.message || 'Failed to update meeting');
        }
        showGlobal('Meeting updated.', 'ok');
      } else {
        const res = await fetch(MEET_CREATE, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            date: dateIso,
            meetingPeriod,
            importance,
            isUserConfirmed: true
          })
        });
        const data = await res.json();
        if (!res.ok || data.status === 'error') {
          throw new Error(data.message || 'Failed to schedule');
        }
        showGlobal('Meeting request submitted.', 'ok');
      }
      const modalEl = document.getElementById('supModalSchedule');
      if (modalEl && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      }
      e.target.reset();
      meetEditId = null;
      setTimeout(() => showGlobal('', 'ok'), 2800);
      await loadMeetings();
    } catch (err) {
      showScheduleModalMsg(err.message || 'Could not save the meeting.', 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function deleteMeeting(id) {
    try {
      const res = await fetch(MEET_DELETE + '?id=' + encodeURIComponent(id), {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data && data.message) || 'Failed to cancel meeting');
      }
      showGlobal('Meeting canceled.', 'ok');
      setTimeout(() => showGlobal('', 'ok'), 2500);
      await loadMeetings();
    } catch (err) {
      showGlobal(err.message || 'Cancel failed', 'err');
    }
  }

  function wire() {
    const root = $('#supRoot');
    if (!root || root.dataset.supWired === '1') return;
    root.dataset.supWired = '1';

    let supPagerResizeT;
    window.addEventListener('resize', () => {
      clearTimeout(supPagerResizeT);
      supPagerResizeT = setTimeout(() => {
        if (lastTicketsPagerTotal > TICKETS_PAGE_SIZE) {
          renderTicketsPager(lastTicketsPagerTotal);
        }
        const meetPanel = $('#supPanelMeetings');
        if (meetPanel && !meetPanel.classList.contains('d-none') && meetings.length > 0) {
          renderMeetingsTable();
        }
      }, 150);
    });

    setContactsMailto();

    document.querySelectorAll('.sup-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.supTab;
        if (!name) return;
        setActiveTab(name);
        if (name === 'tickets') loadTickets();
        if (name === 'meetings') loadMeetings();
      });
    });

    document.querySelectorAll('input[name="supTicketFilter"]').forEach((r) => {
      r.addEventListener('change', () => {
        expandedId = null;
        ticketPage = 1;
        renderTickets();
      });
    });

    $('#supTicketsPager')?.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-sup-page]');
      if (!btn || btn.disabled) return;
      const raw = btn.getAttribute('data-sup-page');
      const all = filteredTickets();
      const totalPages = Math.max(1, Math.ceil(all.length / TICKETS_PAGE_SIZE));
      const p = parseInt(raw, 10);
      if (!Number.isNaN(p) && p >= 1 && p <= totalPages) {
        ticketPage = p;
        expandedId = null;
        renderTickets();
      }
    });

    $('#supMeetPager')?.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-meet-page]');
      if (!btn || btn.disabled) return;
      const raw = btn.getAttribute('data-meet-page');
      const totalPages = Math.max(1, Math.ceil(meetings.length / MEETINGS_PAGE_SIZE));
      const p = parseInt(raw, 10);
      if (!Number.isNaN(p) && p >= 1 && p <= totalPages) {
        meetingPage = p;
        renderMeetingsTable();
      }
    });

    document.getElementById('supModalSchedule')?.addEventListener('hidden.bs.modal', () => {
      clearScheduleModalMsg();
    });

    $('#supBtnAddTicket')?.addEventListener('click', async () => {
      await loadDepartments();
      const el = document.getElementById('supModalNewTicket');
      if (el && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getOrCreateInstance(el).show();
      }
    });

    $('#supFormNewTicket')?.addEventListener('submit', submitNewTicket);

    $('#supBtnOpenSchedule')?.addEventListener('click', () => openScheduleModal(null));

    $('#supFormSchedule')?.addEventListener('submit', submitScheduleForm);

    $('#supCalPrevM')?.addEventListener('click', () => {
      if (!meetCalView) return;
      meetCalView.setMonth(meetCalView.getMonth() - 1);
      renderCalendar();
    });
    $('#supCalNextM')?.addEventListener('click', () => {
      if (!meetCalView) return;
      meetCalView.setMonth(meetCalView.getMonth() + 1);
      renderCalendar();
    });

    $('#supSchedDuration')?.addEventListener('change', () => loadTimeSlots());

    $('#supSchedUrgent')?.addEventListener('change', () => {
      const el = $('#supSchedUrgent');
      const lb = $('#supSchedUrgentLabel');
      if (lb && el) lb.textContent = el.checked ? 'Urgent' : 'Normal';
    });

    $('#supPanelMeetings')?.addEventListener('click', (ev) => {
      const prev = ev.target.closest('[data-action="meet-preview"]');
      const can = ev.target.closest('[data-action="meet-cancel"]');
      const resched = ev.target.closest('[data-action="meet-reschedule"]');
      if (prev) {
        const id = prev.getAttribute('data-id');
        const m = meetings.find((x) => String(x.id) === String(id));
        if (m) openPreview(m);
        return;
      }
      if (resched) {
        const id = resched.getAttribute('data-id');
        const m = meetings.find((x) => String(x.id) === String(id));
        if (m) openScheduleModal(m);
        return;
      }
      if (can) {
        meetCancelId = can.getAttribute('data-id');
        const modal = document.getElementById('supModalMeetCancel');
        if (modal && typeof bootstrap !== 'undefined') {
          bootstrap.Modal.getOrCreateInstance(modal).show();
        }
      }
    });

    $('#supCancelConfirmYes')?.addEventListener('click', async () => {
      if (!meetCancelId) return;
      const id = meetCancelId;
      meetCancelId = null;
      const modal = document.getElementById('supModalMeetCancel');
      if (modal && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getOrCreateInstance(modal).hide();
      }
      await deleteMeeting(id);
    });

    $('#supTicketsList')?.addEventListener('keydown', async (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const toggle = ev.target.closest('[data-action="toggle-ticket"]');
      if (!toggle) return;
      ev.preventDefault();
      const id = toggle.getAttribute('data-id');
      if (id) await toggleTicket(id);
    });

    if (!window._CP_supMetaPanGuard) {
      window._CP_supMetaPanGuard = true;
      document.addEventListener(
        'pointerup',
        (ev) => {
          const sc = window._CP_supMetaPanActive;
          window._CP_supMetaPanActive = null;
          if (!sc || sc._supPanX == null) return;
          const dx = ev.clientX - sc._supPanX;
          const dy = ev.clientY - sc._supPanY;
          if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
            const head = sc.closest('.sup-ticket-head');
            if (head) head.setAttribute('data-sup-skip-toggle', '1');
            setTimeout(() => head?.removeAttribute('data-sup-skip-toggle'), 450);
          }
          sc._supPanX = null;
          sc._supPanY = null;
        },
        true
      );
      document.addEventListener('pointercancel', () => {
        if (window._CP_supMetaPanActive) {
          window._CP_supMetaPanActive._supPanX = null;
          window._CP_supMetaPanActive._supPanY = null;
        }
        window._CP_supMetaPanActive = null;
      });
    }

    $('#supTicketsList')?.addEventListener('pointerdown', (ev) => {
      const sc = ev.target.closest('.sup-ticket-head-meta-scroll');
      window._CP_supMetaPanActive = sc || null;
      if (sc) {
        sc._supPanX = ev.clientX;
        sc._supPanY = ev.clientY;
      }
    });

    if (!window._CP_supTicketMetaResize) {
      window._CP_supTicketMetaResize = true;
      window.addEventListener('resize', () => {
        if (document.querySelector('section.view-support.show')) {
          updateTicketMetaScrollOverflow();
        }
      });
    }

    $('#supTicketsList')?.addEventListener('click', async (ev) => {
      const toggle = ev.target.closest('[data-action="toggle-ticket"]');
      if (toggle) {
        if (toggle.getAttribute('data-sup-skip-toggle') === '1') return;
        const id = toggle.getAttribute('data-id');
        if (id) await toggleTicket(id);
        return;
      }
      const send = ev.target.closest('.sup-btn-send');
      if (send) {
        const id = send.getAttribute('data-id');
        if (id) await sendComment(id);
        return;
      }
      const close = ev.target.closest('.sup-btn-close-ticket');
      if (close) {
        const id = close.getAttribute('data-id');
        if (id) await closeTicket(id);
      }
    });
  }

  window.CP_tabs.support = function () {
    wire();
    setActiveTab('contacts');
  };

  window.CP_onViewShow.support = function () {
    setContactsMailto();
    const ticketsPanel = $('#supPanelTickets');
    if (ticketsPanel && !ticketsPanel.classList.contains('d-none')) {
      (async () => {
        await loadDepartments();
        await loadTickets();
      })();
    }
    const meetPanel = $('#supPanelMeetings');
    if (meetPanel && !meetPanel.classList.contains('d-none')) {
      loadMeetings();
    }
  };
})();
