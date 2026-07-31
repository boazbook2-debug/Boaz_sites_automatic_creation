function Label({ label, required }) {
  return (
    <span className="mb-1.5 block text-sm font-semibold text-[var(--color-main)]/80">
      {label}
      {required && <span className="mr-1 text-red-500">*</span>}
    </span>
  );
}

function ErrorText({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs font-medium text-red-500">{error}</p>;
}

export function TextField({ label, value, onChange, placeholder, type = "text", required = false, error }) {
  return (
    <label className="block">
      <Label label={label} required={required} />
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none ${
          error ? "border-red-400" : "border-[var(--color-main)]/15 focus:border-[var(--color-accent2)]"
        }`}
      />
      <ErrorText error={error} />
    </label>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3, required = false, error }) {
  return (
    <label className="block">
      <Label label={label} required={required} />
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full resize-none rounded-xl border bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none ${
          error ? "border-red-400" : "border-[var(--color-main)]/15 focus:border-[var(--color-accent2)]"
        }`}
      />
      <ErrorText error={error} />
    </label>
  );
}

export function SelectField({ label, value, onChange, options, required = false, error }) {
  return (
    <label className="block">
      <Label label={label} required={required} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none ${
          error ? "border-red-400" : "border-[var(--color-main)]/15 focus:border-[var(--color-accent2)]"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ErrorText error={error} />
    </label>
  );
}

export function ColorField({ label, value, onChange, required = false, error }) {
  return (
    <label className="block">
      <Label label={label} required={required} />
      <div className="flex items-center gap-2">
        <span
          className="h-9 w-9 shrink-0 rounded-full border border-[var(--color-main)]/15"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none ${
            error ? "border-red-400" : "border-[var(--color-main)]/15 focus:border-[var(--color-accent2)]"
          }`}
        />
      </div>
      <ErrorText error={error} />
    </label>
  );
}

export function FileField({ label, onChange, multiple = false, required = false, error }) {
  return (
    <label className="block">
      <Label label={label} required={required} />
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => onChange(multiple ? Array.from(e.target.files) : e.target.files[0])}
        className={`w-full rounded-xl border border-dashed bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none file:ml-3 file:rounded-full file:border-0 file:bg-[var(--color-accent2)] file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white ${
          error ? "border-red-400" : "border-[var(--color-main)]/25"
        }`}
      />
      <ErrorText error={error} />
    </label>
  );
}

export function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-[2rem] bg-[var(--color-surface)] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-[var(--color-main)]/60">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}
