/** The Chrome brand mark (`.logo`): a smoked chrome bead with the C cut out. Decorative; label the link around it. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={className ? `logo ${className}` : "logo"} aria-hidden="true">
      <span />
    </span>
  );
}
