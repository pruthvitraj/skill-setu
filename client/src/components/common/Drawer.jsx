export default function Drawer({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <aside className="h-full w-full max-w-md bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        {children}
      </aside>
    </div>
  );
}
