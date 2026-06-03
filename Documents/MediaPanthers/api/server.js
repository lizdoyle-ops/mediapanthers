const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ── In-memory data store ──────────────────────────────────────────────────────

const customers = {
  "leyton@finalproduction.club": {
    name: "Leyton Graves", email: "leyton@finalproduction.club",
    tier: "Standard", account_status: "active", brand: "Media Panthers",
    language: "English", joined: "2024-03-15", lifetime_value: 1240,
    last_login: "2026-06-02 09:14", kyc_status: "verified",
    account_balance: null, suspension_reason: null, open_tickets: 1,
    notes: "High-frequency bettor. Usually active during major sporting events.",
  },
  "sarah@zestymedia.club": {
    name: "Liz Doyle", email: "sarah@zestymedia.club",
    tier: "VIP — Bahigo Plus", account_status: "suspended", brand: "Roxol — Bahigo Plus",
    language: "English", joined: "2023-07-22", lifetime_value: 8750,
    last_login: "2026-06-01 22:44", kyc_status: "pending",
    account_balance: 1240,
    suspension_reason: "Automated fraud check — pending manual review",
    open_tickets: 1,
    notes: "VIP customer. Suspension triggered automatically — escalate to compliance immediately. Do NOT apply standard resolution flow.",
  },
  "liz.doyle@cloudcontentconsulting.com": {
    name: "Sarah Connell", email: "liz.doyle@cloudcontentconsulting.com",
    tier: "Standard", account_status: "active", brand: "Roxol — Bahigo",
    language: "English", joined: "2025-01-08", lifetime_value: 420,
    last_login: "2026-06-02 11:02", kyc_status: "verified",
    account_balance: null, suspension_reason: null, open_tickets: 2,
    notes: "Has an expiring bonus — prioritise resolution.",
  },
};

const transactions = {
  "leyton@finalproduction.club": [
    { id: "tx_001", date: "2026-06-02 10:45", amount: 100, currency: "EUR", method: "Visa •••• 4242",       status: "failed",  failure_reason: "Insufficient funds at bank", type: "deposit" },
    { id: "tx_002", date: "2026-06-02 10:31", amount: 100, currency: "EUR", method: "Visa •••• 4242",       status: "failed",  failure_reason: "Bank timeout",               type: "deposit" },
    { id: "tx_003", date: "2026-05-28 14:20", amount:  50, currency: "EUR", method: "Mastercard •••• 9871", status: "success", failure_reason: null,                         type: "deposit" },
  ],
  "sarah@zestymedia.club": [
    { id: "tx_007", date: "2026-06-01 22:30", amount: 500, currency: "EUR", method: "Visa •••• 1122",       status: "success", failure_reason: null, type: "deposit" },
    { id: "tx_008", date: "2026-05-29 18:00", amount: 200, currency: "EUR", method: "Visa •••• 1122",       status: "success", failure_reason: null, type: "deposit" },
    { id: "tx_009", date: "2026-05-25 12:15", amount: 300, currency: "EUR", method: "Mastercard •••• 4490", status: "success", failure_reason: null, type: "deposit" },
  ],
  "liz.doyle@cloudcontentconsulting.com": [
    { id: "tx_004", date: "2026-06-02 11:00", amount: 50, currency: "EUR", method: "Mastercard •••• 3310", status: "failed",  failure_reason: "Card declined",              type: "deposit" },
    { id: "tx_005", date: "2026-06-02 10:55", amount: 50, currency: "EUR", method: "Visa •••• 7781",       status: "failed",  failure_reason: "3DS authentication failed", type: "deposit" },
    { id: "tx_006", date: "2026-05-30 19:10", amount: 30, currency: "EUR", method: "PayPal",               status: "success", failure_reason: null,                         type: "deposit" },
  ],
};

const paymentMethods = {
  "leyton@finalproduction.club": {
    saved: [
      { id: "pm_001", type: "visa",       last4: "4242", last_status: "failed"  },
      { id: "pm_002", type: "mastercard", last4: "9871", last_status: "success" },
    ],
    suggested_alternatives: ["PayPal", "Skrill", "Trustly"],
  },
  "sarah@zestymedia.club": {
    saved: [
      { id: "pm_005", type: "visa",       last4: "1122", last_status: "success" },
      { id: "pm_006", type: "mastercard", last4: "4490", last_status: "success" },
    ],
    suggested_alternatives: [],
  },
  "liz.doyle@cloudcontentconsulting.com": {
    saved: [
      { id: "pm_003", type: "mastercard", last4: "3310", last_status: "failed" },
      { id: "pm_004", type: "visa",       last4: "7781", last_status: "failed" },
    ],
    suggested_alternatives: ["PayPal", "Neteller", "Bank Transfer"],
  },
};

const promotions = {
  "leyton@finalproduction.club": [],
  "sarah@zestymedia.club": [],
  "liz.doyle@cloudcontentconsulting.com": [
    { id: "promo_001", name: "Weekend Boost", value: "€10 free bet", expires: "2026-06-02 23:59", brand: "Roxol — Bahigo", applied: false },
  ],
};

