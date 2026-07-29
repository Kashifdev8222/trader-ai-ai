// assets/js/tabs/analysis-embed.tab.js — Technical / Economic Calendar / News (lazy-loaded once for all three)
(function () {
  window.CP_tabs = window.CP_tabs || {};

  const URLS = {
    'analysis-technical': 'https://www.investing.com/technical/technical-analysis',
    'analysis-calendar': 'https://www.investing.com/economic-calendar/',
    'analysis-news': 'https://www.investing.com/news'
  };

  const TITLES = {
    'analysis-technical': 'Technical Analysis',
    'analysis-calendar': 'Economic Calendar',
    'analysis-news': 'News'
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function makeInit(viewName) {
    return function () {
      const section = document.querySelector(`section.view[data-view="${viewName}"]`);
      if (!section || section.dataset.cpEmbedReady === '1') return;

      const url = URLS[viewName];
      const title = TITLES[viewName] || viewName;
      if (!url) return;

      section.innerHTML = `
        <div class="cp-embed-wrap">
          <div class="cp-embed-toolbar">
            <span class="cp-embed-title">${escapeHtml(title)}</span>
            <a class="cp-embed-external" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Open in new tab</a>
          </div>
          <div class="cp-embed-frame-wrap">
            <iframe class="cp-embed-frame" src="${escapeAttr(url)}" title="${escapeAttr(title)}" referrerpolicy="no-referrer-when-downgrade" loading="lazy"></iframe>
          </div>
        </div>`;

      section.dataset.cpEmbedReady = '1';
    };
  }

  ['analysis-technical', 'analysis-calendar', 'analysis-news'].forEach((name) => {
    window.CP_tabs[name] = makeInit(name);
  });
})();
