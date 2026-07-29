/**
 * Reset password — login-style UI; POST token + newPassword via api/auth/resetpass.php
 */
(function () {
  'use strict';

  function makeShowHide(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const to = input.type === 'password' ? 'text' : 'password';
      input.type = to;
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
      }
      btn.setAttribute('aria-label', (to === 'text' ? 'Hide ' : 'Show ') + 'password');
    });
  }

  makeShowHide('toggleNewPwd', 'newPassword');
  makeShowHide('toggleConfirmPwd', 'confirmPassword');

  const form = document.getElementById('resetPassForm');
  if (!form) return;

  const msg = document.getElementById('resetPassMsg');
  const submitBtn = document.getElementById('resetPassSubmit');
  const newPassEl = document.getElementById('newPassword');
  const confirmPassEl = document.getElementById('confirmPassword');

  function setMsg(text, type) {
    if (!msg) return;
    msg.textContent = text || '';
    msg.className = 'auth-form-feedback tiny text-center';
    if (type === 'error') msg.classList.add('auth-form-feedback--error');
    if (type === 'success') msg.classList.add('text-success');
    if (type === 'muted') msg.classList.add('text-muted');
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? 'Resetting…' : 'Reset my password';
    }
    if (newPassEl) newPassEl.disabled = loading;
    if (confirmPassEl) confirmPassEl.disabled = loading;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMsg('');

    const newPass = newPassEl?.value || '';
    const confirmPass = confirmPassEl?.value || '';
    const token = document.getElementById('resetToken')?.value?.trim() || '';

    if (!token) {
      setMsg('Invalid or missing reset token.', 'error');
      return;
    }
    if (!newPass || newPass.length < 8) {
      setMsg('Password must be at least 8 characters.', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      setMsg('Password and confirmation must match.', 'error');
      return;
    }

    setLoading(true);
    setMsg('Updating your password…', 'muted');

    try {
      const res = await fetch('api/auth/resetpass.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token, newPassword: newPass }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.status === 'error') {
        setMsg(data.message || 'Password reset failed. Try again or request a new link.', 'error');
        setLoading(false);
        return;
      }

      setMsg(data.message || 'Password updated successfully. Redirecting to sign in…', 'success');
      form.querySelectorAll('input[type="password"], input[type="text"]').forEach((inp) => {
        if (inp.id === 'resetToken' || inp.id === 'resetLang') return;
        inp.value = '';
      });

      setTimeout(() => {
        window.location.href = '/login';
      }, 2800);
    } catch (err) {
      setMsg('Network error. Please check your connection and try again.', 'error');
      setLoading(false);
    }
  });
})();
