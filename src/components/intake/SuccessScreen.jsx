export default function SuccessScreen({ onAddAnother, onEditExisting }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm rounded-[2rem] bg-[var(--color-surface)] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
        <p className="text-5xl">✅</p>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">הנכס הועלה בהצלחה!</h1>
        <p className="mt-2 text-[var(--color-main)]/60">הפרטים נשמרו. שלחו את הקוד שנוצר לבועז לעדכון האתר החי.</p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onAddAnother}
            className="w-full rounded-full bg-[var(--color-accent2)] px-8 py-3.5 text-base font-bold text-white shadow-[0_15px_35px_rgba(176,141,87,0.45)] transition hover:scale-105"
          >
            הוסיפו נכס נוסף
          </button>
          <button
            type="button"
            onClick={onEditExisting}
            className="w-full rounded-full border-2 border-[var(--color-main)]/20 px-8 py-3.5 text-base font-bold transition hover:bg-[var(--color-background)]"
          >
            עריכת נכסים קיימים
          </button>
        </div>
      </div>
    </div>
  );
}
