// Push notifications via ntfy.sh — no account, no API key. Pick a private,
// hard-to-guess topic name (set NTFY_TOPIC in env) and subscribe to it in the
// free ntfy iOS app to receive these on your phone.
const TOPIC = process.env.NTFY_TOPIC || "boaz-realestate-alerts-9f3k2";

export async function sendNtfy({ title, message }) {
  try {
    await fetch(`https://ntfy.sh/${TOPIC}`, {
      method: "POST",
      headers: { title: encodeURIComponent(title) },
      body: message,
    });
  } catch {
    // Non-fatal — a missed notification shouldn't block the actual action.
  }
}
