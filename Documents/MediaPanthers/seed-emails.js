#!/usr/bin/env node

const FRONT_API_TOKEN = process.env.FRONT_API_TOKEN;
const INBOX_ID = "inb_51jbh";
const TO_ADDRESS = "logistics-support@testforfront.com";

if (!FRONT_API_TOKEN) {
  console.error("Error: FRONT_API_TOKEN environment variable is not set.");
  process.exit(1);
}

function buildRef() {
  const ts = Math.floor(Date.now() / 1000);
  const rand = Math.floor(Math.random() * 1000);
  return ts + rand;
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

  const text = await res.text();
  if (!res.ok && res.status !== 202) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const conversationId = res.headers.get("conversation_id") || res.headers.get("x-conversation-id");
  let json = null;
  if (text) { try { json = JSON.parse(text); } catch (_) {} }
  return { conversationId, json };
}

const TEMPLATE_BODY = `<p>Hi Liz,</p><p>I'm writing to formally raise a complaint regarding the ongoing lack of response to maintenance issues at my property at 42 Elm Street, Manchester, M4 2BX (Ref: LRG-MCR-004821).</p><p>Over the past six weeks I have reported the following issues on three separate occasions with no resolution: a persistent damp patch spreading across the bedroom ceiling, a broken extractor fan in the bathroom causing condensation, and a front door that does not close properly leaving the property unsecured overnight.</p><p>Despite my emails on 14th February, 28th February and 12th March, I have received no acknowledgement, no contractor visit has been arranged, and I have had no update on when these issues will be resolved. This is now affecting my health and my family's safety and I consider this a breach of the landlord's repair obligations under the Landlord and Tenant Act 1985.</p><p>If I do not receive a formal response and a confirmed contractor appointment within 48 hours, I will have no option but to escalate this to the Property Redress Scheme and seek independent legal advice regarding rent withholding.</p><p>I expect to hear from you urgently.<br><br>Leyton Graves<br>Tenant - 42 Elm Street, Manchester, M4 2BX<br>07700 900 312</p>`;

const emails = [
  {
    label: "Leyton — deposit failure",
    sender: { handle: "leyton@finalproduction.club", name: "Leyton Graves", source: "email" },
    subject: "Repeated Failure to Address Maintenance Issues",
  },
  {
    label: "Sarah — deposit failure with payment method question",
    sender: { handle: "sarah@zestymedia.club", name: "Sarah Connell", source: "email" },
    subject: "Repeated Failure to Address Maintenance Issues",
  },
  {
    label: "Liz — account access issue",
    sender: { handle: "liz.doyle@cloudcontentconsulting.com", name: "Liz Doyle", source: "email" },
    subject: "Repeated Failure to Address Maintenance Issues",
  },
];

(async () => {
  for (const email of emails) {
    const ref = buildRef();
    const ts = Math.floor(Date.now() / 1000);

    const payload = {
      sender: email.sender,
      to: [TO_ADDRESS],
      subject: email.subject,
      body: TEMPLATE_BODY,
      body_format: "html",
      type: "email",
      external_id: String(ref),
      created_at: ts,
      metadata: {
        thread_ref: String(ref),
        is_inbound: true,
        should_skip_rules: false,
        is_archived: false,
      },
    };

    try {
      const result = await importMessage(payload);
      console.log(`✓ ${email.label}`);
      console.log(`  external_id / thread_ref: ${ref}`);
      console.log(`  conversation_id: ${result.conversationId || "(see response)"}`);
      if (result.json) console.log(`  response:`, JSON.stringify(result.json, null, 2));
    } catch (err) {
      console.error(`✗ ${email.label}: ${err.message}`);
    }
  }
})();
