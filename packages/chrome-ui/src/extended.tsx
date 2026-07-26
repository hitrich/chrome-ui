import * as React from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  CopyIcon,
  SearchIcon,
  UploadIcon
} from "./icons";
import { cx } from "./utils";

export type ChromeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: Exclude<ChromeTone, "neutral">;
  title: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = "accent", title, icon, action, children, className, role, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("chrome-alert", className)}
      data-tone={tone}
      role={role ?? (tone === "danger" ? "alert" : "status")}
      {...props}
    >
      <span className="chrome-alert__signal" aria-hidden="true">{icon}</span>
      <div className="chrome-alert__content">
        <strong className="chrome-alert__title">{title}</strong>
        {children ? <div className="chrome-alert__description">{children}</div> : null}
      </div>
      {action ? <div className="chrome-alert__action">{action}</div> : null}
    </div>
  );
});

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  items: readonly BreadcrumbItem[];
  separator?: React.ReactNode;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, separator = <ChevronRightIcon />, className, "aria-label": ariaLabel = "Breadcrumb", ...props },
  ref
) {
  return (
    <nav ref={ref} className={cx("chrome-breadcrumb", className)} aria-label={ariaLabel} {...props}>
      <ol>
        {items.map((item, index) => {
          const current = item.current ?? (!item.href && index === items.length - 1);
          return (
            <li key={`${item.href ?? "current"}-${index}`}>
              {item.href && !current ? <a href={item.href}>{item.label}</a> : <span aria-current={current ? "page" : undefined}>{item.label}</span>}
              {index < items.length - 1 ? <span className="chrome-breadcrumb__separator" aria-hidden="true">{separator}</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "onCopy"> {
  code: string;
  filename?: string;
  language?: string;
  copyable?: boolean;
  copyLabel?: string;
  onCopy?: (code: string) => void | Promise<void>;
}

export const CodeBlock = React.forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock(
  { code, filename, language, copyable = true, copyLabel = "Copy code", onCopy, className, ...props },
  ref
) {
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">("idle");
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const handleCopy = async () => {
    try {
      if (onCopy) await onCopy(code);
      else {
        if (typeof navigator === "undefined" || !navigator.clipboard) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(code);
      }
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 1800);
  };

  const buttonLabel = copyState === "copied" ? "Code copied" : copyState === "error" ? "Copy failed" : copyLabel;

  return (
    <figure ref={ref} className={cx("chrome-code-block", className)} data-copy-state={copyState} {...props}>
      {filename || language || copyable ? (
        <figcaption className="chrome-code-block__header">
          <span>{filename ?? "Snippet"}</span>
          {language ? <small>{language}</small> : null}
          {copyable ? (
            <button type="button" aria-label={buttonLabel} title={buttonLabel} onClick={handleCopy}>
              {copyState === "copied" ? <CheckIcon /> : <CopyIcon />}
            </button>
          ) : null}
        </figcaption>
      ) : null}
      <pre><code>{code}</code></pre>
    </figure>
  );
});

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: React.ReactNode;
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = "horizontal", label, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("chrome-divider", className)}
      data-orientation={orientation}
      role="separator"
      aria-orientation={orientation}
      {...props}
    >
      {label ? <span>{label}</span> : null}
    </div>
  );
});

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}

export const EmptyState = React.forwardRef<HTMLElement, EmptyStateProps>(function EmptyState(
  { title, description, icon, action, compact = false, className, children, ...props },
  ref
) {
  return (
    <section ref={ref} className={cx("chrome-empty-state", className)} data-compact={compact || undefined} {...props}>
      {icon ? <div className="chrome-empty-state__icon" aria-hidden="true">{icon}</div> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {children}
      {action ? <div className="chrome-empty-state__action">{action}</div> : null}
    </section>
  );
});

export interface FileDropzoneProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, "title" | "onChange"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  browseLabel?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  name?: string;
  inputId?: string;
  onFiles?: (files: File[]) => void;
}

export const FileDropzone = React.forwardRef<HTMLInputElement, FileDropzoneProps>(function FileDropzone(
  {
    label = "Drop files to upload",
    description = "or choose files from your device",
    browseLabel = "Browse files",
    accept,
    multiple,
    disabled,
    name,
    inputId: providedId,
    onFiles,
    className,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onKeyDown,
    ...props
  },
  forwardedRef
) {
  const generatedId = React.useId();
  const inputId = providedId ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const setInputRef = React.useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  const emitFiles = (files: FileList | null) => {
    if (!disabled && files?.length) onFiles?.(Array.from(files));
  };

  return (
    <label
      className={cx("chrome-dropzone", className)}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      htmlFor={inputId}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-describedby={descriptionId}
      onDragEnter={(event) => {
        if (!disabled) {
          event.preventDefault();
          setDragging(true);
        }
        onDragEnter?.(event);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        onDragLeave?.(event);
      }}
      onDragOver={(event) => {
        if (!disabled) event.preventDefault();
        onDragOver?.(event);
      }}
      onDrop={(event) => {
        if (!disabled) {
          event.preventDefault();
          setDragging(false);
          emitFiles(event.dataTransfer.files);
        }
        onDrop?.(event);
      }}
      onKeyDown={(event) => {
        if (!disabled && event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
        onKeyDown?.(event);
      }}
      {...props}
    >
      <input
        ref={setInputRef}
        id={inputId}
        className="chrome-dropzone__input"
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        onChange={(event) => emitFiles(event.currentTarget.files)}
      />
      <span className="chrome-dropzone__icon" aria-hidden="true"><UploadIcon /></span>
      <strong>{label}</strong>
      <span id={descriptionId}>{description}</span>
      <span className="chrome-dropzone__browse" aria-hidden="true">{browseLabel}</span>
    </label>
  );
});

export interface KeyHintProps extends React.HTMLAttributes<HTMLSpanElement> {
  keys?: readonly string[];
}

export const KeyHint = React.forwardRef<HTMLSpanElement, KeyHintProps>(function KeyHint(
  { keys, children, className, ...props },
  ref
) {
  const values = keys?.length ? keys : children != null ? [String(children)] : [];
  return (
    <span ref={ref} className={cx("chrome-key-hint", className)} {...props}>
      {values.map((key, index) => (
        <React.Fragment key={`${key}-${index}`}>
          {index > 0 ? <span aria-hidden="true">+</span> : null}
          <kbd>{key}</kbd>
        </React.Fragment>
      ))}
    </span>
  );
});

export interface MeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  min?: number;
  max?: number;
  label?: React.ReactNode;
  tone?: ChromeTone;
  showValue?: boolean;
  formatValue?: (value: number) => React.ReactNode;
}

export const Meter = React.forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value,
    min = 0,
    max = 100,
    label,
    tone = "accent",
    showValue = true,
    formatValue = (nextValue) => `${Math.round(nextValue)}%`,
    className,
    "aria-label": ariaLabel,
    ...props
  },
  ref
) {
  const bounded = Math.max(min, Math.min(value, max));
  const percentage = max > min ? ((bounded - min) / (max - min)) * 100 : 0;
  return (
    <div
      ref={ref}
      className={cx("chrome-meter", className)}
      data-tone={tone}
      role="meter"
      aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={bounded}
      {...props}
    >
      {label || showValue ? (
        <span className="chrome-meter__meta">
          <span>{label}</span>
          {showValue ? <output>{formatValue(bounded)}</output> : null}
        </span>
      ) : null}
      <span className="chrome-meter__track"><span style={{ width: `${percentage}%` }} /></span>
    </div>
  );
});

