export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const cls = variant === 'ghost' || variant === 'secondary' ? 'btn-ghost' : variant === 'danger' ? 'btn-danger' : 'btn-primary';
  return <button className={`${cls} ${className}`} {...props}>{children}</button>;
}
