# Teebay-Buggy — Automation Suite

Playwright automation for the [Teebay-Buggy](https://github.com/erahmanSazim/teebay-buggy) QA assessment: positive-path tests for every feature, validation tests for every form, and a curated set of regression specs that encode the bugs found while testing (see `docs/bug-report.md` / the submitted PDF for the full write-up).

## What's covered

| Feature | Spec file |
|---|---|
| Sign in | `tests/specs/signIn.spec.js` |
| Registration | `tests/specs/registration.spec.js` |
| Account settings | `tests/specs/accountSettings.spec.js` |
| Product CRUD (add/edit/delete) | `tests/specs/productCrud.spec.js` |
| Browse & filter products | `tests/specs/browseProducts.spec.js` |
| Buy / rent products | `tests/specs/buyRent.spec.js` |
| Navigation, logout, route protection | `tests/specs/navigationAndAuth.spec.js` |
| Additional sign-in/session bugs | `tests/specs/knownBugs.spec.js` |

Each feature file has a `Sign In` / `Product CRUD` / etc. describe block with **positive** and **validation** tests, and a `Known bugs` describe block with regression tests for confirmed bugs. Known-bug tests are annotated with `test.fail()` and assert the *correct* expected behavior — they report green as long as the app stays exactly as buggy as it is today, and turn red the moment a bug is fixed without the test being updated, flagging the regression test as stale.

The one exception is `BUG-18` (the fake "Load More" timeout), which asserts the bug directly (no `test.fail()`) to avoid racing the app's 5-second `setTimeout`.

## Setup

```bash
git clone https://github.com/erahmanSazim/teebay-buggy.git
cd teebay-buggy
npm install   # or: yarn install
npm start     # or: yarn start — runs at http://localhost:3000
```

The app has no real backend and resets its data on every login, so tests always start from the same seeded state.

In a second terminal, set up this automation project:

```bash
git clone <this-repo-url>
cd teebay-buggy-automation
npm install
npx playwright install chromium
```

## Running the tests

With the app running at `http://localhost:3000`:

```bash
npm test                 # headless run, HTML report generated
npm run test:headed      # watch it run in a browser
npm run test:report      # open the last HTML report
npm run test:bugs        # just the sign-in known-bug regressions
```

Point at a different app URL (e.g. the hosted GitHub Pages instance) with:

```bash
BASE_URL=https://ehsanur-rahman-sazim.github.io/teebay-buggy/ npm test
```

The GitHub Pages instance can rate-limit or lag under automated traffic — prefer `localhost` for a reliable run, per the assessment's own note.

## Project structure

```
tests/
  fixtures/     seeded test data + a shared login helper
  pages/        one page object per app screen
  specs/        the actual test files (positive / validation / known bugs)
playwright.config.js
```

## Notes on test design

- Page objects use the app's underlying DOM structure (input `name` attributes, ARIA roles for Semantic UI dropdowns/listboxes) rather than visual position, since several bugs change on-screen labels/text.
- The existing seeded account (`testuser@teebay.com` / `123456`) is reused across tests rather than registering a fresh account, because registration has no working happy path in this build (see `BUG-03`).
- Tests that need a signed-in session call `loginAsExistingUser(page)` in a `beforeEach`; Playwright's per-test browser context keeps each test's session/data isolated.
