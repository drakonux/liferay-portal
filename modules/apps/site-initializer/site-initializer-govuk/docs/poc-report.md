# GOV.UK Design System — Liferay Site Initializer: POC Report

## Executive Summary

This POC maps what a GOV.UK site on Liferay looks like when built entirely within the Style Book — the platform's built-in visual configuration layer. Extending the Frontend Token Definition (FET) or adding a client extension were available options and remain valid paths; they were deliberately excluded here to establish a clear baseline: what does the platform deliver out of the box, and where exactly does that stop.

The answer: **the Style Book covers layout, typography, brand colours, button variants, and border radius accurately. It hits hard limits at link colours, some component-level values hardcoded inside Clay, and fragment image resources in CSS.** Each of these gaps has a known solution: adding token slots via FET extension is a small, scoped piece of development that an external agency or a client's own team could deliver independently of this initialiser.

---

## Scope

- **Branch:** `feature/govuk-design-system-integration` (fork: `drakonux/liferay-portal`)
- **Portal:** Liferay CE 7.4.3.148 GA148
- **Theme:** Classic (unmodified)
- **Style Book values:** curated — 40 active tokens out of 116 available in the FET. Only tokens actively consumed by a fragment or a Clay component were kept.
- **FET (Frontend Token Definition):** unmodified — no token slots were added or removed from the Classic theme schema.
- **Client extensions / global CSS:** none.
- **Fragments:** 16 GOV.UK components implemented as Liferay fragments
- **Master page:** GOV.UK Standard

---

## Approach: Style Book-Only with Minimal Tokens

The Style Book applies value overrides to the Classic theme's Frontend Token Definition (FET) — the schema that determines which visual properties are configurable without code. The guiding principle was **minimum tokens, maximum inheritance**: every token set in `frontend-tokens-values.json` must justify its presence — either consumed by a fragment via `var()`, consumed by a visible Clay component, or a global whose value diverges legitimately from the FET default. Tokens that are not actively consumed were removed rather than left as noise.

---

## Metrics

| Metric | Value |
|---|---|
| FET total tokens | 116 |
| Style Book tokens — before | 47 |
| Style Book tokens — after | 40 |
| Net reduction | −7 |
| CSS vars consumed by GOV.UK fragments | 14 distinct |
| Fully tokenised fragments (0 literal values) | 9 / 16 |
| Non-tokenisable literals remaining | ~12 (documented below) |

---

## Acceptance Criteria

| Check | Result | Notes |
|---|---|---|
| Primary button — green, no radius, white text | ✅ | `#00703c`, `border-radius: 0` via stylebook |
| Button focus — yellow `#ffdd00`, black text | ✅ | Managed by fragment CSS via `var(--brand-color-4)` |
| Link normal — blue `#1d70b8`, underlined | ⚠️ | No `--link-color` slot in FET; links styled by Classic theme default, not the Style Book |
| Link visited — purple `#4c2c92` | ⚠️ | Same — no FET slot; cannot tokenise via Style Book |
| Headings — Arial, sizes from Style Book | ✅ | `font-family-base: arial, sans-serif`; h1–h3 set |
| Cards / inputs — no border-radius | ✅ | `borderRadius: 0` propagates through Bootstrap cascade |
| GOV.UK tag fragment | ✅ | Correct colours; `!important` prevents stylebook override (expected, documented) |
| Clay tag/label | ⚠️ | Inherits `--primary` (`#1d70b8`); responds to stylebook but slot semantic doesn't map cleanly to GOV.UK tag palette |
| Admin UI — Lexicon intact | ✅ | No regressions |

---

## Findings

### Platform — Declarative Model Limits

**F-01 — No `--link-color` slot in the FET**
The FET does not expose `link-color`, `link-hover-color`, `link-visited-color`, or `link-active-color` as tokens. GOV.UK's most recognisable visual trait — blue links, purple visited, dark hover — cannot be set via Style Book. Fragments must hardcode these values as literals, breaking tokenisation for the most common interactive element.

**F-02 — Fragment `[resources:]` token not processed in CSS**
The `[resources:filename]` syntax resolves correctly in HTML attributes (`src`, `href`) but is not processed when used inside CSS properties (e.g. `background-image: url("[resources:govuk-crest.svg]")`). The token is emitted as a literal string. This forces a design change away from CSS-only solutions (e.g. `::before` with `background-image`) towards an `<img>` element in HTML, which is not always the most semantic or maintainable approach.