type PaginationToken = number | "ellipsis-start" | "ellipsis-end";

function paginationTokens(page: number, count: number): PaginationToken[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const visible = new Set([1, count, page - 1, page, page + 1].filter((value) => value >= 1 && value <= count));
  const pages = Array.from(visible).sort((a, b) => a - b);
  const tokens: PaginationToken[] = [];
  pages.forEach((value, index) => {
    const previous = pages[index - 1];
    if (previous && value - previous > 1) tokens.push(previous === 1 ? "ellipsis-start" : "ellipsis-end");
    tokens.push(value);
  });
  return tokens;
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  page: number;
  count: number;
  onPageChange?: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    count,
    onPageChange,
    previousLabel = "Previous page",
    nextLabel = "Next page",
    className,
    "aria-label": ariaLabel = "Pagination",
    ...props
  },
  ref
) {
  const pageCount = Math.max(1, Math.floor(count));
  const currentPage = Math.max(1, Math.min(Math.floor(page), pageCount));
  const tokens = paginationTokens(currentPage, pageCount);
  return (
    <nav ref={ref} className={cx("chrome-pagination", className)} aria-label={ariaLabel} {...props}>
      <button type="button" aria-label={previousLabel} disabled={currentPage === 1} onClick={() => onPageChange?.(currentPage - 1)}>
        <ArrowLeftIcon />
      </button>
      <ol>
        {tokens.map((token) => typeof token === "number" ? (
          <li key={token}>
            <button
              type="button"
              aria-label={`Page ${token}`}
              aria-current={token === currentPage ? "page" : undefined}
              onClick={() => onPageChange?.(token)}
            >
              {token}
            </button>
          </li>
        ) : <li className="chrome-pagination__ellipsis" key={token} aria-hidden="true">···</li>)}
      </ol>
      <button type="button" aria-label={nextLabel} disabled={currentPage === pageCount} onClick={() => onPageChange?.(currentPage + 1)}>
        <ArrowRightIcon />
      </button>
    </nav>
  );
});

export interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "defaultValue" | "onChange"> {
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  clearLabel?: string;
  shortcut?: React.ReactNode;
}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    id: providedId,
    label,
    value,
    defaultValue = "",
    onValueChange,
    onClear,
    clearLabel = "Clear search",
    shortcut,
    className,
    disabled,
    "aria-label": ariaLabel,
    ...props
  },
  forwardedRef
) {
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setInputRef = React.useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);
  const updateValue = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <div className={cx("chrome-search-field", className)} data-disabled={disabled || undefined}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <div className="chrome-search-field__control">
        <SearchIcon />
        <input
          ref={setInputRef}
          id={id}
          type="search"
          value={currentValue}
          disabled={disabled}
          aria-label={ariaLabel ?? (!label ? "Search" : undefined)}
          onChange={(event) => updateValue(event.currentTarget.value)}
          {...props}
        />
        {currentValue && !disabled ? (
          <button
            type="button"
            className="chrome-search-field__clear"
            aria-label={clearLabel}
            onClick={() => {
              updateValue("");
              onClear?.();
              inputRef.current?.focus();
            }}
          >
            <CloseIcon />
          </button>
        ) : shortcut ? <span className="chrome-search-field__shortcut">{shortcut}</span> : null}
      </div>
    </div>
  );
});

export interface SegmentedControlItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  items: readonly SegmentedControlItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  {
    items,
    value,
    defaultValue,
    onValueChange,
    disabled,
    size = "md",
    className,
    "aria-label": ariaLabel = "View",
    ...props
  },
  ref
) {
  const firstValue = items.find((item) => !item.disabled)?.value ?? "";
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? firstValue);
  const currentValue = value ?? internalValue;
  return (
    <div
      ref={ref}
      className={cx("chrome-segmented", className)}
      data-size={size}
      role="group"
      aria-label={ariaLabel}
      {...props}
    >
      {items.map((item) => (
        <button
          type="button"
          key={item.value}
          aria-pressed={currentValue === item.value}
          disabled={disabled || item.disabled}
          onClick={() => {
            if (value === undefined) setInternalValue(item.value);
            onValueChange?.(item.value);
          }}
        >
          {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
          {item.label}
        </button>
      ))}
    </div>
  );
});

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "block" | "circle";
  width?: React.CSSProperties["width"];
  height?: React.CSSProperties["height"];
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = "block", width, height, className, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("chrome-skeleton", className)}
      data-variant={variant}
      aria-hidden="true"
      style={{ ...style, width, height }}
      {...props}
    />
  );
});

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "Loading", className, "aria-label": ariaLabel, ...props },
  ref
) {
  return (
    <span ref={ref} className={cx("chrome-spinner", className)} data-size={size} role="status" aria-label={ariaLabel ?? label} {...props}>
      <span aria-hidden="true" />
      <span className="chrome-visually-hidden">{label}</span>
    </span>
  );
});

