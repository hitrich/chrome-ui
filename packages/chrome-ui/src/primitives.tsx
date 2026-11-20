import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Slot, Slottable } from "@radix-ui/react-slot";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cx } from "./utils";

/** @deprecated use `ButtonFinish`. */
export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonFinish = "polished" | "smoked" | "cobalt" | "enamel" | "graphite" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";
export type ButtonElement = HTMLElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Material and intent. Default "graphite". */
  finish?: ButtonFinish;
  /** @deprecated use `finish` (primary → polished, secondary → graphite, quiet → ghost, danger → enamel). `finish` wins. */
  variant?: ButtonVariant;
  /** Height 30, 36, 44 or 52 px. */
  size?: ButtonSize;
  /** Centred spinner over the hidden label (keeps the width), sets aria-busy and ignores presses. */
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  asChild?: boolean;
  /** No press travel, for dense toolbars. */
  static?: boolean;
}

const variantFinish: Record<ButtonVariant, ButtonFinish> = {
  primary: "polished",
  secondary: "graphite",
  quiet: "ghost",
  danger: "enamel"
};

export const Button = React.forwardRef<ButtonElement, ButtonProps>(function Button(
  {
    finish,
    variant,
    size = "md",
    loading = false,
    leadingIcon,
    trailingIcon,
    asChild = false,
    static: isStatic = false,
    className,
    type,
    children,
    onClickCapture,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : "button";
  // capture phase, so a loading part also swallows the press before an asChild element's own onClick
  const handleClickCapture = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClickCapture?.(event);
  };
  return (
    <Comp
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
      className={cx("chrome-button", className)}
      data-finish={finish ?? (variant ? variantFinish[variant] : "graphite")}
      data-variant={variant}
      data-size={size}
      data-static={isStatic || undefined}
      data-loading={loading || undefined}
      type={asChild ? undefined : type ?? "button"}
      {...props}
      aria-busy={loading || props["aria-busy"] || undefined}
      onClickCapture={handleClickCapture}
    >
      {loading ? <span className="chrome-button__spinner" aria-hidden="true" /> : null}
      {leadingIcon ? <span className="chrome-button__icon" aria-hidden="true">{leadingIcon}</span> : null}
      {asChild ? <Slottable>{children}</Slottable> : children}
      {trailingIcon ? <span className="chrome-button__icon" aria-hidden="true">{trailingIcon}</span> : null}
    </Comp>
  );
});

export interface IconButtonProps extends ButtonProps {
  "aria-label": string;
}

export const IconButton = React.forwardRef<ButtonElement, IconButtonProps>(function IconButton(
  { className, ...props },
  ref
) {
  return <Button ref={ref} className={cx("chrome-icon-button", className)} {...props} />;
});

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "ink" = card, "edge" = top-lit card (once per screen), "chrome" = floating chrome-rimmed panel. */
  finish?: "ink" | "edge" | "chrome";
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { finish = "ink", className, ...props },
  ref
) {
  return <div ref={ref} className={cx("chrome-surface", className)} data-finish={finish} {...props} />;
});

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  /** 24, 32 or 40 px. */
  size?: "sm" | "md" | "lg";
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = "md", className, ...props },
  ref
) {
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <span ref={ref} className={cx("chrome-avatar", className)} data-size={size} {...props}>
      {src ? <img src={src} alt={name} /> : <span aria-hidden="true">{initials}</span>}
      {!src ? <span className="chrome-avatar__name">{name}</span> : null}
    </span>
  );
});

