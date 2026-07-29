// Verification tab — upload + doc history (clientzone/documents API)
window.CP_tabs = window.CP_tabs || {};
window.CP_onViewShow = window.CP_onViewShow || {};

(function () {
  const UPLOAD_URL = 'api/verification/documents_upload.php';
  const ALL_URL = 'api/verification/documents_all.php';
  const PAGE_SIZE = 8;
  /** Default preview before a file is chosen (same for all upload slots). */
  const PREVIEW_DEFAULT_SRC = 'assets/images/cards_preview_default.png';

  const CAT_LABELS = {
    identity: 'Identity Card',
    proof_residence: 'Proof of Residence',
    card_verification: 'Card Verification',
    other: 'Other Document'
  };

  /** Template ids in verification.html — icons use fill currentColor (purple menu / white pill+active). */
  const CAT_SVG_TEMPLATE_IDS = {
    proof_residence: 'verCatSvgProof',
    card_verification: 'verCatSvgCard',
    other: 'verCatSvgOther'
  };

  function catSvgInnerFromTemplate(templateId) {
    const t = document.getElementById(templateId);
    return t ? t.innerHTML : '';
  }

  function injectCatMenuIcons() {
    const idBtn = document.querySelector('#verCatMenu .ver-cat-option[data-cat="identity"]');
    if (idBtn) {
      const wasActive = idBtn.classList.contains('ver-cat-option--active');
      idBtn.innerHTML =
        '<span class="ver-cat-option__icon ver-cat-option__icon--bi" aria-hidden="true">' +
        '<i class="bi bi-person-vcard"></i></span>' +
        '<span class="ver-cat-option__label">' +
        escapeHtml(CAT_LABELS.identity) +
        '</span>';
      if (wasActive) idBtn.classList.add('ver-cat-option--active');
    }
    Object.keys(CAT_SVG_TEMPLATE_IDS).forEach((cat) => {
      const tid = CAT_SVG_TEMPLATE_IDS[cat];
      const btn = document.querySelector('#verCatMenu .ver-cat-option[data-cat="' + cat + '"]');
      const svgInner = catSvgInnerFromTemplate(tid);
      if (!btn || !svgInner) return;
      const wasActive = btn.classList.contains('ver-cat-option--active');
      btn.innerHTML =
        '<span class="ver-cat-option__icon" aria-hidden="true">' +
        svgInner +
        '</span>' +
        '<span class="ver-cat-option__label">' +
        escapeHtml(CAT_LABELS[cat]) +
        '</span>';
      if (wasActive) btn.classList.add('ver-cat-option--active');
    });
  }

  /** Pill shows checkmark + label only; category icons stay in the dropdown options. */
  function setVerCatLabelForCat(cat) {
    const lel = $('#verCatLabel');
    if (!lel) return;
    const text = escapeHtml(CAT_LABELS[cat] || cat);
    lel.innerHTML = '<span class="ver-cat-pill__label">' + text + '</span>';
  }

  /** Maps UI → API `documentType` (PascalCase strings from backend). */
  const API_TYPES = {
    passport: 'Passport',
    credit_card: 'CardFront',
    general: 'General',
    proof_residence: 'ProofOfResidency',
    card_verification: 'CardFront',
    other_declaration: 'General',
    other_risk: 'General',
    other_driving: 'General'
  };

  const SUBRADIOS = {
    identity: [
      { value: 'id_front_back', label: 'ID Front/Back' },
      { value: 'passport', label: 'Passport' },
      { value: 'credit_card', label: 'Credit Card Front' },
      { value: 'general', label: 'General' }
    ],
    other: [
      { value: 'declaration', label: 'Declaration Deposit' },
      { value: 'risk', label: 'Risk Statement' },
      { value: 'driving', label: 'Driving License' }
    ]
  };

  const DOC_TYPE_LABELS = {
    ProofOfResidency: 'Proof of Residence',
    General: 'General',
    Passport: 'Passport',
    CardFront: 'Credit Card Front',
    IdFront: 'ID Front',
    IdBack: 'ID Back',
    IdentityCard: 'Identity Card',
    ProofOfAddress: 'Proof of Address',
    BankStatement: 'Bank Statement',
    UtilityBill: 'Utility Bill'
  };

  /** API documentType (often PascalCase) → readable label for filters, table, tooltips. */
  function humanizeDocumentTypeLabel(raw) {
    const key = String(raw || '').trim();
    if (!key) return '';
    if (DOC_TYPE_LABELS[key]) return DOC_TYPE_LABELS[key];
    let s = key.replace(/_/g, ' ');
    s = s.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    s = s.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
    return s.replace(/\s+/g, ' ').trim();
  }

  let state = {
    cat: 'identity',
    sub: 'id_front_back',
    allDocs: [],
    page: 1,
    filtered: []
  };

  let uploadOkHideTimer = null;

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

  function getPreviewPlaceholderHtml() {
    return (
      '<img class="ver-preview-img ver-preview-img--default" src="' +
      PREVIEW_DEFAULT_SRC +
      '" alt="" loading="lazy" />'
    );
  }

  /** Short heading in modal; full description belongs in table tooltip only. */
  function truncateForModalTitle(raw, maxLen) {
    const t = String(raw || '').trim();
    if (!t) return { display: 'Document', truncated: false, full: 'Document' };
    if (t.length <= maxLen) return { display: t, truncated: false, full: t };
    return {
      display: t.slice(0, Math.max(0, maxLen - 1)) + '…',
      truncated: true,
      full: t
    };
  }

  /** Doc History cell: show first few words; full text only in Bootstrap tooltip (avoids horizontal table stretch). */
  const DOC_CELL_MAX_WORDS = 6;
  const DOC_CELL_MAX_CHARS = 48;

  function shortDocLabelForTableCell(raw) {
    const t = String(raw || '').trim();
    if (!t) return { display: '—', full: '', useTip: false };
    const words = t.split(/\s+/).filter(Boolean);
    let display = t;
    if (words.length > DOC_CELL_MAX_WORDS) {
      display = words.slice(0, DOC_CELL_MAX_WORDS).join(' ') + '…';
    }
    if (display.length > DOC_CELL_MAX_CHARS) {
      display = display.slice(0, Math.max(1, DOC_CELL_MAX_CHARS - 1)).trim() + '…';
    }
    const useTip = display !== t;
    return { display, full: t, useTip };
  }

  function disposeVerificationTableTooltips(tbody) {
    if (!tbody || typeof bootstrap === 'undefined') return;
    tbody.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      const inst = bootstrap.Tooltip.getInstance(el);
      if (inst) inst.dispose();
    });
  }

  /** Called by Bootstrap on each tooltip show with fresh default config (see tooltip.js _getPopperConfig). */
  function docNameTooltipPopperConfig(defaultBsPopperConfig) {
    const small =
      typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 576px)').matches;
    const mods = defaultBsPopperConfig.modifiers ? defaultBsPopperConfig.modifiers.slice() : [];
    mods.push({
      name: 'verCenterTooltipInViewport',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['popperOffsets'],
      fn({ state }) {
        if (typeof window.matchMedia === 'function' && !window.matchMedia('(max-width: 576px)').matches) {
          return;
        }
        const off = state.modifiersData.popperOffsets;
        if (!off) return;
        const w = state.rects.popper.width;
        const vw =
          window.visualViewport && window.visualViewport.width
            ? window.visualViewport.width
            : window.innerWidth;
        const pad = 12;
        off.x = Math.max(pad, Math.min((vw - w) / 2, vw - w - pad));
      }
    });
    const out = { ...defaultBsPopperConfig, modifiers: mods };
    if (small) {
      out.strategy = 'fixed';
    }
    return out;
  }

  function initVerificationTableTooltips(tbody) {
    if (!tbody || typeof bootstrap === 'undefined') return;
    tbody.querySelectorAll('.ver-doc-name[data-bs-toggle="tooltip"]').forEach((el) => {
      new bootstrap.Tooltip(el, {
        container: 'body',
        customClass: 'ver-doc-name-tooltip',
        delay: { show: 180, hide: 80 },
        html: false,
        trigger: 'hover focus',
        popperConfig: docNameTooltipPopperConfig
      });
    });
  }

  function isSameOriginDocumentUrl(u) {
    if (!u || typeof u !== 'string' || u.indexOf('data:') === 0) return false;
    try {
      return new URL(u, document.baseURI).origin === window.location.origin;
    } catch (_) {
      return false;
    }
  }

  function looksLikeImagePreview(url, mime) {
    const m = String(mime || '').toLowerCase();
    if (m.indexOf('image/') === 0) return true;
    return /\.(jpe?g|png|gif|webp|bmp|svg|jfif|jpe)(\?|#|$)/i.test(String(url));
  }

  /**
   * Doc History → View: show image/PDF in a modal on this page (not window.open).
   * Long descriptions were put in the modal title — that caused a giant scroll of text; title is truncated.
   * Same-origin image URLs often need session cookies: fetch + blob before assigning <img>.
   */
  async function openDocumentModal(url, mimeType, docTitle) {
    const modalEl = document.getElementById('verDocViewModal');
    const imgEl = document.getElementById('verDocViewImg');
    const frameEl = document.getElementById('verDocViewFrame');
    const fbEl = document.getElementById('verDocViewFallback');
    const linkEl = document.getElementById('verDocViewOpen');
    const titleEl = document.getElementById('verDocViewTitle');
    if (!modalEl || !imgEl || !frameEl || typeof bootstrap === 'undefined') {
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    const heading = truncateForModalTitle(docTitle, 80);
    if (titleEl) {
      titleEl.textContent = heading.display;
      titleEl.removeAttribute('title');
      if (heading.truncated) titleEl.setAttribute('title', heading.full);
    }

    imgEl.classList.add('d-none');
    frameEl.classList.add('d-none');
    if (fbEl) fbEl.classList.add('d-none');
    imgEl.removeAttribute('src');
    frameEl.removeAttribute('src');
    imgEl.onload = null;
    imgEl.onerror = null;

    let blobUrlToRevoke = null;
    const revokeBlob = () => {
      if (blobUrlToRevoke) {
        URL.revokeObjectURL(blobUrlToRevoke);
        blobUrlToRevoke = null;
      }
    };

    const cleanup = function () {
      revokeBlob();
      imgEl.src = '';
      frameEl.src = 'about:blank';
      imgEl.onload = null;
      imgEl.onerror = null;
    };

    const mime = String(mimeType || '').toLowerCase();
    const isPdf = mime.indexOf('pdf') !== -1 || /\.pdf(\?|#|$)/i.test(String(url));

    const wireFallbackLink = () => {
      if (linkEl && url) linkEl.href = url;
    };

    const showModal = () => {
      const m = bootstrap.Modal.getOrCreateInstance(modalEl);
      m.show();
      modalEl.addEventListener('hidden.bs.modal', cleanup, { once: true });
    };

    if (isPdf) {
      frameEl.src = url;
      frameEl.classList.remove('d-none');
      showModal();
      return;
    }

    const showImageFallback = () => {
      imgEl.classList.add('d-none');
      if (fbEl) fbEl.classList.remove('d-none');
      wireFallbackLink();
    };

    if (url && looksLikeImagePreview(url, mimeType) && isSameOriginDocumentUrl(url)) {
      try {
        const res = await fetch(url, { credentials: 'same-origin', redirect: 'follow' });
        const blob = await res.blob();
        const ct = (blob.type || '').toLowerCase();
        if (res.ok && ct.indexOf('image/') === 0) {
          blobUrlToRevoke = URL.createObjectURL(blob);
          imgEl.onload = function () {
            imgEl.classList.remove('d-none');
            if (fbEl) fbEl.classList.add('d-none');
          };
          imgEl.onerror = function () {
            revokeBlob();
            showImageFallback();
          };
          imgEl.src = blobUrlToRevoke;
          showModal();
          if (imgEl.complete && imgEl.naturalWidth > 0) {
            imgEl.classList.remove('d-none');
            if (fbEl) fbEl.classList.add('d-none');
          }
          return;
        }
      } catch (_) {
        /* direct <img> below */
      }
    }

    imgEl.onload = function () {
      imgEl.classList.remove('d-none');
      if (fbEl) fbEl.classList.add('d-none');
    };
    imgEl.onerror = function () {
      showImageFallback();
    };
    imgEl.src = url;
    showModal();
    if (imgEl.complete && imgEl.naturalWidth > 0) {
      imgEl.classList.remove('d-none');
      if (fbEl) fbEl.classList.add('d-none');
    }
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return escapeHtml(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  /** Doc History table — Figma: DD/MM/YYYY H:MMAM/PM (local time). */
  function formatHistoryUploadedAt(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return escapeHtml(String(iso));
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    let h24 = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, '0');
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return dd + '/' + mm + '/' + yyyy + ' ' + h12 + ':' + mins + ampm;
  }

  function dateInputToIso(dateStr, endOfDay) {
    if (!dateStr || !String(dateStr).trim()) return null;
    const d = new Date(dateStr + (endOfDay ? 'T23:59:59.000Z' : 'T12:00:00.000Z'));
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  function docLabelFromRow(row) {
    const t = row.documentType || '';
    if (t) return humanizeDocumentTypeLabel(t);
    const fid = row.fileId || '';
    const base = fid.split('/').pop() || 'Document';
    return base.replace(/_\d+\.\w+$/, '');
  }

  function statusClass(st) {
    const s = String(st || '').toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    return 'pending';
  }

  function buildDocumentPayload() {
    const cat = state.cat;
    const sub = state.sub;
    const descGeneral = ($('#verDescGeneral') && $('#verDescGeneral').value.trim()) || '';
    const expGen = $('#verExpiresGeneral') && $('#verExpiresGeneral').value;
    const expiresOpt = dateInputToIso(expGen, true);

    if (cat === 'proof_residence') {
      const country = ($('#verCountry') && $('#verCountry').value.trim()) || '';
      const city = ($('#verCity') && $('#verCity').value.trim()) || '';
      const address = ($('#verAddress') && $('#verAddress').value.trim()) || '';
      const postal = ($('#verPostal') && $('#verPostal').value.trim()) || '';
      const desc = ($('#verDescResidence') && $('#verDescResidence').value.trim()) || 'Proof of residency document';
      const exp = $('#verExpires') && $('#verExpires').value;
      if (!country || !city || !address || !postal) {
        throw new Error('Please fill country, city, address, and postal code.');
      }
      return {
        documentType: API_TYPES.proof_residence,
        country,
        city,
        address,
        postalCode: postal,
        description: desc,
        expiresAt: dateInputToIso(exp, true)
      };
    }

    const base = {
      description: descGeneral || undefined,
      expiresAt: expiresOpt || undefined
    };

    if (cat === 'card_verification') {
      return {
        documentType: API_TYPES.card_verification,
        ...base
      };
    }

    if (cat === 'identity') {
      if (sub === 'passport') return { documentType: API_TYPES.passport, ...base };
      if (sub === 'credit_card') return { documentType: API_TYPES.credit_card, ...base };
      if (sub === 'general') return { documentType: API_TYPES.general, ...base };
      return null;
    }

    if (cat === 'other') {
      let extraDesc = descGeneral;
      if (sub === 'declaration') extraDesc = extraDesc || 'Declaration Deposit';
      if (sub === 'risk') extraDesc = extraDesc || 'Risk Statement';
      if (sub === 'driving') extraDesc = extraDesc || 'Driving License';
      return {
        documentType: API_TYPES.general,
        description: extraDesc,
        expiresAt: base.expiresAt
      };
    }

    return { documentType: API_TYPES.general, ...base };
  }

  /**
   * Backend allows jpeg|jpg|png|pdf — JPEG may be named .jfif / .jpe.
   * Return multipart body + filename (always .jpg for those); Blob fallback if File() fails.
   */
  function getUploadFileParts(file) {
    if (!file || !file.name) return { blob: file, filename: (file && file.name) || 'upload' };
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.jfif') || lower.endsWith('.jpe')) {
      const base = file.name.replace(/\.(jfif|jpe)$/i, '');
      const filename = base + '.jpg';
      try {
        if (typeof File !== 'undefined') {
          return {
            blob: new File([file], filename, {
              type: 'image/jpeg',
              lastModified: file.lastModified
            }),
            filename: filename
          };
        }
      } catch (_) {}
      return { blob: new Blob([file], { type: 'image/jpeg' }), filename: filename };
    }
    return { blob: file, filename: file.name };
  }

  /** API returns lists like /jpeg|jpg|png|pdf/ — add spaces around pipes for readability. */
  function formatUploadErrorForDisplay(msg) {
    if (msg == null || msg === '') return '';
    return String(msg).replace(/\|/g, ' | ');
  }

  async function postUpload(file, documentObj) {
    const parts = getUploadFileParts(file);
    const fd = new FormData();
    fd.append('file', parts.blob, parts.filename);
    fd.append('document', JSON.stringify(documentObj));
    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: fd,
      credentials: 'same-origin'
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.status === 'error') {
      const d = j.details;
      const msg =
        j.message ||
        (Array.isArray(d?.message) ? d.message.join(', ') : d?.message) ||
        (typeof d === 'string' ? d : null) ||
        'Upload failed';
      throw new Error(msg);
    }
    return j.data;
  }

  function setUploadLoading(on) {
    const btn = $('#verBtnSubmit');
    const sp = btn && btn.querySelector('.ver-btn-spinner');
    if (btn) btn.disabled = !!on;
    if (sp) sp.classList.toggle('d-none', !on);
  }

  function showUploadMsg(err, ok) {
    if (uploadOkHideTimer) {
      clearTimeout(uploadOkHideTimer);
      uploadOkHideTimer = null;
    }
    const elE = $('#verUploadError');
    const elO = $('#verUploadOk');
    if (elE) {
      elE.classList.toggle('d-none', !err);
      elE.textContent = err || '';
    }
    if (elO) {
      elO.classList.toggle('d-none', !ok);
      elO.textContent = ok || '';
      if (ok) {
        uploadOkHideTimer = setTimeout(() => {
          uploadOkHideTimer = null;
          elO.classList.add('d-none');
          elO.textContent = '';
        }, 5000);
      }
    }
  }

  async function onSubmit() {
    showUploadMsg('', '');
    const isIdFrontBack = state.cat === 'identity' && state.sub === 'id_front_back';
    const single = $('#verFileInput') && $('#verFileInput').files[0];

    if (isIdFrontBack) {
      if (!single) {
        showUploadMsg('Please choose a file to upload.', '');
        return;
      }
      setUploadLoading(true);
      try {
        const desc = ($('#verDescGeneral') && $('#verDescGeneral').value.trim()) || '';
        const exp = $('#verExpiresGeneral') && $('#verExpiresGeneral').value;
        const ex = dateInputToIso(exp, true);
        const sideEl = document.querySelector('input[name="verIdSide"]:checked');
        const isBack = sideEl && sideEl.value === 'back';
        await postUpload(single, {
          documentType: API_TYPES.general,
          description: desc || (isBack ? 'ID card — back' : 'ID card — front'),
          expiresAt: ex || undefined
        });
        showUploadMsg('', 'Upload successful. Your document is pending review.');
        clearAllVerificationFormState();
        await loadHistory(true);
      } catch (e) {
        showUploadMsg(e.message || 'Upload failed', '');
      } finally {
        setUploadLoading(false);
      }
      return;
    }

    let payload;
    try {
      payload = buildDocumentPayload();
    } catch (e) {
      showUploadMsg(e.message || 'Invalid form', '');
      return;
    }

    if (!single) {
      showUploadMsg('Please choose a file to upload.', '');
      return;
    }

    setUploadLoading(true);
    try {
      await postUpload(single, payload);
      showUploadMsg('', 'Upload successful. Your document is pending review.');
      clearAllVerificationFormState();
      await loadHistory(true);
    } catch (e) {
      showUploadMsg(e.message || 'Upload failed', '');
    } finally {
      setUploadLoading(false);
    }
  }

  function clearFiles() {
    const inp = document.getElementById('verFileInput');
    if (inp) inp.value = '';
    clearPreview();
  }

  function clearPreview() {
    const el = document.getElementById('verPreviewInner');
    if (el) el.innerHTML = getPreviewPlaceholderHtml();
    const fn = document.getElementById('verFileName');
    if (fn) fn.textContent = '';
  }

  /** After success, or when switching document category: clear file, all text fields, and saved draft. */
  function clearAllVerificationFormState() {
    clearFiles();
    [
      'verCountry',
      'verCity',
      'verAddress',
      'verPostal',
      'verExpires',
      'verDescResidence',
      'verDescGeneral',
      'verExpiresGeneral'
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    try {
      sessionStorage.removeItem('verProofResidenceDraft');
    } catch (_) {}
    const front = document.querySelector('input[name="verIdSide"][value="front"]');
    if (front) front.checked = true;
  }

  function bindFilePreview(inputId, nameId, previewId) {
    const input = document.getElementById(inputId);
    const nameEl = document.getElementById(nameId);
    const prev = document.getElementById(previewId);
    if (!input || !prev) return;
    input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      if (nameEl) nameEl.textContent = f ? f.name : '';
      prev.innerHTML = '';
      if (!f) {
        prev.innerHTML = getPreviewPlaceholderHtml();
        return;
      }
      const looksLikeImage =
        (f.type && f.type.startsWith('image/')) || /\.(jpe?g|jfif|jpe|png|gif|webp)$/i.test(f.name || '');
      if (looksLikeImage) {
        const url = URL.createObjectURL(f);
        const img = document.createElement('img');
        img.className = 'ver-preview-img';
        img.src = url;
        img.alt = 'Preview';
        img.onload = () => URL.revokeObjectURL(url);
        prev.appendChild(img);
      } else {
        prev.innerHTML =
          '<span class="text-muted small">' + escapeHtml(f.name) + '</span>';
      }
    });
  }

  function fillPreviewPlaceholders() {
    const el = document.getElementById('verPreviewInner');
    if (el && !el.querySelector('img:not(.ver-preview-img--default)')) {
      el.innerHTML = getPreviewPlaceholderHtml();
    }
  }

  function renderRadioRow() {
    const row = $('#verRadioRow');
    if (!row) return;
    const cat = state.cat;
    if (cat === 'proof_residence' || cat === 'card_verification') {
      row.innerHTML = '';
      row.setAttribute('hidden', 'hidden');
      return;
    }
    row.removeAttribute('hidden');
    const list = SUBRADIOS[cat];
    if (!list) {
      row.innerHTML = '';
      return;
    }
    const current = list.some((x) => x.value === state.sub) ? state.sub : list[0].value;
    state.sub = current;
    row.innerHTML = list
      .map(
        (r) => `
      <label class="ver-radio">
        <input type="radio" name="verSub" value="${escapeHtml(r.value)}" ${
          r.value === current ? 'checked' : ''
        } />
        <span>${escapeHtml(r.label)}</span>
      </label>`
      )
      .join('');
    row.querySelectorAll('input[name="verSub"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const next = inp.value;
        if (state.sub !== next) {
          clearFiles();
          showUploadMsg('', '');
        }
        state.sub = next;
        syncLayout();
      });
    });
  }

  function updateSingleDropLabel() {
    const el = $('#verDropLabel');
    if (!el) return;
    const cat = state.cat;
    const sub = state.sub;
    if (cat === 'identity') {
      if (sub === 'passport') el.textContent = 'Passport';
      else if (sub === 'credit_card') el.textContent = 'Credit Card Front';
      else if (sub === 'general') el.textContent = 'General';
      else el.textContent = 'Upload ID image (one side per submit)';
    } else if (cat === 'proof_residence') el.textContent = 'Proof of Residence';
    else if (cat === 'card_verification') el.textContent = 'Card Verification';
    else if (cat === 'other') el.textContent = 'Other Document';
  }

  function updateCatMenuActive(cat) {
    document.querySelectorAll('.ver-cat-option').forEach((btn) => {
      btn.classList.toggle('ver-cat-option--active', btn.getAttribute('data-cat') === cat);
    });
  }

  function syncLayout() {
    const cat = state.cat;
    const sub = state.sub;
    setVerCatLabelForCat(cat);
    updateCatMenuActive(cat);

    const addr = $('#verAddressBlock');
    const opt = $('#verOptionalMeta');
    if (addr && opt) {
      const showAddr = cat === 'proof_residence';
      addr.hidden = !showAddr;
      const hideOpt = showAddr || cat === 'identity' || cat === 'card_verification';
      opt.style.display = hideOpt ? 'none' : '';
    }

    const isIdFrontBack = cat === 'identity' && sub === 'id_front_back';
    const idSideRow = $('#verIdSideRow');
    if (idSideRow) idSideRow.hidden = !isIdFrontBack;

    updateSingleDropLabel();
    renderRadioRow();
  }

  function setCat(cat) {
    if (state.cat !== cat) {
      clearAllVerificationFormState();
      showUploadMsg('', '');
    }
    state.cat = cat;
    if (cat === 'identity') state.sub = 'id_front_back';
    else if (cat === 'other') state.sub = 'declaration';
    else state.sub = 'general';
    syncLayout();
  }

  function togglePanel(which) {
    const up = $('#verPanelUpload');
    const hi = $('#verPanelHistory');
    if (which === 'history') {
      up.classList.add('ver-panel--hidden');
      up.setAttribute('hidden', 'hidden');
      hi.classList.remove('ver-panel--hidden');
      hi.removeAttribute('hidden');
    } else {
      hi.classList.add('ver-panel--hidden');
      hi.setAttribute('hidden', 'hidden');
      up.classList.remove('ver-panel--hidden');
      up.removeAttribute('hidden');
    }
  }

  function applyFilters() {
    const q = (($('#verSearch') && $('#verSearch').value) || '').trim().toLowerCase();
    const ft = ($('#verFilterType') && $('#verFilterType').value) || '';
    const fs = ($('#verFilterStatus') && $('#verFilterStatus').value) || '';
    let rows = state.allDocs.slice();

    if (ft) {
      rows = rows.filter((r) => String(r.documentType || '') === ft);
    }
    if (fs) {
      const want = fs.toLowerCase();
      rows = rows.filter((r) => String(r.status || '').toLowerCase() === want);
    }
    if (q) {
      rows = rows.filter((r) => {
        const blob = [
          r.documentType,
          r.description,
          r.status,
          r.fileId,
          r.rejectReason,
          r.aiRejectReason,
          docLabelFromRow(r)
        ]
          .join(' ')
          .toLowerCase();
        return blob.indexOf(q) !== -1;
      });
    }
    state.filtered = rows;
    state.page = 1;
    renderTable();
  }

  function renderTable() {
    const tbody = $('#verTBody');
    const pager = $('#verPager');
    if (!tbody) return;

    const rows = state.filtered;
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
    if (state.page > pages) state.page = pages;
    const start = (state.page - 1) * PAGE_SIZE;
    const slice = rows.slice(start, start + PAGE_SIZE);

    disposeVerificationTableTooltips(tbody);

    if (!total) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="ver-loading">No documents found.</td></tr>';
      if (pager) pager.innerHTML = '';
      return;
    }

    tbody.innerHTML = slice
      .map((r) => {
        const desc = r.description && String(r.description).trim();
        const name = desc || docLabelFromRow(r);
        const cell = shortDocLabelForTableCell(name);
        const nameSpan = cell.useTip
          ? `<span class="ver-doc-name ver-doc-name--tip" tabindex="0" data-bs-toggle="tooltip" data-bs-placement="top" title="${escapeHtml(
              cell.full
            )}">${escapeHtml(cell.display)}</span>`
          : `<span class="ver-doc-name">${escapeHtml(cell.display)}</span>`;
        const thumb = r.thumbnail && String(r.thumbnail).indexOf('data:') === 0 ? r.thumbnail : '';
        const st = statusClass(r.status);
        const badge =
          st === 'approved'
            ? 'ver-badge--approved'
            : st === 'rejected'
              ? 'ver-badge--rejected'
              : 'ver-badge--pending';
        const url = r.url || '';
        const action = url
          ? `<button type="button" class="ver-link-action ver-link-action--doc" data-url="${escapeHtml(
              url
            )}" data-mime="${escapeHtml(r.mimeType || '')}" data-title="${escapeHtml(
              name
            )}">View</button>`
          : '<span class="ver-action-dash">—</span>';
        return `<tr class="ver-history-row">
        <td class="ver-td ver-td--doc">
          <div class="ver-doc-cell">
            <span class="ver-thumb-wrap">${
              thumb
                ? `<img class="ver-thumb" src="${thumb}" alt="" />`
                : '<span class="ver-thumb ver-thumb--empty" aria-hidden="true"></span>'
            }</span>
            ${nameSpan}
          </div>
        </td>
        <td class="ver-td ver-td--uploaded">${formatHistoryUploadedAt(r.createdAt)}</td>
        <td class="ver-td ver-td--status"><span class="ver-badge ${badge}">${escapeHtml(r.status || '—')}</span></td>
        <td class="ver-td ver-td--action">${action}</td>
      </tr>`;
      })
      .join('');

    if (pager) {
      pager.className = 'ver-pager';
      if (pages <= 1) {
        pager.innerHTML = '';
      } else if (typeof window.CP_compactPaginationHtml === 'function') {
        const { html } = window.CP_compactPaginationHtml(total, state.page, PAGE_SIZE, 'ver-page');
        pager.innerHTML = `<div class="dash-pagination ver-dash-pagination">${html}</div>`;
        window.CP_attachDashPagination?.(pager.firstElementChild, 'ver-page', (p) => {
          state.page = p;
          renderTable();
        });
      } else {
        let html = '';
        html +=
          '<button type="button" class="ver-page-btn ver-page-btn--nav" data-p="prev" ' +
          (state.page <= 1 ? 'disabled' : '') +
          ' aria-label="Previous"><span class="ver-page-nav-ico" aria-hidden="true">&lsaquo;</span></button>';
        const pageParts = buildPageParts(state.page, pages);
        pageParts.forEach((part) => {
          if (part === '…') {
            html += '<span class="ver-page-ellipsis" aria-hidden="true">…</span>';
          } else {
            const p = part;
            html +=
              '<button type="button" class="ver-page-btn' +
              (p === state.page ? ' ver-page-btn--active' : '') +
              '" data-page="' +
              p +
              '">' +
              p +
              '</button>';
          }
        });
        html +=
          '<button type="button" class="ver-page-btn ver-page-btn--nav" data-p="next" ' +
          (state.page >= pages ? 'disabled' : '') +
          ' aria-label="Next"><span class="ver-page-nav-ico" aria-hidden="true">&rsaquo;</span></button>';
        pager.innerHTML = html;
        pager.querySelectorAll('[data-page]').forEach((b) => {
          b.addEventListener('click', () => {
            state.page = parseInt(b.getAttribute('data-page'), 10) || 1;
            renderTable();
          });
        });
        const prev = pager.querySelector('[data-p="prev"]');
        const next = pager.querySelector('[data-p="next"]');
        if (prev)
          prev.addEventListener('click', () => {
            if (state.page > 1) {
              state.page--;
              renderTable();
            }
          });
        if (next)
          next.addEventListener('click', () => {
            const maxP = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
            if (state.page < maxP) {
              state.page++;
              renderTable();
            }
          });
      }
    }

    tbody.querySelectorAll('.ver-link-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        const u = btn.getAttribute('data-url');
        if (!u) return;
        const mime = btn.getAttribute('data-mime') || '';
        const docTitle = btn.getAttribute('data-title') || '';
        void openDocumentModal(u, mime, docTitle);
      });
    });

    initVerificationTableTooltips(tbody);
  }

  function mergeSortedPageInts(ints) {
    const arr = Array.from(ints).sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      if (i > 0 && arr[i] - arr[i - 1] > 1) out.push('…');
      out.push(arr[i]);
    }
    return out;
  }

  /** Fewer page chips on small screens (avoids ‹ 1 2 3 4 5 … 10 › clipping). */
  function isNarrowVerificationPager() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches;
  }

  let verPagerNarrowMqlBound = false;
  function bindVerPagerNarrowMql() {
    if (verPagerNarrowMqlBound || typeof window.matchMedia !== 'function') return;
    verPagerNarrowMqlBound = true;
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = () => {
      const hi = $('#verPanelHistory');
      if (!hi || hi.hasAttribute('hidden')) return;
      if (!state.filtered.length) return;
      renderTable();
    };
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else if (typeof mq.addListener === 'function') mq.addListener(onChange);
  }

  /**
   * Wide: first, last, current ±2.
   * Narrow (≤768px, total > 5): at most three page values — ‹ 1 2 … N ›, ‹ 1 … N-1 N ›, or ‹ 1 … c … N › (fits ~320px).
   */
  function buildPageParts(current, total) {
    if (total <= 1) return [1];
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (isNarrowVerificationPager()) {
      let s;
      if (current <= 2) {
        s = new Set([1, 2, total]);
      } else if (current >= total - 1) {
        s = new Set([1, total - 1, total]);
      } else {
        s = new Set([1, current, total]);
      }
      return mergeSortedPageInts(s);
    }
    const neighbor = 2;
    const nums = new Set([1, total]);
    for (let i = current - neighbor; i <= current + neighbor; i++) {
      if (i >= 1 && i <= total) nums.add(i);
    }
    return mergeSortedPageInts(nums);
  }

  function fillTypeFilter() {
    const sel = $('#verFilterType');
    if (!sel) return;
    const prev = sel.value;
    const types = new Set();
    state.allDocs.forEach((r) => {
      if (r.documentType) types.add(r.documentType);
    });
    const arr = Array.from(types).sort();
    sel.innerHTML =
      '<option value="">All Document Types</option>' +
      arr
        .map((t) => {
          const lab = humanizeDocumentTypeLabel(t);
          return '<option value="' + escapeHtml(t) + '">' + escapeHtml(lab) + '</option>';
        })
        .join('');
    if (prev === '' || arr.indexOf(prev) !== -1) {
      sel.value = prev;
    } else {
      sel.value = '';
    }
  }

  async function loadHistory(silent) {
    const tbody = $('#verTBody');
    if (tbody && !silent) {
      tbody.innerHTML = '<tr><td colspan="4" class="ver-loading">Loading…</td></tr>';
    }
    try {
      const res = await fetch(ALL_URL, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      const j = await res.json();
      if (!res.ok || j.status === 'error') throw new Error(j.message || 'Failed to load');
      state.allDocs = Array.isArray(j.data) ? j.data : [];
      fillTypeFilter();
      applyFilters();
    } catch (e) {
      if (tbody) {
        tbody.innerHTML =
          '<tr><td colspan="4" class="ver-loading text-danger">' +
          escapeHtml(e.message || 'Error') +
          '</td></tr>';
      }
    }
  }

  function init() {
    const root = $('#verRoot');
    if (!root || root.getAttribute('data-ver-inited') === '1') return;
    root.setAttribute('data-ver-inited', '1');

    $('#verBtnSubmit') && $('#verBtnSubmit').addEventListener('click', onSubmit);

    $('#verBtnGoHistory') &&
      $('#verBtnGoHistory').addEventListener('click', () => {
        togglePanel('history');
        loadHistory(false);
      });
    $('#verBtnGoUpload') &&
      $('#verBtnGoUpload').addEventListener('click', () => togglePanel('upload'));

    $('#verCatBtn') &&
      $('#verCatBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = $('#verCatMenu');
        const btn = $('#verCatBtn');
        if (!menu || !btn) return;
        const open = menu.hasAttribute('hidden');
        if (open) {
          menu.removeAttribute('hidden');
          btn.setAttribute('aria-expanded', 'true');
        } else {
          menu.setAttribute('hidden', 'hidden');
          btn.setAttribute('aria-expanded', 'false');
        }
      });

    document.querySelectorAll('.ver-cat-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const cat = opt.getAttribute('data-cat');
        if (cat) setCat(cat);
        const menu = $('#verCatMenu');
        const btn = $('#verCatBtn');
        if (menu) menu.setAttribute('hidden', 'hidden');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', () => {
      const menu = $('#verCatMenu');
      const btn = $('#verCatBtn');
      if (menu && !menu.hasAttribute('hidden')) {
        menu.setAttribute('hidden', 'hidden');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });

    $('#verSearch') &&
      $('#verSearch').addEventListener('input', () => {
        applyFilters();
      });
    $('#verFilterType') &&
      $('#verFilterType').addEventListener('change', () => {
        applyFilters();
      });
    $('#verFilterStatus') &&
      $('#verFilterStatus').addEventListener('change', () => {
        applyFilters();
      });

    bindFilePreview('verFileInput', 'verFileName', 'verPreviewInner');

    ['verDropSingle'].forEach((wrapId) => {
      const wrap = document.getElementById(wrapId);
      if (!wrap) return;
      const zone = wrap.querySelector('.ver-drop-zone');
      const inp = wrap.querySelector('.ver-file-input');
      if (!zone || !inp) return;
      ;['dragenter', 'dragover'].forEach((ev) => {
        zone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.add('dragover');
        });
      });
      ;['dragleave', 'drop'].forEach((ev) => {
        zone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.remove('dragover');
        });
      });
      zone.addEventListener('drop', (e) => {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || !files[0]) return;
        inp.files = files;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    injectCatMenuIcons();
    setCat('identity');
    fillPreviewPlaceholders();
    bindVerPagerNarrowMql();
  }

  window.CP_tabs.verification = function () {
    init();
  };

  window.CP_onViewShow.verification = function () {
    init();
    loadHistory(true);
  };
})();
