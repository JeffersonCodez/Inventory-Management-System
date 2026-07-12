export default function FormField({ label, children, className = '', hint }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="field-label">{label}</label>}
      {children}
      {hint && <div className="mt-1.5 text-[11.5px] text-ink-muted">{hint}</div>}
    </div>
  );
}