/** Text affixes ("orbital-ops/", "ms") render as a recessed segment; icons sit inline. */
function affixKind(node: React.ReactNode) {
  return typeof node === "string" || typeof node === "number" ? "text" : "icon";
}

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: React.ReactNode;
  error?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id: providedId, label, hint, error, leading, trailing, className, ...props },
  ref
) {
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const descriptionId = hint || error ? `${id}-description` : undefined;
  return (
    <div className={cx("chrome-field", className)}>
      {label ? <label className="chrome-field__label" htmlFor={id}>{label}</label> : null}
      <span className="chrome-field__control" data-invalid={error ? "true" : undefined}>
        {leading ? <span className="chrome-field__affix" data-kind={affixKind(leading)}>{leading}</span> : null}
        <input ref={ref} id={id} aria-describedby={descriptionId} aria-invalid={Boolean(error)} {...props} />
        {trailing ? <span className="chrome-field__affix" data-kind={affixKind(trailing)}>{trailing}</span> : null}
      </span>
      {error ? <span id={descriptionId} className="chrome-field__message" data-error>{error}</span> : null}
      {!error && hint ? <span id={descriptionId} className="chrome-field__message">{hint}</span> : null}
    </div>
  );
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** "new" (cobalt) and "bad" (enamel) are the design names; "accent" and "danger" are their 0.1 aliases. */
  tone?: "neutral" | "new" | "bad" | "success" | "warning" | "accent" | "danger";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", className, ...props },
  ref
) {
  return <span ref={ref} className={cx("chrome-badge", className)} data-tone={tone} {...props} />;
});

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  /** A short cobalt run sweeping the groove, for work with no known end. */
  indeterminate?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value = 0, max = 100, indeterminate = false, className, ...props },
  ref
) {
  const bounded = Math.max(0, Math.min(value, max));
  const percentage = max > 0 ? (bounded / max) * 100 : 0;
  return (
    <div
      ref={ref}
      className={cx("chrome-progress", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : bounded}
      data-indeterminate={indeterminate || undefined}
      {...props}
    >
      <span style={indeterminate ? undefined : { width: `${percentage}%` }} />
    </div>
  );
});

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, children, ...props }, ref) {
  return (
    <label className="chrome-choice-label">
      {/* the check and the mixed dash are drawn by CSS from data-state */}
      <CheckboxPrimitive.Root ref={ref} className={cx("chrome-checkbox", className)} {...props} />
      {children ? <span>{children}</span> : null}
    </label>
  );
});

const RadioRoot = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(function RadioRoot({ className, ...props }, ref) {
  return <RadioGroupPrimitive.Root ref={ref} className={cx("chrome-radio-group", className)} {...props} />;
});

const RadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function RadioItem({ className, children, ...props }, ref) {
  return (
    <label className="chrome-choice-label">
      <RadioGroupPrimitive.Item ref={ref} className={cx("chrome-radio", className)} {...props}>
        <RadioGroupPrimitive.Indicator className="chrome-radio__indicator" />
      </RadioGroupPrimitive.Item>
      {children ? <span>{children}</span> : null}
    </label>
  );
});

export const RadioGroup = { Root: RadioRoot, Item: RadioItem };

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root ref={ref} className={cx("chrome-switch", className)} {...props}>
      <SwitchPrimitive.Thumb className="chrome-switch__thumb" />
    </SwitchPrimitive.Root>
  );
});

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  thumbLabels?: string[];
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(function Slider({ className, thumbLabels, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, ...props }, ref) {
  const values = props.value ?? props.defaultValue ?? [0];
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cx("chrome-slider", className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      <SliderPrimitive.Track className="chrome-slider__track">
        <SliderPrimitive.Range className="chrome-slider__range" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          className="chrome-slider__thumb"
          key={index}
          aria-label={thumbLabels?.[index] ?? (values.length > 1 && ariaLabel ? `${ariaLabel} ${index + 1}` : ariaLabel)}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        />
      ))}
    </SliderPrimitive.Root>
  );
});

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return <TabsPrimitive.List ref={ref} className={cx("chrome-tabs__list", className)} {...props} />;
});

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return <TabsPrimitive.Trigger ref={ref} className={cx("chrome-tabs__trigger", className)} {...props} />;
});

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return <TabsPrimitive.Content ref={ref} className={cx("chrome-tabs__content", className)} {...props} />;
});

export const Tabs = { Root: TabsPrimitive.Root, List: TabsList, Trigger: TabsTrigger, Content: TabsContent };