**F-03 — Style Book not injected in fragment editor preview** · [LPD-88654](https://liferay.atlassian.net/browse/LPD-88654)
In the fragment editor preview, the Style Book is not injected — `var()` calls resolve to Bootstrap defaults, not GOV.UK values. This makes the editor preview unreliable for any Style Book–driven fragment. The only accurate rendering is the published public page. The issue has been reproduced across multiple POCs (Dintel, US Gov UK) by different fragment developers.

As a consequence, the `govuk-header` fragment had a deliberate `:root {}` block hardcoding the GOV.UK token values so the editor preview would look correct. This workaround is self-defeating on published pages: the `:root` block is injected globally and shadows the Style Book values, making the actual stylebook tokens ineffective for those variables. The block was removed in this refactor — production rendering is now correct, but the editor preview reverts to Bootstrap defaults. There is no clean solution within the current model.

Two improvements are tracked in the ticket: (1) inject the active Style Book tokens into the fragment editor preview; (2) surface available Style Book variables as autocomplete suggestions when typing `var(--` in the CSS editor.

**F-04 — `--spacer` base token absent from FET**
The FET exposes `spacer-1` through `spacer-10` but not a `--spacer` base variable. The GOV.UK spacing system (5 px base, integer multiples) is structurally incompatible with Bootstrap's spacing scale. GOV.UK spacing cannot be tokenised via Style Book.

**F-05 — Clay components with hardcoded border-radius**
`borderRadius: 0` in the Style Book propagates correctly through the Bootstrap cascade to most Clay components. However, any Clay component that hardcodes a `border-radius` literal in its internal SCSS is unaffected. Identifying which components do this requires inspecting compiled CSS output — not surfaced in the Style Book UI.

**F-06 — `govuk-tag` colours not tokenisable**
All colour declarations in the tag fragment use `!important`. No Style Book token can override them. The 10 GOV.UK tag colour variants (grey, green, turquoise, blue, light-blue, purple, pink, red, orange, yellow) also have no semantic slots in the FET. The fragment must own these values as literals.

**F-07 — Non-tokenisable literal values**
The following values have no FET slot and were left as literals:

| Value | Location | Reason |
|---|---|---|
| `#f4f8fb` | footer background | Not in GOV.UK palette; no FET slot |
| `font-size: 1rem` | footer, back-link | Between `fontSizeBase` (1.1875rem) and `fontSizeSm` (0.875rem) |
| `font-size: 2rem` | tabs `.govuk-heading-l` | Between h2 (2.25rem) and h3 (1.5rem) |
| `font-size: 1.6rem` | warning-text icon | No FET slot |
| `rgba(11,12,12,0.99)` | back-link hover | Opacity variant; not composable from `var(--black)` |
| `border-radius: 50%` | accordion icon, warning-text icon | `borderRadiusCircle` not added to Style Book |
| `#002d18`, `#929191`, `#dbdad9`, `#55150b`, `#aa2a16` | button shadows/variants | GOV.UK shadow palette; no FET slots |

---

### Product UX — Editor and Platform

**F-08 — Style Book selector lists irrelevant entries**
The Style Book selector in the site editor lists all Style Books available in the installation (e.g. `cms`, `dialect`, Liferay defaults), regardless of the current site. For a client building a GOV.UK site, this creates noise and increases the risk of accidentally applying the wrong Style Book. The selector should filter by site or at minimum sort the site-default entry first.
> Pending discussion with PE team.

**F-09 — Typography field order in Style Book editor unclear**
The Style Book editor displays font family fields in the order: Font Family Sans Serif → Font Family Monospace → Font Family Base. The relationship between these fields is not obvious to a non-technical user. Whether the current order is intentional and correct should be confirmed with the PE team.
> Pending discussion with PE team.

**F-10 — Pasting multiline text into editable heading loses line break**
Pasting text that contains a line break into an editable heading field either drops the break or promotes it to a new block. Behaviour varies by OS — confirmed working on one machine, not on another. Likely a platform-specific rendering issue in the page editor.

**F-11 — Supr key does not remove elements in the page editor** · [LPD-88896](https://liferay.atlassian.net/browse/LPD-88896)
The Supr (forward delete) key does not remove selected elements in the Content Page Editor. The editor handles Backspace for deletion but ignores Supr. The issue primarily affects Windows users (reproduced on Windows 11 Pro 25H2 / Edge 147) but also applies to macOS users with a full external keyboard. Both keys should trigger the same delete action. Workaround: use the contextual menu → Delete option.

**F-12 — No suitable fragment for GOV.UK related content panel**
GOV.UK's related content sidebar pattern requires a list of contextual links. The closest Liferay native widget is Related Assets, which works for internal Liferay assets but cannot render static or external links. There is no out-of-the-box fragment for flexible lateral navigation. A custom fragment would be required.

**F-13 — No numeric column span input for layout containers**
Reproducing GOV.UK's `govuk-grid-column-two-thirds` (2/3 + 1/3 layout) requires using three container modules and dragging the divider manually. There is no numeric input field for setting an exact column width. The result is imprecise and not reproducible deterministically.

**F-14 — Duplicate Fragment Set names create ambiguous delete errors**
Liferay allows importing a Fragment Set with the same name as an existing one, resulting in two sets with identical display names. Attempting to delete one of them may show a dependency error that actually belongs to the other set. The error message does not include the set ID or any disambiguating information. Liferay should warn on import if a set with the same name already exists, and error messages should identify the specific set by ID.

---

## Recommendations for Clients Needing Higher Style Book Fidelity

If a client requires link colour tokenisation or full GOV.UK palette coverage through the Style Book model, the recommended approach is to extend the FET with namespaced tokens (e.g. `--client-link-color`) in a dedicated theme CSS client extension. This creates a bridge layer between the client's design tokens and Clay's internal variables. Trade-off: an additional artifact to maintain alongside the Style Book. This is a recommendation, not part of this POC scope.

---

## Workaround Reference

| Problem | Workaround Applied |
|---|---|
| Fragment editor preview ignores Style Book | Verify in published public page view only |
| `[resources:]` not processed in CSS | Replace `::before` + `background-image` with `<img>` in HTML |
| `--warning` slot conflict (focus yellow vs semantic warning) | Focus yellow lives in `--brand-color-4`; `--warning` corrected to amber `#f47738` |
| Header fragment `:root {}` shadowing stylebook on published pages | Removed inline `:root` block — this block was a preview workaround that broke production; editor preview now shows Bootstrap defaults (see F-03) |
