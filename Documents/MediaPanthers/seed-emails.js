#!/usr/bin/env node

const FRONT_API_TOKEN = process.env.FRONT_API_TOKEN;
const INBOX_ID = "inb_51jbh";

if (!FRONT_API_TOKEN) {
  console.error("Error: FRONT_API_TOKEN environment variable is not set.");
  process.exit(1);
}

async function importMessage(payload) {
  const res = await fetch(`https://api2.frontapp.com/inboxes/${INBOX_ID}/imported_messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FRONT_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }

  // Front returns 202 with a Conversation-Id header for imported messages
  const conversationId = res.headers.get("conversation_id") || res.headers.get("x-conversation-id");
  let json = null;
  const text = await res.text();
  if (text) {
    try { json = JSON.parse(text); } catch (_) {}
  }
  return { conversationId, json };
}

const now = Math.floor(Date.now() / 1000);

const emails = [
  {
    label: "Leyton — deposit failure",
    payload: {
      type: "email",
      created_at: now,
      metadata: { is_inbound: true },
      sender: { handle: "leyton@finalproduction.club", name: "Leyton" },
      to: [{ handle: "support@mediapanthers.com", name: "Support" }],
      subject: "My deposit keeps failing",
      body: "Hi, I've tried to deposit €100 three times in the last hour and it keeps failing. Each time I get a generic error. I really need this sorted — I'm trying to place a bet before the match starts tonight. Please help ASAP.",
    },
  },
  {
    label: "Sarah — deposit failure with payment method question",
    payload: {
      type: "email",
      created_at: now,
      metadata: { is_inbound: true },
      sender: { handle: "sarah@zestymedia.club", name: "Sarah" },
      to: [{ handle: "support@mediapanthers.com", name: "Support" }],
      subject: "Deposit failed - which payment methods work?",
      body: "Hello, my deposit of €50 failed twice. I tried Visa and Mastercard. Are there other payment options I can use? I have a bonus expiring today so I really need to get this sorted quickly. Thanks, Sarah",
    },
  },
  {
    label: "Liz — account access issue",
    payload: {
      type: "email",
      created_at: now,
      metadata: { is_inbound: true },
      sender: { handle: "liz.doyle@cloudcontentconsulting.com", name: "Liz" },
      to: [{ handle: "support@mediapanthers.com", name: "Support" }],
      subject: "Can't log into my account",
      body: "Hi there, I've been trying to log in for the past 30 minutes and keep getting \"account suspended\" error. I haven't done anything wrong and I have funds in my account. I tried resetting my password but still can't get in. Please help.",
    },
  },
];

(async () => {
  for (const email of emails) {
    try {
      const result = await importMessage(email.payload);
      console.log(`✓ ${email.label}`);
      console.log(`  conversation_id: ${result.conversationId || "(see response)"}`);
      if (result.json) console.log(`  response:`, JSON.stringify(result.json, null, 2));
    } catch (err) {
      console.error(`✗ ${email.label}: ${err.message}`);
    }
  }
})();
