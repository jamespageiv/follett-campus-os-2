# Campus OS: concept microsite for Follett

A clickable concept demo of an agentic operating system for campuses, built for conversations with Follett leadership. It shows one idea through three experiences: the student, the CFO and the sales leader. **All data is synthetic.** Campus names, people, figures and dates are placeholders, and anything marked Assumed, Modeled or Illustrative is exactly that.

- **Live site:** https://jamespageiv.github.io/follett-campus-os-2/
- **Fork it:** https://github.com/jamespageiv/follett-campus-os-2/fork
- **Version:** this is the 2.0 working copy. The frozen 1.0 site is tagged `v1.0` here and lives at https://github.com/jamespageiv/ollett-campus-os

## Run it
It is a static site with no build step, no framework and no dependencies. Serve the repo root with any static server and open `index.html`:

    python3 -m http.server 8000      # then open http://localhost:8000

Opening `index.html` straight from disk also works for most of it, but the three embedded views are iframes and the shared state uses browser storage, so a local server is more reliable.

## Publish your own copy
1. Fork the repo.
2. In the fork, open Settings, then Pages, and deploy from branch `main`, folder `/ (root)`.
3. The site appears at `https://<your-username>.github.io/<repo-name>/` after a minute or two.

## What is in the repo
| File | What it is |
| :- | :- |
| `index.html` | The microsite: opening, why now, the partnership, the demo with a toggle between The student, The CFO and The Sales leader, and the path forward with three Spring 2027 pilots. The student view is a phone-style text thread inside this file. |
| `cfo.html` | The Partnership Portal (CFO view), loaded in the CFO window. Add `?ipad=1` for the trimmed iPad layout. |
| `group.html`, `group.js` | The Sales Command Center (sales leader view). |
| `campus-data.js` | The shared synthetic data for the Northfield State sample campus and 12 campuses, plus `CampusBus`, the shared state both views read and write. |
| `agenticos-model.js` | Pure logic and mock data for the Wolfie PA Impact tab. |
| `today-model.js` | Pure logic and mock data for the Today tab. |
| `spr-model.js`, `spr-data.js` | Pure logic and mock data for the SPR tab. |
| `teams.html`, `shelf.html` | Extra surfaces (CFO in Microsoft Teams, the idea shelf) that the demo toggle does not link to. |
| `server.js`, `Procfile`, `app.json` | A legacy Heroku static server. It serves a `public/` folder that this layout does not have, so it does not work as is. Use any static server or GitHub Pages instead. |
| Images and logos | `logo-*`, `pilot-*`, `promo-*`, `icon-*`, `icons/`, `ucla-*`, `student.png`. |

Images such as `ucla-hero.jpg`, `ucla-data.jpg`, the `promo-*.jpg` photos and the school logos are third-party. Replace them or confirm usage rights before sharing outside the team.

