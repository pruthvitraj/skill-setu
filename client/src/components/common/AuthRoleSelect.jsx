import { useEffect, useId, useRef, useState } from 'react';
import { GraduationCap, Building2, Briefcase, ChevronDown, Check } from 'lucide-react';
const icons = { student: GraduationCap, tpo: Building2, recruiter: Briefcase };
export default function AuthRoleSelect({ value, onChange, options }) {
  const id = useId(), root = useRef(null), trigger = useRef(null), typeahead = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, options.findIndex(option => option.value === value));
  const [active, setActive] = useState(selected);
  const CurrentIcon = icons[options[selected].value];
  useEffect(() => {
    if (!open) return;
    const dismiss = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  function expand(index = selected) { setActive(index); setOpen(true); }
  function choose(index) { onChange(options[index].value); setOpen(false); trigger.current?.focus(); }
  function keyDown(event) {
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Escape') { if (open) { event.preventDefault(); setOpen(false); } return; }
    if (['Enter', ' '].includes(event.key)) { event.preventDefault(); open ? choose(active) : expand(); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home') expand(0);
      else if (event.key === 'End') expand(options.length - 1);
      else if (!open) expand();
      else setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = (now - typeahead.current.time < 600 ? typeahead.current.text : '') + event.key.toLowerCase();
      typeahead.current = { text, time: now };
      const next = options.findIndex(option => option.label.toLowerCase().startsWith(text));
      if (next >= 0) expand(next);
    }
  }
  return <div className="auth-role-dropdown" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label id={`${id}-label`} className="label" htmlFor={`${id}-trigger`}>Select role</label>
    <button id={`${id}-trigger`} ref={trigger} type="button" role="combobox" className="input auth-role-trigger"
      value={value} aria-labelledby={`${id}-label`} aria-describedby={`${id}-value`}
      aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`}
      aria-activedescendant={open ? `${id}-option-${active}` : undefined}
      onKeyDown={keyDown} onClick={() => open ? setOpen(false) : expand()}>
      <CurrentIcon size={18} aria-hidden="true" /><span id={`${id}-value`}>{options[selected].label}</span><ChevronDown size={18} className="auth-role-chevron" aria-hidden="true" />
    </button>
    {open && <ul id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className="auth-role-menu">
      {options.map((option, index) => { const Icon = icons[option.value]; return <li key={option.value} id={`${id}-option-${index}`} role="option"
        aria-selected={option.value === value} data-active={index === active} className="auth-role-option"
        onPointerDown={event => event.preventDefault()} onPointerMove={event => { if (event.pointerType === 'mouse') setActive(index); }} onClick={() => choose(index)}>
        <Icon size={18} aria-hidden="true" /><span>{option.label}</span>{option.value === value && <Check size={18} className="auth-role-selected" aria-hidden="true" />}
      </li>; })}
    </ul>}
  </div>;
}
