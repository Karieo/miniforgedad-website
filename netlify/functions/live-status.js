// ── LIVE STATUS ───────────────────────────────────────────────────────────────
// Tells the site whether the YouTube channel is streaming right now, so the
// "Live" pill in the nav only appears when it's true.
//
// Runs server-side on Netlify so the API key is never exposed to visitors.
//
// SETUP (one time):
//   1. Get a free YouTube Data API v3 key:
//      https://console.cloud.google.com/apis/credentials
//      Create a project → Enable "YouTube Data API v3" → Create an API key.
//   2. In Netlify: Site configuration → Environment variables → Add a variable
//        YOUTUBE_API_KEY = <your key>
//      Optionally also set YOUTUBE_CHANNEL_ID if the channel ever changes.
//   3. Redeploy. That's it — no code changes needed.
//
// QUOTA: two units per check (one playlistItems call, one videos call) against
// a 10,000/day free allowance. Responses are CDN-cached for five minutes, so
// roughly 576 units a day at most no matter how much traffic the site gets.
//
// FAILS SAFE: any missing key, API error, or timeout returns { live: false }.
// The pill hides rather than falsely advertising a stream that isn't running.

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCDTzmIQ5yXqFljDMNDccCxA';
const API_KEY    = process.env.YOUTUBE_API_KEY;
const API        = 'https://www.googleapis.com/youtube/v3';

// A channel's uploads playlist is its ID with the UC prefix swapped for UU.
// Using it costs 1 unit; searching the channel would cost 100.
const uploadsPlaylist = id => 'UU' + id.slice(2);

const json = (body, cacheSeconds) => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    // Browsers hold it briefly; Netlify's CDN holds it longer and shields the
    // API quota from traffic spikes.
    'Cache-Control': `public, max-age=60, s-maxage=${cacheSeconds}`,
  },
  body: JSON.stringify(body),
});

async function getJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  return res.json();
}

exports.handler = async () => {
  if (!API_KEY) {
    // Not configured yet — say so plainly, and cache only briefly so the site
    // starts working as soon as the key is added.
    return json({ live: false, reason: 'not-configured' }, 60);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    // 1. Newest few videos on the channel. A stream shows up here as soon as
    //    it goes live, so we don't need the expensive search endpoint.
    const list = await getJson(
      `${API}/playlistItems?part=contentDetails&maxResults=5` +
      `&playlistId=${uploadsPlaylist(CHANNEL_ID)}&key=${API_KEY}`,
      controller.signal
    );

    const ids = (list.items || [])
      .map(i => i.contentDetails && i.contentDetails.videoId)
      .filter(Boolean);

    if (!ids.length) return json({ live: false, reason: 'no-videos' }, 300);

    // 2. Ask which of them, if any, is actually broadcasting right now.
    const videos = await getJson(
      `${API}/videos?part=snippet&id=${ids.join(',')}&key=${API_KEY}`,
      controller.signal
    );

    const liveNow = (videos.items || []).find(
      v => v.snippet && v.snippet.liveBroadcastContent === 'live'
    );

    if (!liveNow) return json({ live: false }, 300);

    return json({
      live: true,
      videoId: liveNow.id,
      title: liveNow.snippet.title,
      url: `https://www.youtube.com/watch?v=${liveNow.id}`,
    }, 300);

  } catch (err) {
    // Network blip, quota exhaustion, revoked key — all the same to the site.
    // Cache the failure briefly so one bad minute doesn't hammer the API.
    return json({ live: false, reason: 'error' }, 60);
  } finally {
    clearTimeout(timeout);
  }
};
