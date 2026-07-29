/**
 * Replain live chat — shared by dashboard Help tab and auth pages (/login#help).
 * API: ReplainAPI('open') after widget script loads (https://replain.cc)
 */
(function (global) {
  'use strict';

  function openReplainChatWindow() {
    if (typeof global.ReplainAPI === 'function') {
      try {
        global.ReplainAPI('open');
        return true;
      } catch (e) {
        /* ignore */
      }
    }
    return false;
  }

  /** True when URL hash requests live chat on login/register/forgot pages. */
  function authHashIsHelp() {
    const h = String(global.location.hash || '').trim().toLowerCase();
    return h === '#help' || h === '#/help';
  }

  /**
   * Poll until ReplainAPI is available, then open the chat panel.
   * @param {{ onStatus?: (msg: string) => void, maxAttempts?: number }} [opts]
   */
  function openWhenReady(opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    const onStatus = typeof options.onStatus === 'function' ? options.onStatus : null;
    const maxAttempts = Math.max(10, parseInt(String(options.maxAttempts || 50), 10) || 50);

    if (openReplainChatWindow()) {
      if (onStatus) onStatus('');
      return;
    }
    if (onStatus) onStatus('Opening chat…');

    let attempts = 0;
    const id = setInterval(() => {
      attempts++;
      if (openReplainChatWindow()) {
        clearInterval(id);
        if (onStatus) onStatus('');
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(id);
        if (onStatus) {
          onStatus('Chat could not start yet. Tap the chat icon in the corner.');
        }
      }
    }, 100);
  }

  function openAuthHelpChatIfRequested() {
    if (!authHashIsHelp()) return;
    openWhenReady();
  }

  global.CP_replain = {
    open: openReplainChatWindow,
    openWhenReady,
    authHashIsHelp,
    openAuthHelpChatIfRequested,
  };
})(typeof window !== 'undefined' ? window : globalThis);
