<?php
declare(strict_types=1);

/**
 * Canonical URL paths for auth screens and dashboard tabs (data-view values).
 * Keep in sync with assets/js/cp-router.js
 */

/** @var array<string, string> data-view => path after /dashboard (empty = home) */
const CP_DASHBOARD_VIEW_PATHS = [
    'home' => '',
    'trading-account' => 'trading-account',
    'deposit' => 'deposit',
    'withdraw' => 'withdraw',
    'verification' => 'verification',
    'analysis-technical' => 'analysis/technical',
    'analysis-calendar' => 'analysis/economic-calendar',
    'analysis-news' => 'analysis/news',
    'ai-setting' => 'ai-settings',
    'web-trader' => 'web-trader',
    'settings-profile' => 'settings/profile',
    'settings-questionnaire' => 'settings/questionnaire',
    'support' => 'support',
    'help' => 'help',
];

/** @var array<string, string> auth screen key => path segment(s) without leading slash */
const CP_AUTH_VIEW_PATHS = [
    'login' => 'login',
    'register' => 'register',
    'forgot' => 'forgot-password',
];

function cp_normalize_path(string $path): string
{
    $path = '/' . trim(str_replace('\\', '/', $path), '/');
    if ($path === '/') {
        return '/';
    }
    return rtrim($path, '/');
}

/** @return array<string, string> slug/path => data-view */
function cp_dashboard_path_to_view_map(): array
{
    static $map = null;
    if ($map !== null) {
        return $map;
    }
    $map = [];
    foreach (CP_DASHBOARD_VIEW_PATHS as $view => $slug) {
        $key = $slug === '' ? '' : $slug;
        $map[$key] = $view;
    }
    return $map;
}

/** @return array<string, string> path => auth view key */
function cp_auth_path_to_view_map(): array
{
    static $map = null;
    if ($map !== null) {
        return $map;
    }
    $map = [];
    foreach (CP_AUTH_VIEW_PATHS as $view => $slug) {
        $map[$slug] = $view;
        $map['auth/' . $slug] = $view;
    }
    return $map;
}

function cp_dashboard_path_for_view(string $view): string
{
    $view = strtolower(trim($view));
    $slug = CP_DASHBOARD_VIEW_PATHS[$view] ?? null;
    if ($slug === null) {
        return '/dashboard';
    }
    if ($slug === '') {
        return '/dashboard';
    }
    return '/dashboard/' . $slug;
}

function cp_auth_path_for_view(string $view): string
{
    $view = strtolower(trim($view));
    $slug = CP_AUTH_VIEW_PATHS[$view] ?? 'login';
    return '/' . $slug;
}

function cp_dashboard_view_from_path(string $path): ?string
{
    $path = cp_normalize_path($path);
    if ($path === '/dashboard') {
        return 'home';
    }
    if (!str_starts_with($path, '/dashboard/')) {
        return null;
    }
    $suffix = substr($path, strlen('/dashboard/'));
    $map = cp_dashboard_path_to_view_map();
    return $map[$suffix] ?? null;
}

function cp_auth_view_from_path(string $path): ?string
{
    $path = cp_normalize_path($path);
    if ($path === '/') {
        return 'login';
    }
    $segment = ltrim($path, '/');
    $map = cp_auth_path_to_view_map();
    return $map[$segment] ?? null;
}

function cp_dashboard_view_from_request(): string
{
    if (!empty($_GET['cp_view']) && is_string($_GET['cp_view'])) {
        $v = strtolower(trim($_GET['cp_view']));
        if (array_key_exists($v, CP_DASHBOARD_VIEW_PATHS)) {
            return $v;
        }
    }
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (!is_string($path)) {
        return 'home';
    }
    $view = cp_dashboard_view_from_path($path);
    return $view ?? 'home';
}

function cp_auth_view_from_request(): string
{
    if (!empty($_GET['cp_auth']) && is_string($_GET['cp_auth'])) {
        $v = strtolower(trim($_GET['cp_auth']));
        if (array_key_exists($v, CP_AUTH_VIEW_PATHS)) {
            return $v;
        }
    }
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (!is_string($path)) {
        return 'login';
    }
    $view = cp_auth_view_from_path($path);
    return $view ?? 'login';
}

function cp_redirect_if_logged_in(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (!empty($_SESSION['cp_token']) && !empty($_SESSION['cp_user'])) {
        header('Location: /dashboard', true, 302);
        exit;
    }
}
