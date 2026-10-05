export default function PageHeader({ title, description, actions }) {
  return <header className="ui-page-header"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="ui-header-actions">{actions}</div>}</header>;
}
export function SectionHeading({ title, description, actions }) {
  return <div className="ui-section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{actions}</div>;
}
