import * as React from "react";
import { cx } from "./utils";

/** "arctic" is the 0.1 name for Satin and renders identically. */
export type ChromeTheme = "ink" | "satin" | "arctic";
export type ChromeMotion = "system" | "full" | "reduced";

type ChromeContextValue = {
  theme: ChromeTheme;
  setTheme: (theme: ChromeTheme) => void;
  motion: ChromeMotion;
  setMotion: (motion: ChromeMotion) => void;
};

const fallbackContext: ChromeContextValue = {
  theme: "ink",
  setTheme: () => undefined,
  motion: "system",
  setMotion: () => undefined
};

const ChromeContext = React.createContext<ChromeContextValue>(fallbackContext);

export interface ChromeProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: ChromeTheme;
  defaultTheme?: ChromeTheme;
  motion?: ChromeMotion;
  defaultMotion?: ChromeMotion;
  onThemeChange?: (theme: ChromeTheme) => void;
  onMotionChange?: (motion: ChromeMotion) => void;
}

export function ChromeProvider({
  theme: controlledTheme,
  defaultTheme = "ink",
  motion: controlledMotion,
  defaultMotion = "system",
  onThemeChange,
  onMotionChange,
  className,
  children,
  ...props
}: ChromeProviderProps) {
  const [internalTheme, setInternalTheme] = React.useState<ChromeTheme>(defaultTheme);
  const [internalMotion, setInternalMotion] = React.useState<ChromeMotion>(defaultMotion);
  const theme = controlledTheme ?? internalTheme;
  const motion = controlledMotion ?? internalMotion;

  const setTheme = React.useCallback(
    (nextTheme: ChromeTheme) => {
      if (controlledTheme === undefined) setInternalTheme(nextTheme);
      onThemeChange?.(nextTheme);
    },
    [controlledTheme, onThemeChange]
  );

  const setMotion = React.useCallback(
    (nextMotion: ChromeMotion) => {
      if (controlledMotion === undefined) setInternalMotion(nextMotion);
      onMotionChange?.(nextMotion);
    },
    [controlledMotion, onMotionChange]
  );

  const value = React.useMemo(
    () => ({ theme, setTheme, motion, setMotion }),
    [motion, setMotion, setTheme, theme]
  );

  return (
    <ChromeContext.Provider value={value}>
      <div
        className={cx("chrome-root", className)}
        data-chrome-theme={theme}
        data-chrome-motion={motion}
        {...props}
      >
        {children}
      </div>
    </ChromeContext.Provider>
  );
}

export function useChrome() {
  return React.useContext(ChromeContext);
}

export function ChromePortalLayer({ children }: { children: React.ReactNode }) {
  const { theme, motion } = useChrome();
  return (
    <div className="chrome-root chrome-portal-layer" data-chrome-theme={theme} data-chrome-motion={motion}>
      {children}
    </div>
  );
}
