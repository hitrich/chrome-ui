import { Link } from "react-router-dom";

export function Brand({ suffix }: { suffix?: string }) {
  return (
    <Link className="brand" to="/" aria-label="Chrome home">
      <span>CHROME</span>
      {suffix ? <small>/ {suffix}</small> : null}
    </Link>
  );
}
