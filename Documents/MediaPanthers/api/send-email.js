export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.FRONT_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "FRONT_API_TOKEN not configured" });
  }

  const INBOX_ID = "inb_51jbh";

  try {
    const response = await fetch(
      `https://api2.frontapp.com/inboxes/${INBOX_ID}/imported_messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const text = await response.text();
    const status = response.status;

    if (status === 202 || response.ok) {
      return res.status(200).json({ ok: true, status });
    } else {
      return res.status(status).json({ ok: false, error: text });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
