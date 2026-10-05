import { useEffect, useId, useRef } from 'react';
export default function Modal({ open, title, children, onClose }) {
  const panel = useRef(null); const titleId = useId(); const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement; const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; panel.current?.focus();
    function keyboard(event) {
      if (event.key === 'Escape') { event.preventDefault(); close.current?.(); }
      if (event.key !== 'Tab') return;
      const controls = [...panel.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
      if (!controls.length) { event.preventDefault(); return; }
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('keydown', keyboard); document.body.style.overflow = overflow; previous?.focus(); };
  }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4"><div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-lg"><div className="mb-4 flex items-center justify-between gap-3"><h2 id={titleId} className="text-xl font-semibold">{title}</h2><button type="button" onClick={onClose} className="rounded border px-3 py-1 text-sm">Close</button></div>{children}</div></div>;
}
