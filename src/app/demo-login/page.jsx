"use client";

import { useState } from "react";

// Deliberately agency-agnostic — no agency data import here, so even this
// login page never renders anything specific to the gated site.
export default function DemoLoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        setError(true);
        setLoading(false);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-neutral-900">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl bg-white p-10 text-center shadow-xl">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-xl font-extrabold tracking-tight">תצוגה מוגנת בסיסמה</h1>
        <p className="mt-2 text-sm text-neutral-500">יש להזין קוד גישה לצפייה.</p>
        <input
          type="text"
          placeholder="קוד גישה"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          className={`mt-6 w-full rounded-full border px-6 py-3.5 text-center text-lg font-medium outline-none transition ${
            error ? "border-red-400" : "border-neutral-200 focus:border-neutral-400"
          }`}
          autoFocus
        />
        {error && <p className="mt-2 text-sm font-medium text-red-600">קוד שגוי, נסו שוב.</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-neutral-900 px-8 py-3.5 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "בודק..." : "כניסה"}
        </button>
      </form>
    </div>
  );
}
