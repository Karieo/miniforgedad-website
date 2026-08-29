// ── OBS TICKER CONFIG ─────────────────────────────────────────────────────────
// Everything the stream ticker shows. obs-ticker.html reads this, and the
// Ticker tab on /upload.html writes it — so you can change your current project
// from your phone between streams without touching code.
//
//   currentTopic   shown first as "Now: …". Change this per stream.
//   schedule       your regular stream times
//   messages       rotating lines, shuffled in with everything else
//   youtube/…      social handles; leave blank to hide one
//   scrollSpeed    seconds for one full pass — higher is slower
//   newsFeeds      RSS sources; flip enabled to false to drop one
//   headlinesPerFeed  how many stories to take from each feed
//
// Below this line is plain JSON so tooling can rewrite it safely — keep it
// valid JSON (double quotes, no trailing commas).
// ──────────────────────────────────────────────────────────────────────────────

const TICKER_DATA = {
  "currentTopic": "Today's project: painting Space Marines",
  "schedule": "Live every Tue & Thu at 7PM CT",
  "messages": [
    "Welcome to the stream — glad you're here!",
    "Drop a question in the chat — we read every message",
    "Enjoying the stream? Share it with a friend!",
    "Thanks for watching — your support means everything"
  ],
  "youtube": "@miniforgedad",
  "instagram": "@miniforgedad",
  "patreon": "patreon.com/miniforgedad",
  "scrollSpeed": 100,
  "headlinesPerFeed": 3,
  "newsFeeds": [
    { "name": "WarCom",             "enabled": true, "url": "https://warcomfeed.link/rss.xml" },
    { "name": "Bell of Lost Souls", "enabled": true, "url": "https://www.belloflostsouls.net/feed" },
    { "name": "Tale of Painters",   "enabled": true, "url": "https://taleofpainters.com/feed" }
  ]
};