export interface StatProps extends React.HTMLAttributes<HTMLElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  delta?: React.ReactNode;
  trend?: "up" | "down" | "flat";
  sentiment?: "neutral" | "positive" | "negative";
  description?: React.ReactNode;
}

export const Stat = React.forwardRef<HTMLElement, StatProps>(function Stat(
  { label, value, delta, trend = "flat", sentiment = "neutral", description, className, ...props },
  ref
) {
  return (
    <article ref={ref} className={cx("chrome-stat", className)} data-trend={trend} data-sentiment={sentiment} {...props}>
      <span className="chrome-stat__label">{label}</span>
      <strong className="chrome-stat__value">{value}</strong>
      {delta ? <span className="chrome-stat__delta">{trend === "up" ? "↗" : trend === "down" ? "↘" : "—"} {delta}</span> : null}
      {description ? <span className="chrome-stat__description">{description}</span> : null}
    </article>
  );
});

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: ChromeTone;
  label: React.ReactNode;
  pulse?: boolean;
}

export const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(function StatusIndicator(
  { tone = "neutral", label, pulse = false, className, role = "status", ...props },
  ref
) {
  return (
    <span ref={ref} className={cx("chrome-status", className)} data-tone={tone} data-pulse={pulse || undefined} role={role} {...props}>
      <i aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
});

export interface StepperItem {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "onChange"> {
  steps: readonly StepperItem[];
  activeStep?: number;
  orientation?: "horizontal" | "vertical";
  onStepChange?: (index: number) => void;
}

export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, activeStep = 0, orientation = "horizontal", onStepChange, className, ...props },
  ref
) {
  const current = Math.max(0, Math.min(activeStep, Math.max(steps.length - 1, 0)));
  return (
    <ol ref={ref} className={cx("chrome-stepper", className)} data-orientation={orientation} {...props}>
      {steps.map((step, index) => {
        const state = index < current ? "complete" : index === current ? "current" : "upcoming";
        const content = (
          <>
            <span className="chrome-stepper__index" aria-hidden="true">{state === "complete" ? <CheckIcon /> : String(index + 1).padStart(2, "0")}</span>
            <span className="chrome-stepper__copy">
              <strong>{step.label}</strong>
              {step.description ? <small>{step.description}</small> : null}
            </span>
          </>
        );
        return (
          <li key={step.id} data-state={state}>
            {onStepChange ? (
              <button type="button" disabled={step.disabled} aria-current={state === "current" ? "step" : undefined} onClick={() => onStepChange(index)}>
                {content}
              </button>
            ) : (
              <div aria-current={state === "current" ? "step" : undefined}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
});

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  density?: "compact" | "comfortable";
  stickyHeader?: boolean;
  containerClassName?: string;
  scrollLabel?: string;
  scrollHint?: string;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    density = "comfortable",
    stickyHeader = false,
    containerClassName,
    scrollLabel,
    scrollHint = "Scroll horizontally",
    className,
    children,
    "aria-label": ariaLabel,
    ...props
  },
  ref
) {
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = React.useState({ overflowing: false, atEnd: true });
  const updateScrollState = React.useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const overflowing = shell.scrollWidth - shell.clientWidth > 1;
    const atEnd = !overflowing || shell.scrollLeft + shell.clientWidth >= shell.scrollWidth - 1;
    setScrollState((current) => current.overflowing === overflowing && current.atEnd === atEnd ? current : { overflowing, atEnd });
  }, []);

  React.useEffect(() => {
    updateScrollState();
    const shell = shellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(shell);
    const table = shell.querySelector("table");
    if (table) observer.observe(table);
    return () => observer.disconnect();
  }, [children, updateScrollState]);

  const regionLabel = scrollLabel ?? (ariaLabel ? `${ariaLabel} horizontal scroll area` : "Scrollable table");

  return (
    <div
      className="chrome-table-frame"
      data-scrollable={scrollState.overflowing || undefined}
      data-at-end={scrollState.atEnd || undefined}
    >
      <div
        ref={shellRef}
        className={cx("chrome-table-shell", containerClassName)}
        data-sticky-header={stickyHeader || undefined}
        role={scrollState.overflowing ? "region" : undefined}
        aria-label={scrollState.overflowing ? regionLabel : undefined}
        tabIndex={scrollState.overflowing ? 0 : undefined}
        onScroll={updateScrollState}
      >
        <table ref={ref} className={cx("chrome-table", className)} data-density={density} aria-label={ariaLabel} {...props}>{children}</table>
      </div>
      <span className="chrome-table__scroll-hint" aria-hidden="true">
        {scrollHint} <ArrowRightIcon />
      </span>
    </div>
  );
});

export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  tone?: ChromeTone;
}

