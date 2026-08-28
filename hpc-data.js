// ── HPC 2025 DATA ─────────────────────────────────────────────────────────────
// Everything the tracker shows, in one place. hpc.html renders from this, and
// the score bar counts itself from `status` and `done` — so the numbers can
// never drift out of step with the cards again.
//
// You can edit this by hand, but the easy way is /upload.html on your phone:
// it writes captions and statuses here for you.
//
//   status   "pending" | "active" | "complete" | "missed"
//   badge    the label on the card — free text, e.g. "In Progress", "Upcoming"
//   notes    the caption under the photos
//   slug     photo filenames: images/hpc/<slug>-before.jpg and -after.jpg
//
// Below this line is plain JSON so tooling can rewrite it safely — keep it
// valid JSON (double quotes, no trailing commas).
// ──────────────────────────────────────────────────────────────────────────────

const HPC_DATA = {
  "months": [
    {
      "name": "September 2025",
      "slug": "sep-2025",
      "status": "complete",
      "badge": "Complete",
      "notes": "Imperial Knight Paladin \u2014 House Griffith livery, bone &amp; gold. Titanic bonus."
    },
    {
      "name": "October 2025",
      "slug": "oct-2025",
      "status": "complete",
      "badge": "Complete",
      "notes": "Add what you painted this month\u2026"
    },
    {
      "name": "November 2025",
      "slug": "nov-2025",
      "status": "complete",
      "badge": "Complete",
      "notes": "Add what you painted this month\u2026"
    },
    {
      "name": "December 2025",
      "slug": "dec-2025",
      "status": "complete",
      "badge": "Complete",
      "notes": "Add what you painted this month\u2026"
    },
    {
      "name": "January 2026",
      "slug": "jan-2026",
      "status": "pending",
      "badge": "Pending",
      "notes": "Add what you painted this month\u2026"
    },
    {
      "name": "February 2026",
      "slug": "feb-2026",
      "status": "pending",
      "badge": "Pending",
      "notes": "Add what you painted this month\u2026"
    },
    {
      "name": "March 2026",
      "slug": "mar-2026",
      "status": "missed",
      "badge": "Missed",
      "notes": "Add what you painted this month\u2026"
    },
    {
      "name": "April 2026",
      "slug": "apr-2026",
      "status": "missed",
      "badge": "Missed",
      "notes": "Add what you painted this month\u2026"
    },
    {
      "name": "May 2026",
      "slug": "may-2026",
      "status": "active",
      "badge": "In Progress",
      "notes": "Add what you're painting this month\u2026"
    },
    {
      "name": "June 2026",
      "slug": "jun-2026",
      "status": "pending",
      "badge": "Upcoming",
      "notes": ""
    },
    {
      "name": "July 2026",
      "slug": "jul-2026",
      "status": "pending",
      "badge": "Upcoming",
      "notes": ""
    },
    {
      "name": "August 2026",
      "slug": "aug-2026",
      "status": "pending",
      "badge": "Upcoming",
      "notes": ""
    }
  ],
  "bonuses": [
    {
      "title": "Just Get It Done!",
      "desc": "Finish any two previously started units that are no more than 75% complete. Before &amp; after photos required for both.",
      "done": false
    },
    {
      "title": "Vehicle / Behemoth / Cavalry",
      "desc": "Paint a Vehicle, Behemoth, or Cavalry unit as your monthly entry.",
      "done": false
    },
    {
      "title": "Character",
      "desc": "Paint a Character model as your monthly entry.",
      "done": false
    },
    {
      "title": "Battle Line",
      "desc": "Paint a Battle Line unit as your monthly entry.",
      "done": false
    },
    {
      "title": "Double Up",
      "desc": "Complete two full units this month instead of the usual one.",
      "done": false
    },
    {
      "title": "Reset the Mechanism",
      "desc": "Post before &amp; after photos of your hobby workspace/environment. Must be paired with a completed monthly unit.",
      "done": false
    },
    {
      "title": "Monstrous / Dreadnought",
      "desc": "Paint a Monstrous Creature or Dreadnought as your monthly entry.",
      "done": false
    },
    {
      "title": "Titanic",
      "desc": "Paint a Titanic unit as your monthly entry.",
      "done": true
    },
    {
      "title": "Terrain",
      "desc": "Paint a piece of terrain as your monthly entry.",
      "done": false
    },
    {
      "title": "Display Board",
      "desc": "Complete a display board as your monthly entry.",
      "done": false
    },
    {
      "title": "Flyer",
      "desc": "Paint a Flyer unit as your monthly entry.",
      "done": false
    }
  ]
};
