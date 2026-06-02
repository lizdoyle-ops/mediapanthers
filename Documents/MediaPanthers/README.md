# Customer 360 — Front Plugin

A Front sidebar plugin for Media Panthers support agents. Shows deposit history, account status, and payment suggestions for the current conversation contact.

---

## 1. Run the local API

The plugin fetches live data from a local Express server.

```bash
npm install
node server.js
# → Customer 360 API running on http://localhost:3000
```

Leave this running while using the plugin. The mock data is in-memory — all write actions (retry, lift suspension, etc.) mutate state for the session.

---

## 2. Seed emails into Front

The seed script imports 3 test conversations into inbox `inb_51jbh`.

**Prerequisites:** Node.js 18+ (uses native `fetch`).

```bash
FRONT_API_TOKEN=your_token_here node seed-emails.js
```

The script logs the `conversation_id` for each imported message so you can open them directly in Front.

---

## 2. Serve the plugin locally

```bash
npx serve .
```

The plugin will be available at `http://localhost:3000` (or whichever port `serve` picks — check the terminal output).

Alternatively, any static file server works:

```bash
python3 -m http.server 3000
```

---

## 3. Load the plugin in Front

1. Go to **Settings → Integrations & API → Plugins**
2. Click **Add custom plugin**
3. Enter the local URL: `http://localhost:3000`
4. Open any of the three seeded conversations — the sidebar card will populate automatically

---

## Test contacts

| Email | Scenario |
|---|---|
| `leyton@finalproduction.club` | Deposit failures (Visa timeouts) |
| `sarah@zestymedia.club` | Deposit failures + expiring bonus |
| `liz.doyle@cloudcontentconsulting.com` | VIP — suspended account |

---

## Files

| File | Purpose |
|---|---|
| `seed-emails.js` | One-time setup: imports 3 conversations into Front |
| `index.html` | The plugin (self-contained, no build step) |
| `manifest.json` | Plugin metadata |
| `README.md` | This file |
