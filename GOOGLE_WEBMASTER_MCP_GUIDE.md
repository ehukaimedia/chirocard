# Google Webmaster MCP Context & Guide

## Overview
This project uses the **Google Webmaster MCP** tool to automate SEO and Analytics configurations. It allows for programmatic management of Google Tag Manager (GTM), Google Analytics 4 (GA4), and Google Search Console (GSC).

## 📍 Tool Location
The MCP tool is located at:
`/Volumes/Extreme SSD/AI-Applications/Google-Webmaster-MCP`

## 🔑 Prerequisites & Configuration
The tool relies on observing the environment variables in the **current project's** `.env` file.

### Required `.env` Variables
Ensure these variables are present in `chirocard/.env`:
```env
GTM_ID=GTM-5RGKKRRX          # ChiroCard Container ID
GA4_MID=G-332SVBSS86         # ChiroCard Measurement ID
# Optional for other features:
# GSC_SITE=https://chirocard.com
# BUSINESS_LOCATION_ID=...
```

## 🛠️ Usage Patterns

### 1. Custom Automation Scripts (Preferred)
For complex or specific setups (like our KPI tags), it is best to **adapt** existing scripts from the MCP repository rather than using the generic CLI commands.

**Example: `scripts/setup_chirocard_tags.js`**
We created this script to:
1.  Connect to GTM.
2.  Create specific **Variables** (`DLV - type`, `DLV - id`).
3.  Create specific **Triggers** (`begin_session`, `complete_routine`).
4.  Create **Tags** with custom parameters mapping to those variables.

### 2. Rate Limiting (CRITICAL)
The GTM API has strict rate limits. When writing automation scripts:
-   **ALWAYS** include a delay between API calls.
-   **Recommended Delay**: `5000ms` (5 seconds).
-   If you see `429 Too Many Requests`, increase the delay.

```javascript
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// ... inside your loop
await gtm.createTag(...);
await delay(5000); 
```

### 3. "Unknown Variable" Errors
If you create a Tag that references a variable (e.g., `{{DLV - name}}`), you **MUST** ensure that variable is also created in GTM's "Variables" list. The API will validate this upon Publication and fail if it's missing.

## 🔍 Verification Workflow

1.  **Browser Verification**:
    -   Use the browser agent to click elements.
    -   Inspect `window.dataLayer` **immediately** (without reloading) to verify custom events are pushed.
    -   Example: `trackEvent('view_promotion', ...)` should push `{ event: 'view_promotion', ... }`.

2.  **Tag Assistant**:
    -   Publish the GTM container.
    -   Use [Tag Assistant](https://tagassistant.google.com/) to connect to the local or live site.
    -   Perform actions (e.g., click "New Session").
    -   Verify tags move from "Tags Not Fired" to "Tags Fired".

## 📂 Key Files
-   `src/utils/analytics.ts`: Centralized `trackEvent` function.
-   `scripts/setup_chirocard_tags.js`: (Reference) The script used to set up the current tags.
-   `scripts/cleanup_irrelevant_tags.js`: (Reference) Used to clean up accidental generic tags.

## 🤖 Agent Instructions
When working on Analytics/SEO in future sessions:
1.  Check `GOOGLE_WEBMASTER_MCP_GUIDE.md` first.
2.  Load `.env` variables manually in node scripts if running them via `run_command`.
3.  Use `dist/gtm/client.js` from the MCP directory for imports.
