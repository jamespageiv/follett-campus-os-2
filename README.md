# Campus OS microsite on Heroku

Static site (public/index.html) served by a zero-dependency Node server. Optional password gate.

## Deploy (Heroku CLI)

    cd follett-campus-os-heroku
    git init && git add . && git commit -m "Campus OS"
    heroku create follett-campus-os        # pick any free name
    heroku config:set SITE_PASSWORD='choose-a-password'   # optional, recommended
    git push heroku HEAD:main
    heroku open

Login when prompted: user `follett` (override with SITE_USER) and your password.

## Update
Replace public/index.html, then commit and `git push heroku HEAD:main`.

## Notes
- Internal concept for the Follett strategy day. Keep the password on until it is ready to share more widely.
- Search engines are told not to index it (X-Robots-Tag).
- Needs only Node 20. Heroku Eco dynos sleep when idle; first load can take a few seconds.


## Wolfie PA Impact tab
A CFO view (Follett Partnership Portal, `cfo.html`) that turns student-assistant outcomes into institutional value. All data is illustrative.

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
