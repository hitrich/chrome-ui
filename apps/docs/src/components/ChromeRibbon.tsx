import desktopSource from "../assets/chrome-landing-desktop-source.png";
import mobileSource from "../assets/chrome-landing-mobile-source.png";

export function ChromeRibbon() {
  return (
    <div className="chrome-ribbon" aria-hidden="true">
      <picture>
        <source media="(max-width: 760px)" srcSet={mobileSource} />
        <img src={desktopSource} alt="" decoding="async" />
      </picture>
    </div>
  );
}