export interface TimelineProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "children"> {
  items: readonly TimelineItem[];
}

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { items, className, ...props },
  ref
) {
  return (
    <ol ref={ref} className={cx("chrome-timeline", className)} {...props}>
      {items.map((item) => (
        <li key={item.id} data-tone={item.tone ?? "neutral"}>
          <span className="chrome-timeline__marker" aria-hidden="true" />
          <div>
            <strong>{item.title}</strong>
            {item.description ? <p>{item.description}</p> : null}
          </div>
          {item.meta ? <time>{item.meta}</time> : null}
        </li>
      ))}
    </ol>
  );
});

export interface ToggleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: "sm" | "md";
}

export const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
  {
    pressed,
    defaultPressed = false,
    onPressedChange,
    size = "md",
    className,
    disabled,
    children,
    type,
    onClick,
    ...props
  },
  ref
) {
  const [internalPressed, setInternalPressed] = React.useState(defaultPressed);
  const currentPressed = pressed ?? internalPressed;
  return (
    <button
      ref={ref}
      className={cx("chrome-toggle-button", className)}
      data-size={size}
      type={type ?? "button"}
      aria-pressed={currentPressed}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        const nextPressed = !currentPressed;
        if (pressed === undefined) setInternalPressed(nextPressed);
        onPressedChange?.(nextPressed);
      }}
      {...props}
    >
      {children}
    </button>
  );
});

export interface ToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "aria-label"> {
  label: string;
  orientation?: "horizontal" | "vertical";
}

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { label, orientation = "horizontal", className, onKeyDown, onFocusCapture, children, ...props },
  forwardedRef
) {
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const setToolbarRef = React.useCallback((node: HTMLDivElement | null) => {
    toolbarRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  const getControls = React.useCallback(() => Array.from(toolbarRef.current?.querySelectorAll<HTMLElement>(
    'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [role="button"]:not([aria-disabled="true"])'
  ) ?? []), []);

  const setActiveControl = React.useCallback((activeControl: HTMLElement) => {
    getControls().forEach((control) => {
      control.tabIndex = control === activeControl ? 0 : -1;
    });
  }, [getControls]);

  React.useEffect(() => {
    const syncControls = () => {
      const controls = getControls();
      if (!controls.length) return;
      const focused = controls.find((control) => control === document.activeElement);
      const current = focused ?? controls.find((control) => control.tabIndex === 0) ?? controls[0];
      if (current) setActiveControl(current);
    };
    syncControls();
    const toolbar = toolbarRef.current;
    if (!toolbar || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(syncControls);
    observer.observe(toolbar, { subtree: true, childList: true, attributes: true, attributeFilter: ["disabled", "aria-disabled"] });
    return () => observer.disconnect();
  }, [children, getControls, setActiveControl]);

  return (
    <div
      ref={setToolbarRef}
      className={cx("chrome-toolbar", className)}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      data-orientation={orientation}
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        const target = event.target as HTMLElement;
        if (getControls().includes(target)) setActiveControl(target);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const previousKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
        const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
        if (![previousKey, nextKey, "Home", "End"].includes(event.key)) return;
        const controls = getControls();
        const activeIndex = controls.indexOf(document.activeElement as HTMLElement);
        if (!controls.length || activeIndex < 0) return;
        event.preventDefault();
        const nextIndex = event.key === "Home"
          ? 0
          : event.key === "End"
            ? controls.length - 1
            : (activeIndex + (event.key === nextKey ? 1 : -1) + controls.length) % controls.length;
        const nextControl = controls[nextIndex];
        if (nextControl) {
          setActiveControl(nextControl);
          nextControl.focus();
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
});
