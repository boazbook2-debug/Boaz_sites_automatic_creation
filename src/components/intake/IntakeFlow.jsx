"use client";

import { useState, useEffect } from "react";
import IntakeForm from "./IntakeForm";
import ClientLogin from "./ClientLogin";
import ClientPropertyForm from "./ClientPropertyForm";
import ClientEditList from "./ClientEditList";
import SuccessScreen from "./SuccessScreen";

const ADMIN_PASSWORD = "5659";

function Landing({ onSelect }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">שאלון הקמת ועדכון אתרים</h1>
      <p className="max-w-lg text-lg text-[var(--color-main)]/60">בחרו את הפעולה המתאימה לכם</p>

      <div className="mt-4 grid w-full gap-5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onSelect("admin-password")}
          className="rounded-[2rem] bg-[var(--color-surface)] p-8 text-right shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)]"
        >
          <p className="text-3xl">🔐</p>
          <p className="mt-3 text-lg font-bold">אדמין בלבד</p>
          <p className="mt-1 text-sm text-[var(--color-main)]/60">רישום לקוח חדש והקמת אתר</p>
        </button>

        <button
          type="button"
          onClick={() => onSelect("client-login-add")}
          className="rounded-[2rem] bg-[var(--color-surface)] p-8 text-right shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)]"
        >
          <p className="text-3xl">➕</p>
          <p className="mt-3 text-lg font-bold">הוספת נכס</p>
          <p className="mt-1 text-sm text-[var(--color-main)]/60">ללקוחות קיימים</p>
        </button>

        <button
          type="button"
          onClick={() => onSelect("client-login-edit")}
          className="rounded-[2rem] bg-[var(--color-surface)] p-8 text-right shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)]"
        >
          <p className="text-3xl">✏️</p>
          <p className="mt-3 text-lg font-bold">עדכון נכס קיים</p>
          <p className="mt-1 text-sm text-[var(--color-main)]/60">ללקוחות קיימים</p>
        </button>
      </div>
    </div>
  );
}

function AdminPasswordGate({ onSuccess, onBack }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) onSuccess();
    else setError(true);
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
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">אזור אדמין</h1>
        <p className="mt-2 text-[var(--color-main)]/60">שאלון זה מיועד לשימוש פנימי בלבד.</p>

        <input
          type="password"
          placeholder="סיסמה"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          className={`mt-6 w-full rounded-full border bg-[var(--color-background)] px-6 py-3.5 text-center text-lg font-medium outline-none transition ${
            error ? "border-red-400" : "border-[var(--color-main)]/15 focus:border-[var(--color-accent2)]"
          }`}
          autoFocus
        />
        {error && <p className="mt-2 text-sm font-medium text-red-600">סיסמה שגויה, נסו שוב.</p>}

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

function AdminDashboard({ onCreateNew, onSelectSite, onBack }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => setSites(data.sites || []))
      .catch(() => setSites([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <button type="button" onClick={onBack} className="mb-6 text-sm font-semibold text-[var(--color-main)]/60">
        ← חזרה
      </button>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">אתרי לקוחות</h1>
      <p className="mt-2 text-[var(--color-main)]/60">בחרו אתר קיים לעריכה, או צרו אתר חדש</p>

      {loading ? (
        <p className="mt-10 text-[var(--color-main)]/60">טוען...</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => onSelectSite(site.id)}
              className="rounded-[2rem] bg-[var(--color-surface)] p-8 text-right shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)]"
            >
              <p className="text-lg font-bold">{site.name}</p>
              {site.liveUrl && (
                <p className="mt-1 truncate text-sm text-[var(--color-accent2)]">{site.liveUrl.replace("https://", "")}</p>
              )}
            </button>
          ))}

          <button
            type="button"
            onClick={onCreateNew}
            className="rounded-[2rem] bg-[var(--color-main)] p-8 text-right text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.25)]"
          >
            <p className="text-3xl">➕</p>
            <p className="mt-3 text-lg font-bold">צור אתר חדש</p>
            <p className="mt-1 text-sm text-white/60">רישום לקוח חדש</p>
          </button>
        </div>
      )}
    </div>
  );
}

export default function IntakeFlow() {
  const [step, setStep] = useState("landing");
  const [client, setClient] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState(null);

  if (step === "landing") return <Landing onSelect={setStep} />;

  if (step === "admin-password") {
    return <AdminPasswordGate onSuccess={() => setStep("admin-dashboard")} onBack={() => setStep("landing")} />;
  }

  if (step === "admin-dashboard") {
    return (
      <AdminDashboard
        onCreateNew={() => {
          setSelectedSiteId(null);
          setStep("admin-form");
        }}
        onSelectSite={(id) => {
          setSelectedSiteId(id);
          setStep("admin-form");
        }}
        onBack={() => setStep("admin-password")}
      />
    );
  }

  if (step === "admin-form") {
    return <IntakeForm siteId={selectedSiteId} onBack={() => setStep("admin-dashboard")} />;
  }

  if (step === "client-login-add") {
    return (
      <ClientLogin
        title="הוספת נכס — התחברות"
        onSuccess={(c) => {
          setClient(c);
          setStep("client-add");
        }}
        onBack={() => setStep("landing")}
      />
    );
  }

  if (step === "client-login-edit") {
    return (
      <ClientLogin
        title="עדכון נכס — התחברות"
        onSuccess={(c) => {
          setClient(c);
          setStep("client-edit-list");
        }}
        onBack={() => setStep("landing")}
      />
    );
  }

  if (step === "client-add") {
    return (
      <ClientPropertyForm
        title="הוספת נכס חדש"
        initialProperty={{}}
        client={client}
        onSaved={() => setStep("client-success")}
        onBack={() => setStep("client-login-add")}
      />
    );
  }

  if (step === "client-edit-list") {
    return (
      <ClientEditList
        client={client}
        onSelect={(property) => {
          setSelectedProperty(property);
          setStep("client-edit-form");
        }}
        onBack={() => setStep("landing")}
      />
    );
  }

  if (step === "client-edit-form") {
    return (
      <ClientPropertyForm
        title={`עריכת נכס: ${selectedProperty.title}`}
        initialProperty={selectedProperty}
        client={client}
        onSaved={() => setStep("client-success")}
        onBack={() => setStep("client-edit-list")}
      />
    );
  }

  if (step === "client-success") {
    return (
      <SuccessScreen
        onAddAnother={() => setStep("client-add")}
        onEditExisting={() => setStep(client ? "client-edit-list" : "client-login-edit")}
      />
    );
  }

  return null;
}
