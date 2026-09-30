export default function Input({ label, ...props }) {
  return (
    <label className="block">
      {label ? <span className="label">{label}</span> : null}
      <input className="input" {...props} />
    </label>
  );
}
