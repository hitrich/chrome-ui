import { NavLink } from "react-router-dom";
import { componentDocs, foundationDocs } from "../data";

export function DocsRail() {
  return (
    <aside className="docs-rail" aria-label="Documentation">
      <section>
        <h2>Foundations</h2>
        {foundationDocs.slice(0, 3).map((item) => (
          <NavLink key={item.slug} to={`/foundations/${item.slug}`}>{item.title}</NavLink>
        ))}
      </section>
      <section>
        <h2>Components</h2>
        {componentDocs.filter((item) => item.slug !== "chrome-provider" && item.slug !== "avatar").map((item) => (
          <NavLink key={item.slug} to={`/components/${item.slug}`}>{item.title}</NavLink>
        ))}
      </section>
    </aside>
  );
}
