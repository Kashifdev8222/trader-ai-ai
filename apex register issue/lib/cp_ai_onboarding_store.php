<?php
/**
 * AI dashboard onboarding completion — one registry file for all users:
 *   data/cp_ai_onboarding/completions.json
 * Shape: { "<userId>": { "completed": true, "userId": "...", "completedAt": "...", ... }, ... }
 * Uses exclusive file locking so concurrent logins do not corrupt the file.
 *
 * Legacy: older installs used one file per user ({safeId}.json). Still honored for reads;
 * new completions only update the registry (and remove that user's legacy file if present).
 */

function cp_ai_onboarding_data_dir(): string
{
    $d = dirname(__DIR__) . '/data/cp_ai_onboarding';
    if (!is_dir($d)) {
        @mkdir($d, 0755, true);
    }
    return $d;
}

function cp_ai_onboarding_registry_path(): string
{
    return cp_ai_onboarding_data_dir() . '/completions.json';
}

/** @deprecated Old per-user filename (read-only + delete after migrate). */
function cp_ai_onboarding_legacy_file_path($userId): string
{
    $safe = preg_replace('/[^a-zA-Z0-9_-]/', '_', (string)$userId);
    $safe = $safe !== '' ? $safe : '_empty';
    return cp_ai_onboarding_data_dir() . '/' . $safe . '.json';
}

/**
 * Read registry with a shared lock (short read).
 *
 * @return array<string,array<string,mixed>>
 */
function cp_ai_onboarding_read_registry(): array
{
    $path = cp_ai_onboarding_registry_path();
    if (!is_file($path)) {
        return [];
    }
    $fh = @fopen($path, 'rb');
    if (!$fh) {
        return [];
    }
    if (!flock($fh, LOCK_SH)) {
        fclose($fh);
        return [];
    }
    $raw = stream_get_contents($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $j = json_decode($raw, true);
    if (!is_array($j)) {
        return [];
    }
    // Reject JSON arrays so we do not treat [] as user rows
    if ($j !== [] && array_keys($j) === range(0, count($j) - 1)) {
        return [];
    }
    return $j;
}

function cp_ai_onboarding_legacy_read_completed($userId): bool
{
    if ($userId === null || (string)$userId === '') {
        return false;
    }
    $path = cp_ai_onboarding_legacy_file_path($userId);
    if (!is_file($path)) {
        return false;
    }
    $raw = @file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return false;
    }
    $j = json_decode($raw, true);
    return is_array($j) && !empty($j['completed']);
}

function cp_ai_onboarding_is_completed($userId): bool
{
    if ($userId === null || (string)$userId === '') {
        return false;
    }
    $key = (string)$userId;
    $reg = cp_ai_onboarding_read_registry();
    if (!empty($reg[$key]['completed'])) {
        return true;
    }
    return cp_ai_onboarding_legacy_read_completed($userId);
}

/**
 * @return array<string,mixed>
 */
function cp_ai_onboarding_read($userId): array
{
    if ($userId === null || (string)$userId === '') {
        return [];
    }
    $key = (string)$userId;
    $reg = cp_ai_onboarding_read_registry();
    if (!empty($reg[$key]) && is_array($reg[$key])) {
        return $reg[$key];
    }
    if (cp_ai_onboarding_legacy_read_completed($userId)) {
        $path = cp_ai_onboarding_legacy_file_path($userId);
        $raw = @file_get_contents($path);
        $j = is_string($raw) ? json_decode($raw, true) : null;
        return is_array($j) ? $j : [];
    }
    return [];
}

function cp_ai_onboarding_mark_completed($userId, array $extra = []): bool
{
    if ($userId === null || (string)$userId === '') {
        return false;
    }
    $key = (string)$userId;
    $path = cp_ai_onboarding_registry_path();
    cp_ai_onboarding_data_dir();

    $fh = @fopen($path, 'c+');
    if (!$fh) {
        return false;
    }
    if (!flock($fh, LOCK_EX)) {
        fclose($fh);
        return false;
    }

    $raw = stream_get_contents($fh);
    $reg = [];
    if (is_string($raw) && trim($raw) !== '') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded) && ($decoded === [] || array_keys($decoded) !== range(0, count($decoded) - 1))) {
            $reg = $decoded;
        }
    }

    $reg[$key] = array_merge(
        [
            'completed' => true,
            'userId' => $key,
            'completedAt' => gmdate('c'),
        ],
        $extra
    );

    $json = json_encode($reg, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        flock($fh, LOCK_UN);
        fclose($fh);
        return false;
    }

    if (!rewind($fh) || !ftruncate($fh, 0) || fwrite($fh, $json) === false) {
        flock($fh, LOCK_UN);
        fclose($fh);
        return false;
    }
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);

    @unlink(cp_ai_onboarding_legacy_file_path($userId));

    return true;
}
