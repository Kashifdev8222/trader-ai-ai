/**
 * Client-side URL router — keep path maps in sync with lib/cp_routes.php
 */
(function (global) {
  'use strict';

  const DASHBOARD_VIEW_PATHS = {
    home: '',
    'trading-account': 'trading-account',
    deposit: 'deposit',
    withdraw: 'withdraw',
    verification: 'verification',
    'analysis-technical': 'analysis/technical',
    'analysis-calendar': 'analysis/economic-calendar',
    'analysis-news': 'analysis/news',
    'ai-setting': 'ai-settings',
    'web-trader': 'web-trader',
    'settings-profile': 'settings/profile',
    'settings-questionnaire': 'settings/questionnaire',
    support: 'support',
    help: 'help',
  };

  const AUTH_VIEW_PATHS = {
    login: 'login',
    register: 'register',
    forgot: 'forgot-password',
  };

  const dashboardPathToView = Object.create(null);
  Object.keys(DASHBOARD_VIEW_PATHS).forEach((view) => {
    const slug = DASHBOARD_VIEW_PATHS[view];
    dashboardPathToView[slug === '' ? '' : slug] = view;
  });

  const authPathToView = Object.create(null);
  Object.keys(AUTH_VIEW_PATHS).forEach((view) => {
    const slug = AUTH_VIEW_PATHS[view];
    authPathToView[slug] = view;
    authPathToView['auth/' + slug] = view;
  });

  function normalizePath(path) {
    let p = String(path || '').trim();
    if (!p) return '/';
    p = p.split('?')[0].split('#')[0];
    if (!p.startsWith('/')) p = '/' + p;
    if (p !== '/' && p.endsWith('/')) p = p.replace(/\/+$/, '');
    return p || '/';
  }

  function dashboardPathForView(view) {
    const key = String(view || 'home').trim().toLowerCase();
    const slug = Object.prototype.hasOwnProperty.call(DASHBOARD_VIEW_PATHS, key)
      ? DASHBOARD_VIEW_PATHS[key]
      : '';
    if (!slug) return '/dashboard';
    return '/dashboard/' + slug;
  }

  function authPathForView(view) {
    const key = String(view || 'login').trim().toLowerCase();
    const slug = AUTH_VIEW_PATHS[key] || AUTH_VIEW_PATHS.login;
    return '/' + slug;
  }

  function dashboardViewFromPath(path) {
    const p = normalizePath(path);
    if (p === '/dashboard') return 'home';
    if (!p.startsWith('/dashboard/')) return null;
    const suffix = p.slice('/dashboard/'.length);
    return dashboardPathToView[suffix] || null;
  }

  function authViewFromPath(path) {
    const p = normalizePath(path);
    if (p === '/') return 'login';
    const segment = p.replace(/^\//, '');
    return authPathToView[segment] || null;
  }

  /** Site root URL for resolving api/ and assets/ (independent of /dashboard/... path). */
  function siteBaseUrl() {
    return global.location.origin + '/';
  }

  function resolveFromSiteRoot(relativePath) {
    return new URL(String(relativePath || '').replace(/^\//, ''), siteBaseUrl()).href;
  }

  function fetchSiteText(relativePath) {
    const base = resolveFromSiteRoot(relativePath);
    const url = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'v=' + Date.now();
    return fetch(url, { credentials: 'same-origin' }).then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    });
  }

  function pushUrl(path, replace) {
    const next = normalizePath(path);
    const current = normalizePath(global.location.pathname);
    if (next === current) return;
    const state = { cpRoute: next };
    if (replace) {
      global.history.replaceState(state, '', next + global.location.search);
    } else {
      global.history.pushState(state, '', next + global.location.search);
    }
  }

  const CP_ROUTER = {
    DASHBOARD_VIEW_PATHS,
    AUTH_VIEW_PATHS,
    siteBaseUrl,
    resolveFromSiteRoot,
    fetchSiteText,
    normalizePath,
    dashboardPathForView,
    authPathForView,
    dashboardViewFromPath,
    authViewFromPath,
    navigateDashboard(view, replace) {
      pushUrl(dashboardPathForView(view), !!replace);
    },
    navigateAuth(view, replace) {
      pushUrl(authPathForView(view), !!replace);
    },
  };

  global.CP_ROUTER = CP_ROUTER;
  global.CP_fetchView = fetchSiteText;
})(typeof window !== 'undefined' ? window : globalThis);
