export default function Select({ label, options = [], ...props }) {
  return (
    <label className="block">
      {label ? <span className="label">{label}</span> : null}
      <select className="input" {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
