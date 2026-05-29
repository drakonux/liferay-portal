# GOV.UK Design System — Liferay Site Initializer

A Liferay site initializer that replicates the [GOV.UK Design System](https://design-system.service.gov.uk/) visual identity using the platform's built-in Style Book. No theme modifications or client extensions required.

> **Canonical source / reference:** the standalone, strict `/ds-site-initializer-strict` deliverable this module is aligned to lives at
> **[marcoscv-work/gov.uk_DS](https://github.com/marcoscv-work/gov.uk_DS)** (OSGi module + `govuk-theme` client extension + validate/deploy scripts).

## What's included

**Fragments** — 24 GOV.UK components ready to use in the page editor:

| Fragment | Description |
|---|---|
| `govuk-accordion` | Expandable sections with show/hide controls |
| `govuk-back-link` | Navigation link to the previous page |
| `govuk-breadcrumbs` | Hierarchical navigation trail |
| `govuk-button` | Primary, secondary, and warning button variants |
| `govuk-details` | Collapsible disclosure widget |
| `govuk-footer` | Site footer with crown copyright and navigation links |
| `govuk-header` | Site header with crown logo and service name |
| `govuk-inset-text` | Highlighted callout block |
| `govuk-notification-banner` | Status and success notification banners |
| `govuk-panel` | Confirmation panel (used on transaction complete pages) |
| `govuk-phase-banner` | Alpha/Beta phase indicator with feedback link |
| `govuk-summary-list` | Key-value list for review pages |
| `govuk-table` | Accessible data table |
| `govuk-tabs` | Tabbed content sections |
| `govuk-tag` | Colour-coded status tags |
| `govuk-warning-text` | High-visibility warning message |
| `govuk-card` | Linked content card |
| `govuk-cookie-banner` | Cookie consent banner |
| `govuk-hero` | Full-width hero / masthead |
| `govuk-pagination` | Previous/next and numbered pagination |
| `govuk-service-navigation` | Service-level navigation bar |
| `govuk-text-input` | Labelled text input with hint and error |
| `govuk-components-showcase` | Reference page listing every component |
| `govuk-styles-showcase` | Reference page for the colour/type styles |

**Style Book** — `GOV UK` — sets the GOV.UK colour palette, typography (Arial), and zero border-radius across the site.

**Master page** — `GOV.UK Standard` — defines the page skeleton with a pre-placed header and footer, and restricts the drop zone to GOV.UK fragments only.

---

## Deploy

From the `modules/` directory:

```bash
cd modules && ../gradlew :apps:site-initializer:site-initializer-govuk:deploy
```

The Gradle wrapper lives in the portal root, not in `modules/`. The module will be deployed to your running Liferay instance.

---

## Create a GOV.UK site

1. Go to **Control Panel → Sites → Sites**.

1. Click the **+** button to add a new site.

1. Select **GOV.UK** from the site initializer list.

1. Give the site a name and click **Add**.

Liferay will create the site with all fragments, the Style Book, and the master page pre-configured.

---

## Apply the Style Book and master page to a page

If you create additional pages manually:

- **Style Book:** open the page in the editor → top toolbar → Style Book icon → select **GOV UK**.
- **Master page:** page settings → Master → select **GOV.UK Standard**.

---

## Known limits and findings

See [`docs/poc-report.md`](docs/poc-report.md) for a full account of what the Style Book model covers, where it hits platform limits, and recommendations for projects that need higher fidelity.