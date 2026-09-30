export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const cls = variant === 'ghost' ? 'btn-ghost' : 'btn-primary';
  return (
    <button className={`${cls} ${className}`} {...props}>
      {children}
    </button>
  );
}
