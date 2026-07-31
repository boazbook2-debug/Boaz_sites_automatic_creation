"use client";

import { useState } from "react";
import clients from "@/data/clients";

export default function ClientLogin({ title, onSuccess, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
    );
    if (!client) {
      setError("אימייל או סיסמה שגויים.");
      return;
    }
    onSuccess(client);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[2rem] bg-[var(--color-surface)] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
      >
        <button type="button" onClick={onBack} className="mb-4 text-sm font-semibold text-[var(--color-main)]/60">
          ← חזרה
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-[var(--color-main)]/60">התחברו עם פרטי הגישה שקיבלתם.</p>

        <div className="mt-6 space-y-4 text-right">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">אימייל</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="w-full rounded-full border border-[var(--color-main)]/15 bg-[var(--color-background)] px-5 py-3 text-sm outline-none focus:border-[var(--color-accent2)]"
              autoFocus
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">סיסמה</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full rounded-full border border-[var(--color-main)]/15 bg-[var(--color-background)] px-5 py-3 text-sm outline-none focus:border-[var(--color-accent2)]"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-[var(--color-accent2)] px-8 py-3.5 text-base font-bold text-white shadow-[0_15px_35px_rgba(176,141,87,0.45)] transition hover:scale-105"
        >
          כניסה
        </button>
      </form>
    </div>
  );
}
