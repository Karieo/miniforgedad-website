// ── UPDATE THE TICKER CONFIG ──────────────────────────────────────────────────
// Writes ticker-data.js from the Ticker tab on /upload.html, so the current
// project, schedule and messages can be changed from a phone between streams.
//
// Uses the same UPLOAD_PASSWORD and GITHUB_TOKEN as the photo upload — see
// upload-hpc-photo.js for setup.
//
// SAFETY: ticker-data.js is a comment header followed by strict JSON. This
// reads the file, JSON.parses it, replaces only the fields the client sent,
// and writes the same shape back. Feed URLs are never taken from the client —
// only the enabled flag on a feed that already exists — so this can't be used
// to point the ticker at an arbitrary URL.

const crypto = require('crypto');

const OWNER  = 'Karieo';
const REPO   = 'miniforgedad-website';
const BRANCH = 'main';
const FILE   = 'ticker-data.js';

const LIMITS = {
  currentTopic: 160,
  schedule: 120,
  message: 160,
  messages: 10,
  handle: 80,
};

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

function passwordMatches(given, expected) {
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

const gh = (path, init = {}) => fetch(`https://api.github.com${path}`, {
  ...init,
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'miniforgedad-upload',
    ...(init.headers || {}),
  },
});

const str = (v, max) => typeof v === 'string' && v.length <= max ? v.trim() : null;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply(405, { ok: false, error: 'Use POST.' });

  if (!process.env.UPLOAD_PASSWORD || !process.env.GITHUB_TOKEN) {
    return reply(503, { ok: false, error: 'Editing is not configured yet — UPLOAD_PASSWORD and GITHUB_TOKEN need setting in Netlify.' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return reply(400, { ok: false, error: 'Could not read the request.' }); }

  if (!passwordMatches(body.password, process.env.UPLOAD_PASSWORD)) {
    return reply(401, { ok: false, error: 'Wrong password.' });
  }

  try {
    const get = await gh(`/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${BRANCH}`);
    if (!get.ok) return reply(502, { ok: false, error: `Could not read ${FILE} (${get.status}).` });
    const meta = await get.json();
    const source = Buffer.from(meta.content, 'base64').toString('utf8');

    const match = source.match(/^([\s\S]*?const TICKER_DATA = )([\s\S]*);\s*$/);
    if (!match) return reply(500, { ok: false, error: `${FILE} is not in the expected shape.` });

    let data;
    try { data = JSON.parse(match[2]); }
    catch { return reply(500, { ok: false, error: `${FILE} does not contain valid JSON.` }); }

    const changed = [];
    const set = (key, value) => {
      if (value !== null && data[key] !== value) { data[key] = value; changed.push(key); }
    };

    if (body.currentTopic != null) {
      const v = str(body.currentTopic, LIMITS.currentTopic);
      if (v === null) return reply(400, { ok: false, error: `Current project must be ${LIMITS.currentTopic} characters or fewer.` });
      set('currentTopic', v);
    }
    if (body.schedule != null) {
      const v = str(body.schedule, LIMITS.schedule);
      if (v === null) return reply(400, { ok: false, error: `Schedule must be ${LIMITS.schedule} characters or fewer.` });
      set('schedule', v);
    }
    for (const key of ['youtube', 'instagram', 'patreon']) {
      if (body[key] == null) continue;
      const v = str(body[key], LIMITS.handle);
      if (v === null) return reply(400, { ok: false, error: `${key} is too long.` });
      set(key, v);
    }

    if (body.messages != null) {
      if (!Array.isArray(body.messages) || body.messages.length > LIMITS.messages) {
        return reply(400, { ok: false, error: `Up to ${LIMITS.messages} messages.` });
      }
      const clean = body.messages
        .map(m => str(m, LIMITS.message))
        .filter(m => m);          // drop blanks so an empty box just removes a line
      if (body.messages.some(m => typeof m !== 'string' || m.length > LIMITS.message)) {
        return reply(400, { ok: false, error: `Each message must be ${LIMITS.message} characters or fewer.` });
      }
      if (JSON.stringify(data.messages) !== JSON.stringify(clean)) {
        data.messages = clean; changed.push('messages');
      }
    }

    if (body.scrollSpeed != null) {
      const n = Number(body.scrollSpeed);
      if (!Number.isFinite(n) || n < 20 || n > 300) {
        return reply(400, { ok: false, error: 'Scroll speed must be between 20 and 300 seconds.' });
      }
      set('scrollSpeed', Math.round(n));
    }

    if (body.headlinesPerFeed != null) {
      const n = Number(body.headlinesPerFeed);
      if (!Number.isFinite(n) || n < 1 || n > 10) {
        return reply(400, { ok: false, error: 'Headlines per feed must be between 1 and 10.' });
      }
      set('headlinesPerFeed', Math.round(n));
    }

    // Only the enabled flag is client-controlled; URLs stay as they are in the
    // file so nobody can repoint the ticker at an arbitrary feed.
    if (body.feedsEnabled != null) {
      if (typeof body.feedsEnabled !== 'object') {
        return reply(400, { ok: false, error: 'Feed toggles must be an object.' });
      }
      let touched = false;
      (data.newsFeeds || []).forEach(feed => {
        const want = body.feedsEnabled[feed.name];
        if (typeof want === 'boolean' && feed.enabled !== want) { feed.enabled = want; touched = true; }
      });
      if (touched) changed.push('newsFeeds');
    }

    if (!changed.length) return reply(200, { ok: true, changed: [], message: 'Nothing changed.' });

    const updated = match[1] + JSON.stringify(data, null, 2) + ';\n';

    const put = await gh(`/repos/${OWNER}/${REPO}/contents/${FILE}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Update ticker: ${changed.join(', ')}`,
        content: Buffer.from(updated, 'utf8').toString('base64'),
        sha: meta.sha,
        branch: BRANCH,
      }),
    });

    if (!put.ok) {
      const detail = await put.text();
      return reply(502, { ok: false, error: `GitHub rejected the change (${put.status}).`, detail: detail.slice(0, 200) });
    }

    return reply(200, {
      ok: true,
      changed,
      message: `Ticker updated (${changed.join(', ')}). Live in about a minute.`,
    });

  } catch (err) {
    return reply(502, { ok: false, error: 'Could not reach GitHub. Try again in a moment.' });
  }
};
