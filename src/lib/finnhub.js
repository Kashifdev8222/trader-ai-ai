/* ============================================================
   Shared Finnhub API client — rate-limited, deduplicated, cached.
   ALL Finnhub calls MUST go through this file.
   ============================================================ */

const PROXY = '/api/finnhub';
const GAP_MS = 3000;        // gap between requests (respects free-tier limits)
const CACHE_TTL_MS = 300000; // localStorage cache TTL (5 minutes)
const CACHE_KEY = 'finnhub_cache';

/* ---------- in-memory dedup + localStorage cache ---------- */
const memCache = new Map();         // in-flight dedup
const lsCache = loadLSCache();

function loadLSCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Date.now() - data.ts < CACHE_TTL_MS) return new Map(Object.entries(data.store));
    }
  } catch (e) { /* ignore */ }
  return new Map();
}

function saveLSCache() {
  try {
    const obj = Object.fromEntries(lsCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ store: obj, ts: Date.now() }));
  } catch (e) { /* ignore */ }
}

/* ---------- request queue ---------- */
let queue = [];
let busy = false;

async function pump() {
  if (busy || queue.length === 0) return;
  busy = true;
  while (queue.length > 0) {
    const { endpoint, symbol, resolve, reject } = queue.shift();
    try {
      const url = `${PROXY}?endpoint=${encodeURIComponent(endpoint)}&symbol=${encodeURIComponent(symbol)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      resolve(data);
    } catch (err) {
      reject(err);
    }
    // respect gap between requests
    if (queue.length > 0) await sleep(GAP_MS);
  }
  busy = false;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Fetch Finnhub data — deduplicated, queued, cached.
 * @param {string} endpoint  e.g. 'quote', 'stock/profile2'
 * @param {string} symbol    e.g. 'AAPL', 'BINANCE:BTCUSDT'
 * @returns {Promise<any>}
 */
export function finnhubFetch(endpoint, symbol) {
  const cacheKey = `${endpoint}:${symbol}`;

  // 1. in-memory dedup (already in-flight)
  if (memCache.has(cacheKey)) return memCache.get(cacheKey);

  // 2. localStorage cache
  if (lsCache.has(cacheKey)) {
    const entry = lsCache.get(cacheKey);
    if (Date.now() - entry.ts < CACHE_TTL_MS) return Promise.resolve(entry.data);
    lsCache.delete(cacheKey); // expired
  }

  // 3. enqueue
  const promise = new Promise((resolve, reject) => {
    queue.push({ endpoint, symbol, resolve, reject });
    pump();
  }).then(data => {
    // store in caches
    lsCache.set(cacheKey, { data, ts: Date.now() });
    saveLSCache();
    memCache.delete(cacheKey);
    return data;
  }).catch(err => {
    memCache.delete(cacheKey);
    // On rate limit or network error, try stale cache
    const stale = lsCache.get(cacheKey);
    if (stale) {
      console.warn(`[finnhub] ${cacheKey} failed, using stale cache (${Math.round((Date.now() - stale.ts)/1000)}s old)`);
      return stale.data;
    }
    throw err;
  });

  memCache.set(cacheKey, promise);
  return promise;
}

/**
 * Fetch quotes for multiple symbols (convenience wrapper).
 * Returns an object keyed by symbol.
 */
export async function finnhubQuotes(symbols) {
  const results = {};
  for (const s of symbols) {
    try {
      const data = await finnhubFetch('quote', s);
      if (data && data.c !== undefined) {
        results[s] = { c: data.c, dp: data.dp, h: data.h, l: data.l, o: data.o };
      }
    } catch (e) {
      // skip failed symbols
    }
  }
  return results;
}
