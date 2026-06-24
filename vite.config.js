import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const FINNHUB_KEY = 'd8shhd1r01qq7apvngggd8shhd1r01qq7apvngh0';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'finnhub-cache-proxy',
      configureServer(server) {
        const cache = new Map();
        const CACHE_TTL = 60000; // 60 seconds in-memory cache

        server.middlewares.use('/api/finnhub', async (req, res) => {
          const url = new URL(req.url, 'http://localhost');
          const endpoint = url.searchParams.get('endpoint') || 'quote';
          const symbol = url.searchParams.get('symbol') || 'AAPL';
          const cacheKey = `${endpoint}:${symbol}`;

          // Serve from cache if fresh
          const cached = cache.get(cacheKey);
          if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Cache', 'HIT');
            res.end(JSON.stringify(cached.data));
            return;
          }

          try {
            const finnhubUrl = `https://finnhub.io/api/v1/${endpoint}?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`;
            const response = await fetch(finnhubUrl);

            if (response.status === 429) {
              // Rate limited — serve stale cache if available, else error
              if (cached) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('X-Cache', 'STALE');
                res.end(JSON.stringify(cached.data));
                return;
              }
              res.statusCode = 429;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ error: 'Rate limited — retry soon' }));
              return;
            }

            const data = await response.json();
            cache.set(cacheKey, { data, ts: Date.now() });

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Cache', 'MISS');
            res.end(JSON.stringify(data));
          } catch (err) {
            // Network error — serve stale if available
            if (cached) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('X-Cache', 'STALE');
              res.end(JSON.stringify(cached.data));
              return;
            }
            res.statusCode = 502;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: 'Proxy error' }));
          }
        });
      },
    },
  ],
})
