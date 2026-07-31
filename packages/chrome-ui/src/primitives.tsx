import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Slot } from "@radix-ui/react-slot";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { CheckIcon } from "./icons";
import { cx } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonElement = HTMLElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  static?: boolean;
}

function setButtonLightPosition(element: HTMLElement, bounds: DOMRect, clientX: number, clientY: number) {
  if (bounds.width <= 0 || bounds.height <= 0) return;

  const x = Math.max(0, Math.min(100, ((clientX - bounds.left) / bounds.width) * 100));
  const y = Math.max(0, Math.min(100, ((clientY - bounds.top) / bounds.height) * 100));
  element.style.setProperty("--chrome-light-x", `${x.toFixed(2)}%`);
  element.style.setProperty("--chrome-light-y", `${y.toFixed(2)}%`);
}

export const Button = React.forwardRef<ButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    asChild = false,
    static: isStatic = false,
    className,
    type,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    ...props
  },
  ref
) {
  const sharedClassName = cx("chrome-button", className);
  const lightBoundsRef = React.useRef<{ element: HTMLElement; bounds: DOMRect } | null>(null);
  const handlePointerEnter = React.useCallback<React.PointerEventHandler<HTMLElement>>((event) => {
    const isDisabled = event.currentTarget.matches(":disabled, [aria-disabled=\"true\"]");
    if (event.pointerType !== "touch" && !isDisabled) {
      lightBoundsRef.current = { element: event.currentTarget, bounds: event.currentTarget.getBoundingClientRect() };
    }
    onPointerEnter?.(event as React.PointerEvent<HTMLButtonElement>);
  }, [onPointerEnter]);
  const handlePointerMove = React.useCallback<React.PointerEventHandler<HTMLElement>>((event) => {
    const isDisabled = event.currentTarget.matches(":disabled, [aria-disabled=\"true\"]");
    if (event.pointerType !== "touch" && !isDisabled) {
      const cached = lightBoundsRef.current;
      const bounds = cached?.element === event.currentTarget ? cached.bounds : event.currentTarget.getBoundingClientRect();
      lightBoundsRef.current = { element: event.currentTarget, bounds };
      setButtonLightPosition(event.currentTarget, bounds, event.clientX, event.clientY);
    }
    onPointerMove?.(event as React.PointerEvent<HTMLButtonElement>);
  }, [onPointerMove]);
  const handlePointerLeave = React.useCallback<React.PointerEventHandler<HTMLElement>>((event) => {
    lightBoundsRef.current = null;
    event.currentTarget.style.removeProperty("--chrome-light-x");
    event.currentTarget.style.removeProperty("--chrome-light-y");
    onPointerLeave?.(event as React.PointerEvent<HTMLButtonElement>);
  }, [onPointerLeave]);

  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={sharedClassName}
        data-static={isStatic || undefined}
        data-variant={variant}
        data-size={size}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...props}
      />
    );
  }
  return (
    <button
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
      className={sharedClassName}
      data-static={isStatic || undefined}
      data-variant={variant}
      data-size={size}
      type={type ?? "button"}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    />
  );
});

export interface IconButtonProps extends ButtonProps {
  "aria-label": string;
}

export const IconButton = React.forwardRef<ButtonElement, IconButtonProps>(function IconButton(
  { className, size = "md", ...props },
  ref
) {
  return <Button ref={ref} className={cx("chrome-icon-button", className)} size={size} {...props} />;
});

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
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

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
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
        {leading ? <span className="chrome-field__affix">{leading}</span> : null}
        <input ref={ref} id={id} aria-describedby={descriptionId} aria-invalid={Boolean(error)} {...props} />
        {trailing ? <span className="chrome-field__affix">{trailing}</span> : null}
      </span>
      {error ? <span id={descriptionId} className="chrome-field__message" data-error>{error}</span> : null}
      {!error && hint ? <span id={descriptionId} className="chrome-field__message">{hint}</span> : null}
    </div>
  );
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "accent" | "danger" | "success";
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
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value = 0, max = 100, className, ...props },
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
      aria-valuenow={bounded}
      {...props}
    >
      <span style={{ width: `${percentage}%` }} />
    </div>
  );
});

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, children, ...props }, ref) {
  return (
    <label className="chrome-choice-label">
      <CheckboxPrimitive.Root ref={ref} className={cx("chrome-checkbox", className)} {...props}>
        <CheckboxPrimitive.Indicator><CheckIcon /></CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
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
