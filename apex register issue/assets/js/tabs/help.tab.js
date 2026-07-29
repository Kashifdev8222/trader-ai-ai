// assets/js/tabs/help.tab.js — Help + open Replain via ReplainAPI('open')
window.CP_tabs = window.CP_tabs || {};

window.CP_tabs.help = function () {
  const section = document.querySelector('section.view[data-view="help"]');
  if (!section || section.dataset.cpEmbedReady === '1') return;

  section.innerHTML = `
    <div class="cp-embed-wrap cp-embed-wrap--help">
      <div class="cp-embed-toolbar">
        <span class="cp-embed-title">Help</span>
      </div>
      <div class="cp-embed-frame-wrap cp-embed-frame-wrap--help-launch">
        <div class="cp-help-launch-card">
          <h2 class="cp-help-launch__heading">Live support</h2>
          <p class="cp-help-launch__lead">
            Message us directly — same chat as everywhere in this portal.
          </p>
          <button type="button" class="btn btn-primary cp-help-launch__open" id="cpHelpOpenChat" aria-label="Open live chat">
            <i class="bi bi-chat-dots-fill me-2" aria-hidden="true"></i>Open live chat
          </button>
          <p id="cpHelpChatStatus" class="cp-help-launch__status" role="status" aria-live="polite"></p>
          <p class="cp-help-launch__hint">
            You can keep browsing; the conversation stays open when you switch tabs.
          </p>
        </div>
      </div>
    </div>`;

  section.querySelector('#cpHelpOpenChat')?.addEventListener('click', () => {
    const statusEl = section.querySelector('#cpHelpChatStatus');
    if (window.CP_replain) {
      window.CP_replain.openWhenReady({
        onStatus: (msg) => {
          if (statusEl) statusEl.textContent = msg;
        },
      });
    }
  });

  section.dataset.cpEmbedReady = '1';
};
