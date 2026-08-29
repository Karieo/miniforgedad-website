// ── TICKER NEWS FEED ──────────────────────────────────────────────────────────
// Fetches the RSS feeds listed in ticker-data.js and returns their headlines.
//
// WHY SERVER-SIDE: the ticker used to call api.rss2json.com from the browser to
// get around CORS. That endpoint is rate-limited without an API key, and once
// it starts refusing, the old code silently produced zero headlines — the
// ticker looked fine while showing no news at all. Fetching here removes the
// CORS problem, the third-party dependency and the rate limit, and lets a
// failing feed be reported instead of swallowed.
//
// No configuration needed — no key, no env vars.
//
// Returns { headlines: [...], feeds: [{ name, ok, count, error }] } so the
// admin page can show which feed is broken.

const TICKER_URL = 'ticker-data.js';   // read from the deployed site, same origin

const CACHE_SECONDS = 600;   // 10 min; feeds don't move faster than that

const reply = (statusCode, body, cache = CACHE_SECONDS) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': `public, max-age=60, s-maxage=${cache}`,
  },
  body: JSON.stringify(body),
});

const decode = s => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#8217;|&rsquo;/g, '’')
  .replace(/&#8216;|&lsquo;/g, '‘')
  .replace(/&#8230;|&hellip;/g, '…')
  .replace(/&#8211;|&ndash;/g, '–')
  .replace(/&#8212;|&mdash;/g, '—')
  .replace(/&amp;/g, '&')          // last, so the above aren't double-decoded
  .replace(/<[^>]+>/g, '')         // strip any stray markup
  .replace(/\s+/g, ' ')
  .trim();

// Handles both RSS (<item><title>) and Atom (<entry><title>).
function titlesFrom(xml, limit) {
  const out = [];
  const entries = xml.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) || [];
  for (const entry of entries) {
    const m = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!m) continue;
    const title = decode(m[1]);
    if (title) out.push(title);
    if (out.length >= limit) break;
  }
  return out;
}

async function readConfig(origin) {
  const res = await fetch(`${origin}/${TICKER_URL}`, { headers: { Accept: 'text/javascript' } });
  if (!res.ok) throw new Error(`ticker-data.js ${res.status}`);
  const src = await res.text();
  const m = src.match(/const TICKER_DATA = ([\s\S]*);\s*$/);
  if (!m) throw new Error('ticker-data.js is not in the expected shape');
  return JSON.parse(m[1]);
}

exports.handler = async (event) => {
  const proto  = event.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${event.headers.host}`;

  let config;
  try {
    config = await readConfig(origin);
  } catch (err) {
    return reply(200, { headlines: [], feeds: [], error: String(err.message || err) }, 60);
  }

  const perFeed = Math.max(1, Math.min(10, config.headlinesPerFeed || 3));
  const feeds   = (config.newsFeeds || []).filter(f => f && f.enabled && f.url);

  const results = await Promise.all(feeds.map(async feed => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          // Some feeds refuse a request with no User-Agent.
          'User-Agent': 'miniforgedad-ticker/1.0 (+https://miniforgedad.com)',
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        },
      });
      if (!res.ok) return { name: feed.name, ok: false, count: 0, error: `HTTP ${res.status}` };
      const titles = titlesFrom(await res.text(), perFeed);
      if (!titles.length) return { name: feed.name, ok: false, count: 0, error: 'no items found' };
      return { name: feed.name, ok: true, count: titles.length, titles };
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'timed out' : (err.message || 'unreachable');
      return { name: feed.name, ok: false, count: 0, error: msg };
    } finally {
      clearTimeout(timer);
    }
  }));

  const headlines = results.flatMap(r =>
    (r.titles || []).map(t => `\u{1F4F0} [${r.name}] ${t}`));

  // Cache a total failure only briefly, so a transient outage clears quickly.
  const anyOk = results.some(r => r.ok);
  return reply(200, {
    headlines,
    feeds: results.map(({ name, ok, count, error }) => ({ name, ok, count, error })),
    fetchedAt: new Date().toISOString(),
  }, anyOk ? CACHE_SECONDS : 60);
};
