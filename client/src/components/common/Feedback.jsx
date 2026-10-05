export default function Feedback({ kind = 'info', title, children, action }) {
  return <div className={`ui-feedback ui-feedback-${kind}`} role={kind === 'error' ? 'alert' : 'status'}><div>{title && <p className="ui-feedback-title">{title}</p>}{children && <div>{children}</div>}</div>{action}</div>;
}