const sessions = {
  "leyton@finalproduction.club": [
    { timestamp: "2026-06-02 09:14", ip: "185.34.22.11", status: "success", device: "Chrome / macOS" },
    { timestamp: "2026-06-01 21:05", ip: "185.34.22.11", status: "success", device: "Chrome / macOS" },
  ],
  "sarah@zestymedia.club": [
    { timestamp: "2026-06-02 09:22", ip: "212.54.11.99", status: "blocked", device: "Chrome / Windows", reason: "Account suspended" },
    { timestamp: "2026-06-02 09:18", ip: "212.54.11.99", status: "blocked", device: "Chrome / Windows", reason: "Account suspended" },
    { timestamp: "2026-06-01 22:44", ip: "212.54.11.99", status: "success", device: "Chrome / Windows" },
  ],
  "liz.doyle@cloudcontentconsulting.com": [
    { timestamp: "2026-06-02 11:02", ip: "94.12.88.201", status: "success", device: "Safari / iPhone" },
    { timestamp: "2026-06-01 18:30", ip: "94.12.88.201", status: "success", device: "Safari / iPhone" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolve(req, res) {
  const email = decodeURIComponent(req.params.email).toLowerCase();
  if (!customers[email]) { res.status(404).json({ error: "Customer not found" }); return null; }
  return email;
}

function fmtBalance(c) {
  if (!c.account_balance) return null;
  return `€${c.account_balance.toLocaleString()}${c.account_status === "suspended" ? " (frozen)" : ""}`;
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/customers/:email/account", (req, res) => {
  const email = resolve(req, res); if (!email) return;
  const c = customers[email];
  res.json({ name: c.name, email: c.email, tier: c.tier, account_status: c.account_status,
    brand: c.brand, language: c.language, joined: c.joined,
    lifetime_value: `€${c.lifetime_value.toLocaleString()}`, last_login: c.last_login,
    kyc_status: c.kyc_status, account_balance: fmtBalance(c),
    suspension_reason: c.suspension_reason, open_tickets: c.open_tickets, notes: c.notes });
});

app.get("/customers/:email/transactions", (req, res) => {
  const email = resolve(req, res); if (!email) return;
  const limit = Math.max(1, parseInt(req.query.limit) || 5);
  res.json({ transactions: (transactions[email] || []).slice(0, limit) });
});

app.get("/customers/:email/payment-methods", (req, res) => {
  const email = resolve(req, res); if (!email) return;
  res.json(paymentMethods[email] || { saved: [], suggested_alternatives: [] });
});

app.get("/promotions/active", (req, res) => {
  const customerEmail = (req.query.customer || "").toLowerCase();
  const brand = req.query.brand || "";
  let promos = [];
  if (customerEmail && promotions[customerEmail]) {
    promos = promotions[customerEmail].filter(p => !p.applied);
  } else if (brand) {
    for (const list of Object.values(promotions))
      promos.push(...list.filter(p => p.brand === brand && !p.applied));
  }
  res.json({ promotions: promos });
});

app.get("/customers/:email/sessions", (req, res) => {
  const email = resolve(req, res); if (!email) return;
  res.json({ sessions: sessions[email] || [] });
});

app.post("/customers/:email/account/review", (req, res) => {
  const email = resolve(req, res); if (!email) return;
  res.json({ ok: true, review_id: `rev_${Math.random().toString(36).slice(2, 10)}`, status: "pending", message: "Compliance review triggered" });
});

app.patch("/customers/:email/account", (req, res) => {
  const email = resolve(req, res); if (!email) return;
  const { account_status } = req.body;
  if (account_status) {
    customers[email].account_status = account_status.toLowerCase();
    if (account_status.toLowerCase() === "active") customers[email].suspension_reason = null;
  }
  res.json({ ok: true, account_status: customers[email].account_status });
});

app.post("/customers/:email/transactions/retry", (req, res) => {
  const email = resolve(req, res); if (!email) return;
  const { method } = req.body;
  const prevFailed = (transactions[email] || []).filter(t => t.status === "failed").map(t => t.method);
  const success = !prevFailed.includes(method);
  const failedTx = (transactions[email] || []).find(t => t.status === "failed");
  const now = new Date().toISOString().replace("T", " ").slice(0, 16);
  const newTx = { id: `tx_${Math.random().toString(36).slice(2, 8)}`, date: now,
    amount: failedTx ? failedTx.amount : 50, currency: "EUR", method,
    status: success ? "success" : "failed", failure_reason: success ? null : "Card declined", type: "deposit" };
  transactions[email].unshift(newTx);
  res.json({ ok: true, transaction: newTx });
});

app.post("/customers/:email/promotions/apply", (req, res) => {
  const email = resolve(req, res); if (!email) return;
  const active = (promotions[email] || []).find(p => !p.applied);
  if (!active) return res.status(400).json({ error: "No active promotion found" });
  active.applied = true;
  const lastTx = (transactions[email] || [])[0];
  if (lastTx) lastTx.bonus = active.value;
  res.json({ ok: true, promotion: active, bonus_applied: active.value });
});

module.exports = app;
