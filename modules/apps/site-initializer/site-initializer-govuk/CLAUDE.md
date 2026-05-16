# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Module overview

This is a Liferay OSGi module (`com.liferay.site.initializer.govuk`) that implements the GOV.UK Design System as a Liferay site initializer. When a site is created using this initializer, Liferay provisions all fragments, the Style Book, and the master page automatically.

The approach is **Style Book-only**: GOV.UK visual identity is achieved entirely through the Classic theme's Frontend Token Definition (FET) — no theme modifications, no client extensions, no global CSS. See `docs/poc-report.md` for a full account of what this model covers and where it hits platform limits.

## Key commands

From the **portal root** (`/Users/davidaragones/Projects/liferay-portal`):

```bash
# Deploy the module to a running Liferay instance
cd modules && ../gradlew :apps:site-initializer:site-initializer-govuk:deploy

# Run source formatter (must pass before merging)
cd modules && ../gradlew :apps:site-initializer:site-initializer-govuk:formatSource
```

The Gradle wrapper lives in the portal root, not in `modules/`. Always run Gradle from inside `modules/` using `../gradlew`.

## Module structure

```
src/main/resources/site-initializer/
├── fragments/group/govuk/fragments/   # 16 GOV.UK fragment components
├── layout-page-templates/master-pages/govuk-standard/
├── style-books/govuk/
│   └── frontend-tokens-values.json   # 40 active Style Book tokens
└── thumbnail.png
```

Each fragment follows the Liferay fragment file convention:
- `index.html` — FreeMarker template with `data-lfr-editable-*` attributes and `${configuration.*}` bindings
- `index.css` — scoped CSS using `var(--token-name)` from the Style Book
- `index.js` — empty for static fragments; inline `<script>` in `index.html` for interactive ones (accordion, tabs)
- `fragment.json` — metadata: name, icon, cacheable flag
- `configuration.json` — fragment editor fields bound via `${configuration.*}` in the HTML

## Style Book token conventions

The 40 active tokens map to GOV.UK values. Key mappings:

| CSS variable | GOV.UK meaning |
|---|---|
| `--brand-color-1` | GOV.UK blue `#1d70b8` (links, borders) |
| `--brand-color-2` | GOV.UK dark blue `#003078` (hover) |
| `--brand-color-3` | GOV.UK green `#00703c` (primary button) |
| `--brand-color-4` | GOV.UK yellow `#ffdd00` (focus state) |
| `--gray-100` | GOV.UK light grey `#f3f2f1` (footer background) |
| `--gray-600` | GOV.UK mid grey `#505a5f` (borders, chevrons) |
| `--black` | GOV.UK black `#0b0c0c` |

Fragment CSS must use `var(--token-name)` rather than hardcoded hex values whenever a token exists. Literals are only acceptable for values with no FET slot (documented in `docs/poc-report.md` under F-07).

## Fragment authoring rules

- **Namespace all IDs** that JavaScript references: use `${fragmentEntryLinkNamespace}-my-id` on both the element `id` and the corresponding `href="#..."` or `document.getElementById(...)`. Failure to do this breaks multiple instances of the same fragment on a page.
- **FreeMarker syntax** for conditionals is `[#if condition]...[/#if]`, not `<#if>`. Configuration values are accessed via `${configuration.fieldName}`.
- **`cacheable: true`** is correct for fragments with only static editables. Use `false` only for fragments with per-request or per-user dynamic content.
- Fragment JavaScript that accesses the DOM must scope queries to `fragmentElement` (the Liferay-provided root) or use `document.getElementById` with a namespaced ID. Avoid bare `document.querySelector` with static class names.
- The `[resources:filename]` token resolves in HTML `src`/`href` attributes but **not** inside CSS properties. Use an `<img>` element instead of `background-image: url(...)` for fragment-bundled images.

## Known platform limits

- No `--link-color` slot in the FET — link colours cannot be tokenised via Style Book (see F-01 in POC report).
- Style Book is not injected in the fragment editor preview — `var()` calls resolve to Bootstrap defaults in the editor. Verify rendering on the published public page.
- GOV.UK spacing (5px base) is structurally incompatible with Bootstrap's spacing scale — spacing values are left as literals.
