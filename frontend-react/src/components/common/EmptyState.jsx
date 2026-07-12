export default function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center text-ink-muted">
      {Icon && <Icon size={36} strokeWidth={1.5} />}
      <p className="text-[13.5px]">{message}</p>
    </div>
  );
}
