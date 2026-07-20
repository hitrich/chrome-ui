import * as React from "react";
import { cx } from "./utils";

export type ChromeTheme = "ink" | "arctic";
export type ChromeMotion = "system" | "full" | "reduced";

type ChromeContextValue = {
  theme: ChromeTheme;
  setTheme: (theme: ChromeTheme) => void;
  motion: ChromeMotion;
};

const fallbackContext: ChromeContextValue = {
  theme: "ink",
  setTheme: () => undefined,
  motion: "system"
};

const ChromeContext = React.createContext<ChromeContextValue>(fallbackContext);

export interface ChromeProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: ChromeTheme;
  defaultTheme?: ChromeTheme;
  motion?: ChromeMotion;
  onThemeChange?: (theme: ChromeTheme) => void;
}

export function ChromeProvider({
  theme: controlledTheme,
  defaultTheme = "ink",
  motion = "system",
  onThemeChange,
  className,
  children,
  ...props
}: ChromeProviderProps) {
  const [internalTheme, setInternalTheme] = React.useState<ChromeTheme>(defaultTheme);
  const theme = controlledTheme ?? internalTheme;

  const setTheme = React.useCallback(
    (nextTheme: ChromeTheme) => {
      if (controlledTheme === undefined) setInternalTheme(nextTheme);
      onThemeChange?.(nextTheme);
    },
    [controlledTheme, onThemeChange]
  );

  const value = React.useMemo(() => ({ theme, setTheme, motion }), [motion, setTheme, theme]);

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