## The three experiences
- **The student:** a text thread with Wolfie, the campus assistant. Tutoring nudges, a paper-due prompt, an Arena Store purchase tied to the loyalty ledger, the ambassador program and the campus Slack community, and spring registration. A data graph beside it lights up the sources each message uses.
- **The CFO (Partnership Portal, `cfo.html`):** Today, Conversations, Action Center, Partner P&L and Cash, Access and Invoicing, Partnership and Renewal, Wolfie PA Impact, Active promotions, and Compliance and Trust. Approving, disputing or reconciling the Fall Access invoice updates the sales leader's view.
- **The sales leader (Sales Command Center, `group.html`):** Sales Command Center, Access Growth Console (Northfield's path from department to full Access, with the team, key people, campaigns and next steps), Campus programs, SPR, and Operations Control.

## Shared state and reset
`CampusBus` in `campus-data.js` keeps state in `localStorage` (key `campusos.state.v1`) and broadcasts changes between windows with `BroadcastChannel` and `postMessage`. That is how an invoice decision in the CFO view shows up in the sales view. Use the **Reset demo** box above the CFO window, or **Reset demo state** in the Sales Command Center, to clear it.

## How the code is organized
- Vanilla JavaScript and HTML. There is no build step and no test runner.
- Logic that matters (the Wolfie PA model, the Today status and ranking rules, the SPR ranking and internal-only filter) lives in separate `*-model.js` files that do not touch the DOM, so it can be unit tested or pointed at real data later. The HTML and `group.js` only render.
- Mock data sits in one module per feature (`agenticos-model.js`, `today-model.js`, `spr-data.js`) so it is easy to swap for an API.

## Wolfie PA Impact tab
A CFO view (Partnership Portal, `cfo.html`) that turns student-assistant outcomes into institutional value. All data is illustrative.

- **Where it lives:** `agenticos-model.js` holds the pure `AGENTICOS.compute(assumptions)` function, the defaults, the slider metadata, the funnel config and the mock data (scorecard, segments, guardrails, trending search terms, resolved issues and Wolfie and Slack insights). `cfo.html` only renders it (`vAg`).
- **Formulas:** active students = eligible x adoption. Credited lift = observed lift x share credited. Students retained = active x credited lift. Revenue retained = retained x net tuition per student. Program cost = active x cost per active student. Break-even lift = cost per active student / net tuition per student. Ratio = credited lift / break-even lift.
- **Signal:** ratio 1.5 or more is Expand, 1.0 to 1.5 is Hold and measure, below 1.0 is Pause and review. Zero active students is always Pause and review. Zero cost gives a very high ratio, and zero tuition gives a ratio of 0.
- **Funnel rates:** activated = active / 0.7 (capped at eligible), flagged = 18% of active, followed up = 80% of flagged. Edit `CONFIG` to change them.
- **Swapping in real data:** replace `DEFAULTS` with values from your source, and `DATA` with an API response of the same shape. Nothing else reads the mock values. The "Student impact" answer on the portal home reads the same model, so the numbers match.
- **Wording:** copy uses "matched cohort" and "credited lift" and makes no causal claim. Consent, data sharing and FERPA treatment are pending validation by product and legal.


## SPR tab (Sales Command Center)
A strategic partnership review view in `group.html`, replacing the hand-built deck. All data is synthetic.

- **Files:** `spr-model.js` holds the pure logic (section config, ranking, deltas, readiness gaps, single-store hiding, internal-only filter, comment redaction). `spr-data.js` builds mock data per campus from the 12 sample campuses. `group.js` only renders. Nothing in the first two touches the DOM.
- **Section config:** `SPRMODEL.SECTIONS` sets the 12 sections and their order. Each session copies it into `S.spr.cfg` (`visible`, `collapsed`), and the Sections button reorders or hides them per meeting. Add `internal:true` to a section in `SECTIONS` to keep it out of Present mode, the export and the share link. Single items carry `internal:true` and go through `SPRMODEL.filterInternal(items, mode)`.
- **Modes:** Prep shows seller notes, talking points, agent reasons and renewal strategy. Present hides everything marked internal. The export and the share link (`group.html?spr=<campus>&period=<id>&present=1`) always render Present and are read-only.
- **Export:** Export snapshot renders the Present view into a print-ready page and opens the browser print dialog. Choose Save as PDF. Each export is also saved to the campus's meeting history for the session.
- **State:** Edited takeaways, pinned or removed highlights, deck choices, notes and action items are kept per campus for the session. Reset demo state clears them. Open action items carry forward for that campus.
- **Swapping in real data:** replace `SPRDATA.build(campus, period, ctx)` with a function that returns the same shape. Nothing else reads the mock values.
- **Wording:** generated copy says "associated with" and compares against the prior-year period. It makes no causal claims.


## Today tab (CFO view) and shared state
A morning view in `cfo.html` (Today, first item in the sidebar): what changed, what needs a decision, vital signs, cash, enrollment, partner scorecard, risk, a 60-day calendar, a what-if and a board one-pager. All data is synthetic, and modeled figures are labeled Modeled or Illustrative.

- **Files:** `today-model.js` holds the pure logic (status evaluation, feed ranking, aging buckets, what-if math, invoice state) and the mock data in one module. `cfo.html` only renders it.
- **Shared state:** `CampusBus` in `campus-data.js` carries `invoiceDispute`, `reconRequested`, `reconDone`, `tasks`, `delegations`, `decisions` and `todayDec`, next to the existing flags. `CampusBus.live.invoiceStatus()` gives one invoice status (open, disputed, reconciliation, reconciled, approved) that both the CFO Today tab and the Sales Command Center read. `CampusBus.logDecision()` and `CampusBus.addTask()` write the decision log and partner tasks. Reset demo state clears all of it.
- **Two-way flow:** The CFO approving, disputing or requesting a reconciliation updates the seller's banner and creates a task for the partner team. The seller marking that task done flips the invoice to Reconciled for the CFO.
- **Thresholds:** Each vital sign has a default `{watch, off}` pair in `TODAYDATA.kpis`. Editing it in the UI changes status immediately and is kept for the session.
- **Swapping in real sources:** replace `TODAYDATA` with an API response of the same shape. The pure functions only read plain objects.
