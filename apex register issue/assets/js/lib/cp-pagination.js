/**
 * Shared compact pagination (same rules as Dashboard → Home → Recent Transactions):
 * ≤5 pages: show all; else near start 1 2 3 … last; near end 1 … n−2 n−1 n; middle 1 … cur … last.
 * Uses global .dash-page-btn / .dash-pagination tokens from home.tab.css.
 */
(function (global) {
  'use strict';

  function dataAttrName(dataKey) {
    const dk = String(dataKey || 'p').trim();
    return dk.indexOf('data-') === 0 ? dk : 'data-' + dk;
  }

  /**
   * @param {number} total - total row count
   * @param {number} page - current page (1-based)
   * @param {number} pageSize
   * @param {string} [dataKey] - e.g. 'p', 'wd-p', 'hist-page', 'tap', 'sup-page', 'ver-page'
   * @returns {{ html: string, pages: number, cur: number }}
   */
  function compactPaginationHtml(total, page, pageSize, dataKey) {
    const sz = Math.max(1, Number(pageSize) || 10);
    const tot = Math.max(0, Number(total) || 0);
    const pages = Math.max(1, Math.ceil(tot / sz));
    const cur = Math.min(Math.max(1, Number(page) || 1), pages);
    const attr = dataAttrName(dataKey);

    let html = '';
    html +=
      '<button type="button" class="dash-page-btn dash-page-btn--arrow"' +
      (cur <= 1 ? ' disabled' : '') +
      ' ' +
      attr +
      '="' +
      (cur - 1) +
      '" aria-label="Previous">&lt;</button>';

    const ell = '<span class="dash-page-ellipsis" aria-hidden="true">…</span>';

    function btn(p) {
      return (
        '<button type="button" class="dash-page-btn' +
        (p === cur ? ' is-active' : '') +
        '" ' +
        attr +
        '="' +
        p +
        '">' +
        p +
        '</button>'
      );
    }

    if (pages <= 5) {
      for (let pi = 1; pi <= pages; pi++) html += btn(pi);
    } else if (cur <= 3) {
      html += btn(1) + btn(2) + btn(3) + ell + btn(pages);
    } else if (cur >= pages - 2) {
      html += btn(1) + ell + btn(pages - 2) + btn(pages - 1) + btn(pages);
    } else {
      html += btn(1) + ell + btn(cur) + ell + btn(pages);
    }

    html +=
      '<button type="button" class="dash-page-btn dash-page-btn--arrow"' +
      (cur >= pages ? ' disabled' : '') +
      ' ' +
      attr +
      '="' +
      (cur + 1) +
      '" aria-label="Next">&gt;</button>';

    return { html, pages, cur };
  }

  /**
   * @param {Element} root - container that holds the buttons (e.g. .dash-pagination)
   * @param {string} dataKey - same as compactPaginationHtml
   * @param {(page: number) => void} onPage
   */
  function attachDashPagination(root, dataKey, onPage) {
    if (!root || typeof onPage !== 'function') return;
    const attr = dataAttrName(dataKey);
    const sel = '.dash-page-btn[' + attr + ']';
    root.querySelectorAll(sel).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const v = parseInt(btn.getAttribute(attr), 10);
        if (!Number.isNaN(v)) onPage(v);
      });
    });
  }

  global.CP_compactPaginationHtml = compactPaginationHtml;
  global.CP_attachDashPagination = attachDashPagination;
})(typeof window !== 'undefined' ? window : globalThis);
