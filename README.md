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

- **Where it lives:** `agenticos-model.js` holds the pure `AGENTICOS.compute(assumptions)` function, the defaults, the slider metadata, the funnel config and the mock data (scorecard, segments, guardrails, evidence notes). `cfo.html` only renders it (`vAg`).
- **Formulas:** active students = eligible x adoption. Credited lift = observed lift x share credited. Students retained = active x credited lift. Revenue retained = retained x net tuition per student. Program cost = active x cost per active student. Break-even lift = cost per active student / net tuition per student. Ratio = credited lift / break-even lift.
- **Signal:** ratio 1.5 or more is Expand, 1.0 to 1.5 is Hold and measure, below 1.0 is Pause and review. Zero active students is always Pause and review. Zero cost gives a very high ratio, and zero tuition gives a ratio of 0.
- **Funnel rates:** activated = active / 0.7 (capped at eligible), flagged = 18% of active, followed up = 80% of flagged. Edit `CONFIG` to change them.
- **Swapping in real data:** replace `DEFAULTS` with values from your source, and `DATA` with an API response of the same shape. Nothing else reads the mock values. The "Student impact" answer on the portal home reads the same model, so the numbers match.
- **Wording:** copy uses "matched cohort" and "credited lift" and makes no causal claim. Consent, data sharing and FERPA treatment are pending validation by product and legal.
