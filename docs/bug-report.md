# Teebay-Buggy — Bug Report

**Tested by:** Ashfat Abegh
**Application:** Teebay-Buggy (https://github.com/erahmanSazim/teebay-buggy)
**Environment tested:** Local build (`npm start`, `http://localhost:3000`), Chromium via Playwright, plus manual verification in the built-in browser
**Test account:** `testuser@teebay.com` / `123456`
**Method:** Manual exploratory testing + source-code review, cross-checked against a Playwright automation suite (see the linked GitHub repository for the full suite; `BUG-XX` IDs below match the `test.fail()`-annotated regression specs there)

## Summary

39 issues were found across all 7 features of the app. Per the assignment's stated priority, the focus below is on **functional bugs that break workflows, produce incorrect data, or crash the app**; a handful of pure-cosmetic/copy issues are included for completeness but kept brief.

| Severity | Count | Examples |
|---|---|---|
| Critical | 4 | Registration has no working happy path; Bought/Sold/Borrowed/Lent List crashes on click; password field isn't masked; own products never appear in Browse Products |
| High | 16 | Duplicate product cards; delete blocked on last product; edit blocked over 5 products; buy/rent filter logic broken; buy/rent buttons shown on a currently-rented product; rent form has zero validation; rent dates off by one month |
| Medium | 14 | Wrong/mismatched validation messages; categories not required; price fields not type-checked in edit mode; no success feedback on edit; submit button mislabeled in edit mode |
| Low | 5 | Minor UX/consistency notes |

---

## FEATURE 1 — Sign In

### BUG-01 (Medium) — Empty Email field shows "Password is required"
**Steps:** Open the sign-in page. Leave Email blank, fill any password, submit.
**Expected:** An email-specific message, e.g. "Email is required."
**Actual:** The error under the Email field reads "Password is required."
**Cause:** `signInForm.jsx:23` — `yup.string().email(...).required('Password is required')`, a copy-paste of the password field's message.

### BUG-02 (Critical) — Password field is not masked
**Steps:** Open the sign-in page and type into the Password field.
**Expected:** Characters are masked (`type="password"`).
**Actual:** The password is shown in plain text as you type.
**Cause:** `signInForm.jsx:79` renders `<CustomInput labelName="Password" name="password" />` with no `type="password"` prop; the underlying `<input>` (`customInput.styles.js`) defaults to `type="text"`. Registration's equivalent field (`registrationForm.jsx:55`) does pass `type="password"` correctly, confirming this is an omission rather than intentional.

### BUG-14 (Critical) — The logged-in user's own products never appear in Browse Products
**Steps:** Log in, go to Browse Products.
**Expected:** Per the spec ("You are allowed to see your own products in the browsing list"), "Cricket kit" and "iPhone 13 pro max" should be listed.
**Actual:** They never appear — only the platform's seeded `additionalProducts` show up.
**Cause:** `signInForm.jsx:49-59` — `onSubmitHandler` reads `userProducts` from a `useSelector` captured at component-mount time (before `loadProducts()` has populated it), so `loadAllProducts([...additionalProducts, ...userProducts])` is always called with a stale empty array. A direct consequence: a user's own product details page can never be opened this way either (see BUG-23).

### BUG-25 (Medium) — Revisiting `/signin` or `/register` while already logged in just re-renders the form
**Steps:** Log in, then navigate directly to `/` or `/register`.
**Expected:** Redirected away, since the user is already authenticated.
**Actual:** The Sign In / Register form renders again over the logged-in app.
**Cause:** `App.js` has the `<PreSignIn>` wrapper commented out on both routes, with the author's own comment "PreSignIn doesn't work."

---

## FEATURE 2 — Registration

### BUG-03 (Critical) — No happy path exists; registration always fails
**Steps:** Fill out the registration form completely and correctly, submit.
**Expected:** The account is created.
**Actual:** Every submission — valid or not — shows "Internal error occurred. Please check the server!" and logs a fake server error. No account is ever created.
**Cause:** `registrationForm.jsx:28-39` — `onSubmitHandler` unconditionally calls `toast.error(...)` / `console.error(...)` with no dispatch or navigation. This is the single highest-impact finding: an entire required feature cannot be completed.

### BUG-04 (Medium) — `firstName` has no required validation, unlike every other field
**Steps:** Leave First Name blank (fill everything else), submit.
**Expected:** "First Name is required."
**Actual:** No error for First Name at all.
**Cause:** `registrationForm.jsx:15-21` — the yup schema has no entry for `firstName`.

### BUG-05 (Medium) — Confirm Password is never checked against Password
**Steps:** Enter different values in Password and Confirm Password, submit.
**Expected:** A "passwords must match" error.
**Actual:** No validation at all — the field is rendered but absent from the schema entirely. (Moot in practice only because BUG-03 blocks all submissions anyway.)

---

## FEATURE 3 — Account Settings

### BUG-06 (Medium) — Custom phone-number error message never displays
**Steps:** Enter non-numeric text in Phone Number, submit.
**Expected:** "Only number is accepted."
**Actual:** Yup's generic default type-error text shows instead.
**Cause:** `accountSettingsForm.jsx:21` — `yup.number('Only number is accepted')` is invalid yup usage; a custom message must be attached via `.typeError('...')`, not as `.number()`'s first argument.

### BUG-26 (Medium) — Clearing Phone Number shows no "required" message
**Steps:** Clear the Phone Number field entirely, submit.
**Expected:** "Phone number is required."
**Actual:** No message appears (yup's number-type coercion on the now-empty string short-circuits before the `.required()` check is meaningfully reachable the way the schema is written).

### BUG (Low) — Phone-number schema can't represent the seeded phone format
`accountSettingsForm.jsx:21` validates `phone_number` as `yup.number()`, but the seed value in `user.json` is the string `"+123456789"` with a `+` prefix — a value that isn't representable as a JS number. Any realistic international format (spaces, dashes, parentheses) will fail validation outright.

### BUG (Low) — No way to change password from Account Settings
There's no password field on this form at all, and no current-password confirmation step for any other field change.

---

## FEATURE 4 — Product CRUD

### BUG-07 (High) — Every product in My Products renders twice
**Steps:** Log in, go to My Products.
**Expected:** Each product (e.g. "Cricket kit") appears once.
**Actual:** Every product appears twice, back-to-back, with identical data — both copies link to the same edit page.
**Cause:** `userProductListPage.jsx:66-85` — the `.map()` literally contains two copies of the same `<ProductCard>` JSX block. This is a rendering bug, not a data bug — `userProducts.json` has no duplicate entries.

### BUG-08 (Medium) — Title's required error reads "Last Name is required"
**Steps:** Add Product, leave Title blank, submit.
**Expected:** "Title is required."
**Actual:** "Last Name is required."
**Cause:** `upsertProductFormHelpers.js:19` — another copy-pasted error message.

### BUG-09 (High) — A product can be added with zero categories selected
**Steps:** Add Product, fill every field except Categories, submit.
**Expected:** "At least one category must be selected."
**Actual:** Submission succeeds with no categories at all.
**Cause:** `upsertProductFormHelpers.js:20` — `.required()` on a yup array only rejects `null`/`undefined`, not `[]`; it needs `.min(1, ...)` as well. The message string is effectively dead code.

### BUG-10 (High) — Deleting your last remaining product is blocked with a fake server error
**Steps:** Delete products down to exactly one remaining, then try to delete that last one.
**Expected:** It deletes (the empty-state view already exists and handles zero products).
**Actual:** Blocked with "Internal server error occurred. Please check the server!" and a fake `console.error`.
**Cause:** `userProductListPage.jsx:27-38` — `deleteButtonHandler` explicitly special-cases `userProducts.length === 1`.

### BUG-11 (Medium) — Editing a product gives no success feedback
**Steps:** Edit any product's field, submit.
**Expected:** Some confirmation (toast and/or redirect), matching the Add-Product flow's behavior.
**Actual:** Nothing visible happens — the page just sits there with no indication the save worked.
**Cause:** `upsertProductForm.jsx:56-57` — the edit branch of `onSubmitHandler` dispatches the update but never shows a toast or navigates, unlike the add branch directly below it.

### BUG-12 (Low) — Submit button always says "Add Product," even when editing
**Cause:** `upsertProductForm.jsx:114` — the button label is hardcoded regardless of `isEdit`.

### BUG-13 (High) — Editing a product accepts a non-numeric Purchase/Rent Price
**Steps:** Edit a product, set Purchase Price to a non-numeric string, submit.
**Expected:** A numeric type-error, matching Add Product's behavior.
**Actual:** Accepted — any non-empty string passes, later producing `$NaN` wherever the price is displayed or compared (e.g. in Browse Products' price filters).
**Cause:** `upsertProductFormHelpers.js:30-33` — the edit-mode schema uses `yup.string().required(...)` for `purchase_price`/`rent_price` instead of `yup.number()` (used correctly in add mode).

### BUG (High) — Editing an existing product's category selections do not pre-fill correctly
**Steps:** Edit a product that has categories assigned.
**Expected:** The Categories dropdown shows its existing categories pre-selected.
**Actual:** Pre-selection is broken.
**Cause:** `upsertProductForm.jsx:24-30` — the correct conversion (`product.categories.map(c => c.name)`) is commented out with the note "Bug fix!", apparently because applying it unconditionally crashes the Add Product page (where `product` is `undefined`).

### BUG (High) — Editing is blocked once you own more than 5 products — not just adding
**Steps:** Own 6+ products, try to edit any one of them.
**Expected:** Editing an existing product should never be limited by a total-product-count cap.
**Actual:** Blocked with a fake "psql: No space left on device!" server error.
**Cause:** `upsertProductForm.jsx:43-53` — `if (userProducts.length > 5)` guards both the add **and** edit submit paths.

### BUG (Medium) — No business rule prevents editing/deleting a sold or currently-rented product
The spec explicitly invites candidates to define this kind of rule; none exists today (no lock, no warning).

### BUG (Low) — No minimum/positive-value constraint on prices; no character limits on Title/Description
`0` or negative prices are accepted; Title/Description have no length caps.

### BUG (Low) — Non-deterministic `Math.random()` React keys on every list render
`randomIdGenerator()` is used as the `key` prop in both My Products and Browse Products, defeating React's reconciliation and risking unnecessary remounts/flicker.

---

## FEATURE 5 — Browse Products

### BUG-15 (High) — Title search field has no effect on results
**Steps:** Type a product title into the Title filter field, submit.
**Expected:** Results narrow to matching titles.
**Actual:** No effect whatsoever — the field is rendered but never read by the filtering logic.
**Cause:** `filterForm.jsx`'s Title input is wired up, but `browseProductsPage.jsx`'s `filterProducts()` never references `data.title`.

### BUG-16 (High) — Enabling Buy/Rent Filters with no min or max set returns zero results
**Steps:** Check "Buy Filters," leave both Min and Max blank, submit.
**Expected:** No effect (show everything), or a validation message asking for a value.
**Actual:** Silently returns zero products.
**Cause:** `browseProductsPage.jsx:49-59/61-75` — when neither range bound is given, the code falls into an `else` branch comparing against `parseInt(undefined)` (`NaN`); any comparison against `NaN` is `false`.

### BUG-17 (High) — An inverted price range (Min > Max) silently returns zero results
**Steps:** Set Min = 1000, Max = 10, submit.
**Expected:** An error, or at minimum an explanation.
**Actual:** Empty results with no explanation. No validation anywhere checks `min <= max`.

### BUG (High) — Filters compound instead of resetting from the full product list
**Steps:** Filter by one category, get results, then filter by a *different* category without clearing first.
**Expected:** The new category's products show.
**Actual:** Can return zero results — the second filter pass runs against the already-narrowed result set, not the full list.
**Cause:** `browseProductsPage.jsx:40-43` — `let updatedFilteredProducts = filteredProducts;` instead of starting over from `[...additionalProducts, ...userProducts]`. The correct line is visible directly above, commented out with "Bug fix!" — a deliberately regressed line.

### BUG (Medium) — Initial page load and "Clear" show two different product sets
Loading Browse Products fresh shows a different list than clicking "Clear" with no filters applied — the two use different base arrays (missing vs. including the user's own products), compounding BUG-14's inconsistency.

### BUG-18 (High) — "Load More" always fails with a fake timeout error
**Steps:** Click "Load More," wait 5 seconds.
**Expected:** Additional products load.
**Actual:** A 5-second spinner followed by "Request timed out!" every single time — pagination doesn't actually exist.

### BUG-23 (Critical) — A user's own product details page can never be opened
**Steps:** As the logged-in test user, try to reach `/product-details/1` ("Cricket kit," your own product).
**Expected:** The page loads, shows "You own the product," and increments its view count (per the spec's explicit requirement).
**Actual:** "Product does not exist!" — a direct downstream effect of BUG-14 (`allProducts.find(...)` never finds it, since the user's products were never merged in).

### BUG (Low) — Dead/always-true condition when incrementing view count
`productDetailsPage.jsx:60` — `if (product % 2 !== 0)`: `product` is an object, so `product % 2` is always `NaN`, and the condition is always true. Harmless today only because "always true" happens to match the apparently-intended "always increment" behavior, but it's non-functional code that would mislead anyone trying to add real logic here.

### BUG (Medium) — Stale product data possible on same-component navigation
`productDetailsPage.jsx:34-66` — the data-loading `useEffect` has an empty dependency array (flagged by the project's own ESLint warning), so navigating from one product's details page directly to another's without a full remount can leave stale data on screen.

---

## FEATURE 6 — Buy/Rent Products

### BUG-19 (High) — The rent form has no validation at all
**Steps:** Open the Rent modal, leave both dates blank (or type garbage text), click "Book rent."
**Expected:** A required-field or format error.
**Actual:** Accepted unconditionally — empty dates, non-date text, an end date before the start date, and overlapping rental periods are all silently accepted.
**Cause:** The rent form's `useForm()` is created with no yup resolver at all.

### BUG-20 (Low) — End Date field is labeled "Last Name"
**Cause:** `rentForm.jsx:13` — a copy-paste label error, visible the moment the Rent modal opens.

### BUG-21 (High) — A currently-rented product still shows active Buy/Rent buttons
**Steps:** Open a product that's inside an active rental window (e.g. seed product "Blender").
**Expected:** Buy/Rent should be disabled, or at least warn, while a rental is active.
**Actual:** Both buttons remain fully clickable, allowing the product to be bought or re-rented during an existing rental.
**Cause:** `productDetailsPage.jsx:152-157` — the button-visibility condition checks `is_purchased` and `isUserProduct()` but never `isCurrentlyRented()`.

### BUG-22 (High) — Rental dates are stored and displayed one month off
**Steps:** Submit a rental with Start Date `2024-01-15`.
**Expected:** Stored/displayed as January 15, 2024.
**Actual:** Displayed as February 15, 2024.
**Cause:** `productDetailsPage.jsx:68-71` (`getDateObject`) passes the raw 1-indexed month number straight into `new Date(y, m, d)`, whose month parameter is 0-indexed. This throws off every date shown in rent history and the "currently rented" check.

### BUG (Medium) — An empty/unparseable rent date can produce an Invalid Date that later crashes rendering
A direct consequence of BUG-19: `getDateObject('')` produces `new Date(NaN, NaN, NaN)`, an Invalid Date stored in `rent_history`; the next render of the Rent History section calls `date-fns/format` on it, which throws.

### BUG (Low) — No server-side-style guard against buying/renting your own product
Only a UI-level check (`isUserProduct()`) hides the buttons; there's no deeper guard if a user could otherwise reach the action. Low risk given there's no real backend, but worth tracking as a defense-in-depth gap.

---

## FEATURE 7 — Bought/Sold/Borrowed/Lent List

### BUG-24 (Critical) — The nav tab crashes the app immediately on click
**Steps:** Log in, click "Bought/Sold/Borrowed/Lent List" in the nav bar.
**Expected:** A page listing the user's bought/sold/borrowed/lent products.
**Actual:** `TypeError: itemModalOpen is not a function`, thrown immediately.
**Cause:** `navigationBar.jsx:50` — `onClick={() => itemModalOpen()}` calls `itemModalOpen`, which (per `hooks/useModal.js`) is the **boolean state value**, not its setter function. Even if corrected to call the setter, it's wired to the same `CustomModal` instance already used for the logout confirmation, so a naive fix would pop the wrong modal. There is also no route defined anywhere in `App.js` for this feature — **it is entirely unimplemented**, and the nav entry actively crashes rather than failing gracefully.

---

## Session/navigation issue

### BUG-27 (Medium) — A protected route can skip its redirect if reloaded immediately after logout
**Steps:** Log out, then immediately (within the same instant) hard-reload a protected URL like `/my-products`.
**Expected:** Redirected to sign-in, same as any other unauthenticated request.
**Actual:** Can momentarily load the protected page before the session clears, because `redux-persist` (configured on `sessionStorage` in `redux/store.js`) may not have flushed the logged-out state to storage yet when the reload re-hydrates from it. Waiting even a few hundred milliseconds before reloading avoids it, suggesting a persistence-timing race rather than a logic error in the `logOut` reducer itself (which is correct).

---

## Seed data notes

- `additionalProducts.json` id `2432` ("Blender"): `is_purchased: false` with an active `rent_history` window — useful for exercising BUG-21 and BUG-22.
- `additionalProducts.json` id `678` ("Lawn Mower"): has **two** `rent_history` entries — useful for checking multi-entry rent-history rendering.
- `userProducts.json` has no literal duplicate entries — the duplicated "Cricket kit" card (BUG-07) is purely a rendering bug, not a data problem.
