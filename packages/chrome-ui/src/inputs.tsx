import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChromePortalLayer } from "./provider";
import { cx } from "./utils";

/* ---------- shared helpers ---------- */

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [inner, setInner] = React.useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange]
  );
  return [current, set] as const;
}

function useFieldId(provided?: string) {
  const generated = React.useId();
  return provided ?? `chrome${generated.replace(/:/g, "")}`;
}

function setRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const PATHS = {
  check: "m5 12 5 5 9-10",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  prev: "m15 6-6 6 6 6",
  next: "m9 6 6 6-6 6",
  calendar: "M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
} as const;

function Glyph({ name, className }: { name: keyof typeof PATHS; className?: string }) {
  return (
    <svg className={cx("chrome-in-icon", className)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

interface FieldShellProps {
  className?: string;
  style?: React.CSSProperties;
  label?: React.ReactNode;
  labelId?: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  messageId?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}

function FieldShell({ className, style, label, labelId, htmlFor, hint, error, messageId, aside, children }: FieldShellProps) {
  const message = error ?? hint;
  return (
    <div className={cx("chrome-in-field", className)} style={style}>
      {label ? (
        htmlFor ? (
          <label className="chrome-in-label" id={labelId} htmlFor={htmlFor}>{label}</label>
        ) : (
          <span className="chrome-in-label" id={labelId}>{label}</span>
        )
      ) : null}
      {children}
      {message || aside ? (
        <div className="chrome-in-messages">
          {message ? <span className="chrome-in-hint" id={messageId} data-error={error ? "" : undefined}>{message}</span> : <span />}
          {aside}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- ButtonGroup ---------- */

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "attached": one chrome rim around joined segments (graphite or ghost buttons). "split": each part keeps its finish and they share one seam. */
  variant?: "attached" | "split";
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { variant = "attached", className, role = "group", ...props },
  ref
) {
  return <div ref={ref} role={role} className={cx("chrome-button-group", className)} data-variant={variant} {...props} />;
});

/* ---------- Chip ---------- */

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Makes the chip a toggle (aria-pressed). Selected chips show a check and the cobalt chrome finish. */
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Makes the chip an entity with its own remove button. */
  onRemove?: () => void;
  removeLabel?: string;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  /** "dashed" is the quiet add-a-filter chip. */
  variant?: "default" | "dashed";
  size?: "sm" | "md";
}

export const Chip = React.forwardRef<HTMLElement, ChipProps>(function Chip(
  {
    selected,
    defaultSelected,
    onSelectedChange,
    onRemove,
    removeLabel,
    icon,
    avatar,
    variant = "default",
    size = "md",
    className,
    children,
    disabled,
    onClick,
    type,
    ...props
  },
  ref
) {
  const toggles = selected !== undefined || defaultSelected !== undefined || onSelectedChange !== undefined;
  const [isSelected, setSelected] = useControllable(selected, defaultSelected ?? false, onSelectedChange);
  const shared = {
    className: cx("chrome-chip", className),
    "data-variant": variant,
    "data-size": size,
    "data-selected": toggles && isSelected ? "" : undefined,
    "data-avatar": avatar ? "" : undefined,
    "data-removable": onRemove ? "" : undefined
  };
  const lead = toggles && isSelected ? <Glyph name="check" /> : icon;
  const content = (
    <>
      {avatar ? <span className="chrome-chip__avatar" aria-hidden="true">{avatar}</span> : null}
      {lead ? <span className="chrome-chip__icon" aria-hidden="true">{lead}</span> : null}
      <span className="chrome-chip__label">{children}</span>
    </>
  );
  if (onRemove) {
    const label = removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove");
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} {...shared} {...(props as React.HTMLAttributes<HTMLSpanElement>)} data-disabled={disabled ? "" : undefined}>
        {content}
        <button type="button" className="chrome-chip__remove" aria-label={label} disabled={disabled} onClick={onRemove}>
          <Glyph name="close" />
        </button>
      </span>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type ?? "button"}
      {...shared}
      aria-pressed={toggles ? isSelected : undefined}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && toggles) setSelected(!isSelected);
      }}
      {...props}
    >
      {content}
    </button>
  );
});

/* ---------- Textarea ---------- */

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Live "71 / 280" counter. Defaults to on when maxLength is set. */
  showCount?: boolean;
  resize?: "vertical" | "none";
  /** "lg" is the roomy composer (14 px text, 22 px lines). */
  size?: "md" | "lg";
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    id: providedId,
    label,
    hint,
    error,
    value,
    defaultValue = "",
    onValueChange,
    onChange,
    showCount,
    maxLength,
    resize = "vertical",
    size = "md",
    rows = 3,
    className,
    style,
    disabled,
    "aria-describedby": describedBy,
    ...props
  },
  ref
) {
  const id = useFieldId(providedId);
  const [text, setText] = useControllable(value, defaultValue, onValueChange);
  const counted = showCount ?? maxLength !== undefined;
  const messageId = hint || error ? `${id}-message` : undefined;
  const countId = counted ? `${id}-count` : undefined;
  return (
    <FieldShell
      className={className}
      style={style}
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      messageId={messageId}
      aside={counted ? (
        <span className="chrome-in-hint chrome-in-count" id={countId} data-full={maxLength !== undefined && text.length >= maxLength ? "" : undefined}>
          {maxLength !== undefined ? `${text.length} / ${maxLength}` : text.length}
        </span>
      ) : null}
    >
      <div className="chrome-textarea chrome-in-well" data-size={size} data-resize={resize} data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          value={text}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(describedBy, messageId, countId) || undefined}
          onChange={(event) => {
            onChange?.(event);
            setText(event.currentTarget.value);
          }}
          {...props}
        />
        {resize === "vertical" ? (
          <svg className="chrome-textarea__grip" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
            <path d="M9 3 3 9M9 6.5 6.5 9" />
            <path d="M9.6 3.6 3.6 9.6M9.6 7.1 7.1 9.6" />
          </svg>
        ) : null}
      </div>
    </FieldShell>
  );
});

/* ---------- NumberField ---------- */

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type" | "size" | "min" | "max" | "step"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** PageUp / PageDown step. Default 10 × step. */
  largeStep?: number;
  /** Unit shown after the number, e.g. "ms" or "%". */
  unit?: React.ReactNode;
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
  decrementLabel?: string;
  incrementLabel?: string;
}

const decimalsOf = (step: number) => (String(step).split(".")[1] ?? "").length;

function parseNumber(text: string): number | null | undefined {
  const cleaned = text.replace(/−/g, "-").replace(/[^\d.,+-]/g, "");
  if (cleaned === "") return null;
  const normalized = cleaned.includes(".") ? cleaned.replace(/,/g, "") : cleaned.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  {
    id: providedId,
    label,
    hint,
    error,
    value,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    largeStep,
    unit,
    formatOptions,
    locale,
    decrementLabel = "Decrease",
    incrementLabel = "Increase",
    className,
    style,
    disabled,
    readOnly,
    onBlur,
    onKeyDown,
    "aria-describedby": describedBy,
    ...props
  },
  ref
) {
  const id = useFieldId(providedId);
  const [number, setNumber] = useControllable(value, defaultValue, onValueChange);
  const [draft, setDraft] = React.useState<string | null>(null);
  const decimals = decimalsOf(step);
  const format = (n: number | null) =>
    n === null ? "" : new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: decimals, ...formatOptions }).format(n).replace("-", "−");
  const fit = (n: number) => {
    const base = min ?? 0;
    const snapped = Number((base + Math.round((n - base) / step) * step).toFixed(decimals));
    return clamp(snapped, min ?? -Infinity, max ?? Infinity);
  };
  const commit = (next: number | null) => {
    setDraft(null);
    const fitted = next === null ? null : fit(next);
    if (fitted !== number) setNumber(fitted);
  };
  const current = () => {
    if (draft === null) return number;
    const parsed = parseNumber(draft);
    return parsed === undefined ? number : parsed;
  };
  const nudge = (amount: number) => {
    if (disabled || readOnly) return;
    const from = current();
    commit(from === null ? clamp(0, min ?? -Infinity, max ?? Infinity) : from + amount);
  };
  const messageId = hint || error ? `${id}-message` : undefined;
  const text = draft ?? format(number);
  const atMin = min !== undefined && number !== null && number <= min;
  const atMax = max !== undefined && number !== null && number >= max;
  const unitText = typeof unit === "string" ? ` ${unit}` : "";
  return (
    <FieldShell className={className} style={style} label={label} htmlFor={id} hint={hint} error={error} messageId={messageId}>
      <div className="chrome-number-field chrome-in-well" data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined} data-unit={unit ? "" : undefined}>
        <button
          type="button"
          className="chrome-number-field__step"
          tabIndex={-1}
          aria-label={decrementLabel}
          aria-controls={id}
          disabled={disabled || readOnly || atMin}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => nudge(-step)}
        >
          <Glyph name="minus" />
        </button>
        <input
          ref={ref}
          id={id}
          type="text"
          role="spinbutton"
          inputMode={decimals ? "decimal" : "numeric"}
          autoComplete="off"
          value={text}
          disabled={disabled}
          readOnly={readOnly}
          aria-valuenow={number ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={number === null ? undefined : `${format(number)}${unitText}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(describedBy, messageId) || undefined}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={(event) => {
            if (draft !== null) {
              const parsed = parseNumber(draft);
              commit(parsed === undefined ? number : parsed);
            }
            onBlur?.(event);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            const big = largeStep ?? step * 10;
            const keys: Record<string, () => void> = {
              ArrowUp: () => nudge(step),
              ArrowDown: () => nudge(-step),
              PageUp: () => nudge(big),
              PageDown: () => nudge(-big),
              Home: () => { if (min !== undefined) commit(min); },
              End: () => { if (max !== undefined) commit(max); },
              Enter: () => { if (draft !== null) { const parsed = parseNumber(draft); commit(parsed === undefined ? number : parsed); } }
            };
            const action = keys[event.key];
            if (!action || ((event.key === "Home" && min === undefined) || (event.key === "End" && max === undefined))) return;
            if (event.key !== "Enter") event.preventDefault();
            action();
          }}
          {...props}
        />
        {unit ? <span className="chrome-number-field__unit" aria-hidden="true">{unit}</span> : null}
        <button
          type="button"
          className="chrome-number-field__step"
          tabIndex={-1}
          aria-label={incrementLabel}
          aria-controls={id}
          disabled={disabled || readOnly || atMax}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => nudge(step)}
        >
          <Glyph name="plus" />
        </button>
      </div>
    </FieldShell>
  );
});

/* ---------- InputOTP ---------- */

export interface InputOTPProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** A dash after every n cells. Default: half the length when it is even; 0 for none. */
  groupSize?: number;
  pattern?: "numeric" | "alphanumeric";
  disabled?: boolean;
  autoFocus?: boolean;
  /** Submits the code with forms through a hidden input. */
  name?: string;
  cellLabel?: (index: number, length: number) => string;
}

export const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(function InputOTP(
  {
    id: providedId,
    length = 6,
    value,
    defaultValue = "",
    onValueChange,
    onComplete,
    label,
    hint,
    error,
    groupSize,
    pattern = "numeric",
    disabled,
    autoFocus,
    name,
    cellLabel,
    className,
    style,
    ...props
  },
  ref
) {
  const id = useFieldId(providedId);
  const [code, setCode] = useControllable(value, defaultValue, onValueChange);
  const cells = React.useRef<(HTMLInputElement | null)[]>([]);
  const group = groupSize ?? (length % 2 === 0 ? length / 2 : 0);
  const sanitize = (text: string) =>
    (pattern === "numeric" ? text.replace(/\D/g, "") : text.replace(/[^a-z0-9]/gi, "").toUpperCase()).split("");
  const focusCell = (index: number) => {
    const cell = cells.current[clamp(index, 0, length - 1)];
    cell?.focus();
    cell?.select();
  };
  // focus moves after the new code renders, so the next cell's "first empty cell" check sees it
  const pendingFocus = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (pendingFocus.current === null) return;
    focusCell(pendingFocus.current);
    pendingFocus.current = null;
  });
  const update = (next: string, focusAt?: number) => {
    const bounded = next.slice(0, length);
    if (bounded === code) {
      if (focusAt !== undefined) focusCell(focusAt);
      return;
    }
    pendingFocus.current = focusAt ?? null;
    setCode(bounded);
    if (bounded.length === length) onComplete?.(bounded);
  };
  const fill = (start: number, chars: string[]) => {
    const next = code.split("");
    chars.forEach((char, offset) => {
      if (start + offset < length) next[start + offset] = char;
    });
    update(next.join(""), Math.min(start + chars.length, length - 1));
  };
  const labelId = label ? `${id}-label` : undefined;
  const messageId = hint || error ? `${id}-message` : undefined;
  return (
    <FieldShell className={cx("chrome-otp-field", className)} style={style} label={label} labelId={labelId} hint={hint} error={error} messageId={messageId}>
      <div
        ref={ref}
        role="group"
        className="chrome-otp"
        aria-labelledby={labelId}
        aria-describedby={messageId}
        data-invalid={error ? "" : undefined}
        {...props}
      >
        {Array.from({ length }, (_, index) => (
          <React.Fragment key={index}>
            <input
              ref={(node) => { cells.current[index] = node; }}
              className="chrome-otp__cell chrome-in-well"
              id={index === 0 ? id : undefined}
              value={code[index] ?? ""}
              inputMode={pattern === "numeric" ? "numeric" : "text"}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              autoCapitalize={pattern === "alphanumeric" ? "characters" : undefined}
              spellCheck={false}
              disabled={disabled}
              autoFocus={autoFocus && index === 0}
              aria-label={cellLabel ? cellLabel(index, length) : `${pattern === "numeric" ? "Digit" : "Character"} ${index + 1} of ${length}`}
              aria-invalid={error ? true : undefined}
              data-invalid={error ? "" : undefined}
              onFocus={(event) => {
                if (index > code.length) focusCell(code.length);
                else event.currentTarget.select();
              }}
              onChange={(event) => {
                // keyboards that send no Backspace key event (some Android IMEs) just empty the cell
                if (event.currentTarget.value === "") return update(code.slice(0, index) + code.slice(index + 1), index);
                const typed = sanitize(event.currentTarget.value);
                if (typed.length === 0) return;
                const pasted = typed.length > 2 || (typed.length === 2 && !code[index]);
                fill(index, pasted ? typed : typed.slice(-1));
              }}
              onPaste={(event) => {
                event.preventDefault();
                const chars = sanitize(event.clipboardData.getData("text"));
                if (chars.length) fill(chars.length >= length ? 0 : index, chars);
              }}
              onKeyDown={(event) => {
                const keys: Record<string, () => void> = {
                  Backspace: () => (code[index] ? update(code.slice(0, index) + code.slice(index + 1), index) : index > 0 && update(code.slice(0, index - 1) + code.slice(index), index - 1)),
                  Delete: () => update(code.slice(0, index) + code.slice(index + 1), index),
                  ArrowLeft: () => focusCell(index - 1),
                  ArrowRight: () => focusCell(Math.min(index + 1, code.length)),
                  Home: () => focusCell(0),
                  End: () => focusCell(Math.min(code.length, length - 1))
                };
                const action = keys[event.key];
                if (action) {
                  event.preventDefault();
                  action();
                } else if (event.key.length === 1 && event.key.toUpperCase() === code[index]) {
                  // retyping the same character fires no change event; still advance
                  event.preventDefault();
                  focusCell(index + 1);
                }
              }}
            />
            {group > 0 && (index + 1) % group === 0 && index < length - 1 ? <span className="chrome-otp__dash" aria-hidden="true" /> : null}
          </React.Fragment>
        ))}
        {name ? <input type="hidden" name={name} value={code} /> : null}
      </div>
    </FieldShell>
  );
});

/* ---------- TagInput ---------- */

export interface TagInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  /** Return false to refuse a tag. Duplicates and blanks are always refused. */
  validate?: (tag: string, tags: readonly string[]) => boolean;
  maxTags?: number;
  removeLabel?: (tag: string) => string;
  /** Monospaced tokens for identifiers such as regions. Default true. */
  mono?: boolean;
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  {
    id: providedId,
    label,
    hint,
    error,
    value,
    defaultValue = [],
    onValueChange,
    validate,
    maxTags,
    removeLabel = (tag) => `Remove ${tag}`,
    mono = true,
    className,
    style,
    disabled,
    placeholder,
    onKeyDown,
    "aria-describedby": describedBy,
    ...props
  },
  ref
) {
  const id = useFieldId(providedId);
  const [tags, setTags] = useControllable(value, defaultValue, onValueChange);
  const [draft, setDraft] = React.useState("");
  const [announcement, setAnnouncement] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const add = (parts: string[]) => {
    const next = [...tags];
    const refused: string[] = [];
    for (const raw of parts) {
      const tag = raw.trim();
      if (!tag || next.includes(tag)) continue;
      if ((maxTags !== undefined && next.length >= maxTags) || (validate && !validate(tag, next))) refused.push(tag);
      else next.push(tag);
    }
    const added = next.slice(tags.length);
    if (added.length) setTags(next);
    setAnnouncement([added.length ? `${added.join(", ")} added` : "", refused.length ? `${refused.join(", ")} not added` : ""].filter(Boolean).join(". "));
    return added.length > 0 || refused.length === 0;
  };
  const remove = (index: number) => {
    const tag = tags[index];
    setTags(tags.filter((_, i) => i !== index));
    setAnnouncement(`${tag} removed`);
  };
  const messageId = hint || error ? `${id}-message` : undefined;
  return (
    <FieldShell className={className} style={style} label={label} htmlFor={id} hint={hint} error={error} messageId={messageId}>
      <div
        className="chrome-tag-input chrome-in-well"
        data-mono={mono ? "" : undefined}
        data-invalid={error ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        {tags.map((tag, index) => (
          <span className="chrome-tag-input__tag" key={tag}>
            {tag}
            <button
              type="button"
              className="chrome-tag-input__remove"
              aria-label={removeLabel(tag)}
              disabled={disabled}
              onClick={() => {
                remove(index);
                inputRef.current?.focus();
              }}
            >
              <Glyph name="close" />
            </button>
          </span>
        ))}
        <input
          ref={setRefs(ref, inputRef)}
          id={id}
          value={draft}
          disabled={disabled}
          placeholder={tags.length ? undefined : placeholder}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(describedBy, messageId) || undefined}
          onChange={(event) => {
            const text = event.currentTarget.value;
            if (!text.includes(",")) return setDraft(text);
            const parts = text.split(",");
            const rest = parts.pop() ?? "";
            add(parts);
            setDraft(rest.trimStart());
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.nativeEvent.isComposing) return;
            if (event.key === "Enter" && draft.trim()) {
              event.preventDefault();
              if (add([draft])) setDraft("");
            } else if (event.key === "Backspace" && draft === "" && tags.length) {
              event.preventDefault();
              remove(tags.length - 1);
            }
          }}
          {...props}
        />
      </div>
      <span className="chrome-in-sr" role="status">{announcement}</span>
    </FieldShell>
  );
});

/* ---------- ColorPicker ---------- */

interface Hsva { h: number; s: number; v: number; a: number }

function parseHex(text: string): Hsva | null {
  const match = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text.trim());
  if (!match?.[1]) return null;
  let hex = match[1];
  if (hex.length <= 4) hex = hex.split("").map((c) => c + c).join("");
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16) / 255;
  const [r, g, b] = [n(0), n(2), n(4)];
  const a = hex.length === 8 ? n(6) : 1;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : d / max, v: max, a };
}

function toHex({ h, s, v, a }: Hsva, alpha: boolean) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const byte = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${byte(f(5))}${byte(f(3))}${byte(f(1))}${alpha && a < 1 ? byte(a) : ""}`.toUpperCase();
}

export interface ColorSwatch { value: string; label?: string }

export interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Hex color, #RRGGBB or #RRGGBBAA. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  swatches?: readonly (string | ColorSwatch)[];
  /** Adds an opacity slider and 8-digit hex output. */
  alpha?: boolean;
  disabled?: boolean;
}

const defaultSwatches = ["#1447E6", "#202222", "#5F6363", "#93B3AE", "#0F8A5F", "#B06F00", "#D42E1F"];

interface PadProps {
  className: string;
  label: string;
  x: number;
  y?: number;
  max: number;
  valueText: string;
  knob: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  onMove: (x: number, y: number) => void;
}

/** One pointer + keyboard surface for the 2D saturation/brightness area (x, y) and the 1D hue and alpha sliders (x only). */
function Pad({ className, label, x, y, max, valueText, knob, disabled, style, onMove }: PadProps) {
  const thumb = React.useRef<HTMLSpanElement>(null);
  const read = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    onMove(clamp((event.clientX - box.left) / (box.width || 1), 0, 1), clamp((event.clientY - box.top) / (box.height || 1), 0, 1));
  };
  return (
    <div
      className={className}
      style={style}
      data-disabled={disabled ? "" : undefined}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        thumb.current?.focus();
        read(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) read(event);
      }}
    >
      <span
        ref={thumb}
        className="chrome-color-picker__knob"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(x * max)}
        aria-valuetext={valueText}
        aria-disabled={disabled || undefined}
        style={{ left: `${x * 100}%`, top: y === undefined ? "50%" : `${y * 100}%`, "--chrome-knob-fill": knob } as React.CSSProperties}
        onKeyDown={(event) => {
          if (disabled) return;
          const unit = (event.shiftKey ? 10 : 1) / max;
          const moves: Record<string, [number, number]> = {
            ArrowRight: [unit, 0],
            ArrowLeft: [-unit, 0],
            ArrowUp: y === undefined ? [unit, 0] : [0, -unit],
            ArrowDown: y === undefined ? [-unit, 0] : [0, unit],
            PageUp: y === undefined ? [0.1, 0] : [0, -0.1],
            PageDown: y === undefined ? [-0.1, 0] : [0, 0.1],
            Home: [-1, 0],
            End: [1, 0]
          };
          const move = moves[event.key];
          if (!move) return;
          event.preventDefault();
          onMove(clamp(x + move[0], 0, 1), clamp((y ?? 0) + move[1], 0, 1));
        }}
      />
    </div>
  );
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(
  { value, defaultValue = "#1447E6", onValueChange, swatches = defaultSwatches, alpha = false, disabled, className, "aria-label": ariaLabel = "Color", ...props },
  ref
) {
  const [hsva, setHsva] = React.useState<Hsva>(() => parseHex(value ?? defaultValue) ?? { h: 0, s: 0, v: 0, a: 1 });
  const [seen, setSeen] = React.useState(value);
  const [draft, setDraft] = React.useState<string | null>(null);
  const hex = toHex(hsva, alpha);
  if (value !== seen) {
    // controlled value changed from outside: adopt it, keeping the hue when the new color is grey
    setSeen(value);
    const parsed = value === undefined ? null : parseHex(value);
    if (parsed && toHex(parsed, alpha) !== hex) setHsva(parsed.s === 0 ? { ...parsed, h: hsva.h } : parsed);
  }
  const update = (next: Hsva) => {
    setHsva(next);
    const nextHex = toHex(next, alpha);
    if (nextHex !== hex) onValueChange?.(nextHex);
  };
  const commitDraft = () => {
    const parsed = draft === null ? null : parseHex(draft);
    if (parsed) update({ ...parsed, h: parsed.s === 0 ? hsva.h : parsed.h, a: alpha ? parsed.a : 1 });
    setDraft(null);
  };
  const solid = toHex({ ...hsva, a: 1 }, false);
  const percent = (n: number) => `${Math.round(n * 100)}%`;
  const invalid = draft !== null && parseHex(draft) === null;
  return (
    <div ref={ref} role="group" aria-label={ariaLabel} className={cx("chrome-color-picker", className)} data-disabled={disabled ? "" : undefined} {...props}>
      <Pad
        className="chrome-color-picker__area"
        label="Saturation and brightness"
        x={hsva.s}
        y={1 - hsva.v}
        max={100}
        valueText={`Saturation ${percent(hsva.s)}, brightness ${percent(hsva.v)}`}
        knob={solid}
        disabled={disabled}
        style={{ "--chrome-picker-hue": `hsl(${hsva.h} 100% 50%)` } as React.CSSProperties}
        onMove={(x, y) => update({ ...hsva, s: x, v: 1 - y })}
      />
      <Pad
        className="chrome-color-picker__hue"
        label="Hue"
        x={hsva.h / 360}
        max={360}
        valueText={`${Math.round(hsva.h)}°`}
        knob={`hsl(${hsva.h} 100% 50%)`}
        disabled={disabled}
        onMove={(x) => update({ ...hsva, h: x * 360 })}
      />
      {alpha ? (
        <Pad
          className="chrome-color-picker__alpha"
          label="Opacity"
          x={hsva.a}
          max={100}
          valueText={percent(hsva.a)}
          knob={toHex(hsva, true)}
          disabled={disabled}
          style={{ "--chrome-picker-solid": solid } as React.CSSProperties}
          onMove={(x) => update({ ...hsva, a: x })}
        />
      ) : null}
      {swatches.length ? (
        <div className="chrome-color-picker__swatches">
          {swatches.map((swatch) => {
            const item = typeof swatch === "string" ? { value: swatch } : swatch;
            const parsed = parseHex(item.value);
            const itemHex = parsed ? toHex({ ...parsed, a: 1 }, false) : item.value;
            return (
              <button
                key={item.value}
                type="button"
                className="chrome-color-picker__swatch"
                style={{ "--chrome-swatch": itemHex } as React.CSSProperties}
                aria-label={item.label ?? itemHex}
                aria-pressed={itemHex === solid}
                disabled={disabled || !parsed}
                onClick={() => parsed && update({ ...parsed, h: parsed.s === 0 ? hsva.h : parsed.h, a: hsva.a })}
              />
            );
          })}
        </div>
      ) : null}
      <label className="chrome-color-picker__hex chrome-in-well" data-invalid={invalid ? "" : undefined}>
        <span className="chrome-color-picker__chip" style={{ "--chrome-swatch": toHex(hsva, true) } as React.CSSProperties} aria-hidden="true" />
        <input
          value={draft ?? hex}
          aria-label="Hex color"
          aria-invalid={invalid || undefined}
          spellCheck={false}
          autoComplete="off"
          maxLength={9}
          disabled={disabled}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") commitDraft();
            if (event.key === "Escape" && draft !== null) {
              event.preventDefault();
              setDraft(null);
            }
          }}
        />
        <span className="chrome-color-picker__alpha-readout" aria-label={`Opacity ${percent(hsva.a)}`}>{percent(hsva.a)}</span>
      </label>
    </div>
  );
});

/* ---------- Calendar ---------- */

export interface DateRange {
  from: Date;
  to?: Date;
}

type AnyDateValue = Date | DateRange | null;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last));
};
const sameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const isRange = (v: AnyDateValue): v is DateRange => !!v && !(v instanceof Date);
const anchorOf = (v: AnyDateValue) => (isRange(v) ? v.from : v);

interface CalendarCommonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** The visible month (any day in it). */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  /** Draws a cobalt bead under matching days (events, release trains). */
  isDateMarked?: (date: Date) => boolean;
  /** Read after a marked day's name, e.g. "release train". */
  markedLabel?: string;
  /** Defaults to the current date; null hides the marker. */
  today?: Date | null;
  weekStartsOn?: 0 | 1;
  locale?: string;
  /** "sm" is the compact card grid (26 × 20 px days); "md" has 36 × 32 px days. */
  size?: "sm" | "md";
  /** Key under the grid, drawn with the marker bead, e.g. "Release train, every Tuesday". */
  legend?: React.ReactNode;
  /** Focuses the active day on mount (used by DatePicker). */
  autoFocus?: boolean;
}

export interface CalendarSingleProps extends CalendarCommonProps {
  mode?: "single";
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
}

export interface CalendarRangeProps extends CalendarCommonProps {
  mode: "range";
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (value: DateRange | null) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

type LooseCalendarProps = CalendarCommonProps & {
  mode?: "single" | "range";
  value?: AnyDateValue;
  defaultValue?: AnyDateValue;
  onValueChange?: (value: AnyDateValue) => void;
};

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    mode = "single",
    value,
    defaultValue = null,
    onValueChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    min,
    max,
    isDateDisabled,
    isDateMarked,
    markedLabel,
    today: todayProp,
    weekStartsOn = 0,
    locale,
    size = "md",
    legend,
    autoFocus,
    className,
    ...rest
  } = props as LooseCalendarProps;
  const [selected, setSelected] = useControllable<AnyDateValue>(value, defaultValue, onValueChange);
  const [now] = React.useState(() => new Date());
  const today = todayProp === undefined ? now : todayProp;
  const initial = anchorOf(selected) ?? today ?? now;
  const [visible, setVisible] = useControllable<Date>(monthProp ? startOfMonth(monthProp) : undefined, startOfMonth(defaultMonth ?? initial), onMonthChange);
  const month = startOfMonth(visible);
  const [focused, setFocused] = React.useState(() => startOfDay(initial));
  const active = sameMonth(focused, month) ? focused : month;
  const grid = React.useRef<HTMLTableElement>(null);
  const focusRequest = React.useRef(!!autoFocus);
  const titleId = useFieldId();

  React.useEffect(() => {
    if (!focusRequest.current) return;
    focusRequest.current = false;
    grid.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  });

  const disabledDay = (d: Date) => (!!min && d < startOfDay(min)) || (!!max && d > startOfDay(max)) || !!isDateDisabled?.(d);
  const goTo = (d: Date, focus: boolean) => {
    setFocused(d);
    if (!sameMonth(d, month)) setVisible(startOfMonth(d));
    if (focus) focusRequest.current = true;
  };
  const choose = (d: Date) => {
    if (disabledDay(d)) return;
    goTo(d, false);
    if (mode === "single") return setSelected(d);
    const range = isRange(selected) ? selected : null;
    if (!range || range.to) return setSelected({ from: d });
    setSelected(d < range.from ? { from: d, to: range.from } : { from: range.from, to: d });
  };
  const shiftMonth = (n: number) => {
    setFocused(addMonths(active, n));
    setVisible(addMonths(month, n));
  };

  const offset = (month.getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const start = addDays(month, -offset);
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const dayName = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const dayLetter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const fullDate = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);
  const range = isRange(selected) ? selected : null;
  const single = selected instanceof Date ? selected : null;
  const prevDisabled = !!min && startOfMonth(min) >= month;
  const nextDisabled = !!max && startOfMonth(max) <= month;

  return (
    <div ref={ref} className={cx("chrome-calendar", className)} data-size={size} data-marks={isDateMarked ? "" : undefined} {...rest}>
      <div className="chrome-calendar__header">
        <span className="chrome-calendar__title" id={titleId} aria-live="polite">{title}</span>
        <span className="chrome-calendar__nav">
          <button type="button" className="chrome-calendar__nav-button" aria-label="Previous month" disabled={prevDisabled} onClick={() => shiftMonth(-1)}>
            <Glyph name="prev" />
          </button>
          <button type="button" className="chrome-calendar__nav-button" aria-label="Next month" disabled={nextDisabled} onClick={() => shiftMonth(1)}>
            <Glyph name="next" />
          </button>
        </span>
      </div>
      <table
        ref={grid}
        role="grid"
        className="chrome-calendar__grid"
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          const weekday = (focused.getDay() - weekStartsOn + 7) % 7;
          const moves: Record<string, () => Date> = {
            ArrowLeft: () => addDays(active, -1),
            ArrowRight: () => addDays(active, 1),
            ArrowUp: () => addDays(active, -7),
            ArrowDown: () => addDays(active, 7),
            Home: () => addDays(active, -weekday),
            End: () => addDays(active, 6 - weekday),
            PageUp: () => addMonths(active, event.shiftKey ? -12 : -1),
            PageDown: () => addMonths(active, event.shiftKey ? 12 : 1)
          };
          const move = moves[event.key];
          if (!move) return;
          event.preventDefault();
          goTo(move(), true);
        }}
      >
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, i) => {
              const d = addDays(start, i);
              return <th key={i} scope="col" abbr={dayName.format(d)}>{dayLetter.format(d)}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: weeks }, (_, w) => (
            <tr key={w}>
              {Array.from({ length: 7 }, (_, i) => {
                const d = addDays(start, w * 7 + i);
                const outside = !sameMonth(d, month);
                const isStart = !!range && sameDay(d, range.from);
                const isEnd = !!range?.to && sameDay(d, range.to);
                const inside = !!range?.to && d > range.from && d < range.to;
                const chosen = sameDay(d, single) || isStart || isEnd;
                const marked = !!isDateMarked?.(d);
                const off = disabledDay(d);
                return (
                  <td key={i} role="gridcell" aria-selected={chosen || inside}>
                    <button
                      type="button"
                      className="chrome-calendar__day"
                      tabIndex={sameDay(d, active) ? 0 : -1}
                      aria-label={`${fullDate.format(d)}${marked && markedLabel ? `, ${markedLabel}` : ""}`}
                      aria-current={sameDay(d, today) ? "date" : undefined}
                      aria-disabled={off || undefined}
                      data-outside={outside ? "" : undefined}
                      data-today={sameDay(d, today) ? "" : undefined}
                      data-selected={chosen ? "" : undefined}
                      data-range-start={isStart && range?.to && !isEnd ? "" : undefined}
                      data-range-end={isEnd && !isStart ? "" : undefined}
                      data-in-range={inside ? "" : undefined}
                      onClick={() => choose(d)}
                      onFocus={() => { if (!sameDay(d, focused)) setFocused(d); }}
                    >
                      {d.getDate()}
                      {marked ? <span className="chrome-calendar__mark" aria-hidden="true" /> : null}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {legend ? (
        <div className="chrome-calendar__legend">
          <span className="chrome-calendar__mark" aria-hidden="true" />
          {legend}
        </div>
      ) : null}
    </div>
  );
});

/* ---------- DatePicker ---------- */

interface DatePickerCommonProps extends Omit<CalendarCommonProps, "autoFocus" | "legend" | "id"> {
  id?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submits ISO dates (a range as "start/end") through a hidden input. */
  name?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
}

export interface DatePickerSingleProps extends DatePickerCommonProps {
  mode?: "single";
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
}

export interface DatePickerRangeProps extends DatePickerCommonProps {
  mode: "range";
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (value: DateRange | null) => void;
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(props, ref) {
  const {
    id: providedId,
    mode = "single",
    value,
    defaultValue = null,
    onValueChange,
    label,
    hint,
    error,
    placeholder = mode === "range" ? "Pick dates" : "Pick a date",
    disabled,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    name,
    formatOptions = { month: "short", day: "numeric", year: "numeric" },
    locale,
    className,
    style,
    "aria-label": ariaLabel,
    ...calendarProps
  } = props as DatePickerCommonProps & Omit<LooseCalendarProps, keyof DatePickerCommonProps>;
  const id = useFieldId(providedId);
  const [selected, setSelected] = useControllable<AnyDateValue>(value, defaultValue, onValueChange);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  // only a reader's own open moves focus into the grid; an initially open picker leaves focus alone
  const [opened, setOpened] = React.useState(false);
  const format = new Intl.DateTimeFormat(locale, formatOptions);
  const range = isRange(selected) ? selected : null;
  const text = range
    ? range.to ? format.formatRange(range.from, range.to) : `${format.format(range.from)} – …`
    : selected instanceof Date ? format.format(selected) : "";
  const labelId = label ? `${id}-label` : undefined;
  const messageId = hint || error ? `${id}-message` : undefined;
  return (
    <FieldShell className={className} style={style} label={label} labelId={labelId} hint={hint} error={error} messageId={messageId}>
      <PopoverPrimitive.Root open={open} onOpenChange={(next) => { if (next) setOpened(true); setOpen(next); }}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            id={id}
            type="button"
            className="chrome-date-picker chrome-in-well"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel ? undefined : cx(labelId, id) || undefined}
            aria-describedby={messageId}
            aria-invalid={error ? true : undefined}
            data-invalid={error ? "" : undefined}
            data-placeholder={text ? undefined : ""}
          >
            <Glyph name="calendar" />
            <span className="chrome-date-picker__value">{text || placeholder}</span>
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <ChromePortalLayer>
            <PopoverPrimitive.Content
              className="chrome-in-popover chrome-date-picker__popover"
              align="start"
              sideOffset={6}
              collisionPadding={8}
              aria-label={mode === "range" ? "Choose dates" : "Choose a date"}
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <Calendar
                {...(calendarProps as CalendarCommonProps)}
                {...({ mode, value: selected } as CalendarSingleProps)}
                locale={locale}
                size={calendarProps.size ?? "sm"}
                autoFocus={opened}
                onValueChange={(next: AnyDateValue) => {
                  setSelected(next);
                  if (next instanceof Date || (isRange(next) && next.to)) setOpen(false);
                }}
              />
            </PopoverPrimitive.Content>
          </ChromePortalLayer>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {name ? <input type="hidden" name={name} value={range ? `${isoDate(range.from)}${range.to ? `/${isoDate(range.to)}` : ""}` : selected instanceof Date ? isoDate(selected) : ""} /> : null}
    </FieldShell>
  );
});

/* ---------- Combobox ---------- */

export interface ComboboxOption {
  value: string;
  label: string;
  /** Leading visual, e.g. an Avatar or a StatusIndicator. */
  icon?: React.ReactNode;
  /** Trailing quiet text. */
  description?: React.ReactNode;
  /** Extra words that also match the query. */
  keywords?: readonly string[];
  disabled?: boolean;
}

export interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size"> {
  options: readonly ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Leading glyph inside the field. */
  icon?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  filter?: (option: ComboboxOption, query: string) => boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Starting text when uncontrolled (e.g. a query in progress). */
  defaultInputValue?: string;
}

const defaultFilter = (option: ComboboxOption, query: string) => {
  const q = query.trim().toLowerCase();
  return !q || option.label.toLowerCase().includes(q) || !!option.keywords?.some((k) => k.toLowerCase().includes(q));
};

function highlight(label: string, query: string) {
  const q = query.trim();
  const at = q ? label.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return label;
  return (
    <>
      {label.slice(0, at)}
      <b>{label.slice(at, at + q.length)}</b>
      {label.slice(at + q.length)}
    </>
  );
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    id: providedId,
    options,
    value,
    defaultValue = null,
    onValueChange,
    label,
    hint,
    error,
    icon,
    emptyMessage = "No matches",
    filter = defaultFilter,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    defaultInputValue,
    name,
    className,
    style,
    disabled,
    onKeyDown,
    onBlur,
    onClick,
    "aria-describedby": describedBy,
    ...props
  },
  ref
) {
  const id = useFieldId(providedId);
  const listId = `${id}-listbox`;
  const [selected, setSelected] = useControllable(value, defaultValue, onValueChange);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const labelOf = (v: string | null) => options.find((o) => o.value === v)?.label ?? "";
  const [text, setText] = React.useState(() => defaultInputValue ?? labelOf(selected));
  const [query, setQuery] = React.useState<string | null>(defaultInputValue ?? null);
  const [activeValue, setActiveValue] = React.useState<string | null>(null);
  const anchor = React.useRef<HTMLDivElement>(null);
  const [seen, setSeen] = React.useState(selected);
  if (seen !== selected) {
    // the value changed from outside (controlled): show its label unless the user is mid-query
    setSeen(selected);
    if (query === null) setText(labelOf(selected));
  }
  const shown = query ? options.filter((o) => filter(o, query)) : options;
  const enabled = shown.filter((o) => !o.disabled);
  const active = enabled.find((o) => o.value === activeValue) ?? enabled.find((o) => o.value === selected) ?? (query ? enabled[0] : undefined);
  const optionId = (o: ComboboxOption) => `${listId}-${options.indexOf(o)}`;

  React.useEffect(() => {
    if (open && active) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
  });

  const settle = (keepText: boolean) => {
    setOpen(false);
    setQuery(null);
    setActiveValue(null);
    if (!keepText) setText(labelOf(selected));
  };
  const choose = (option: ComboboxOption) => {
    setSelected(option.value);
    setText(option.label);
    settle(true);
  };
  const step = (delta: number) => {
    if (!open) return setOpen(true);
    if (!enabled.length) return;
    const at = active ? enabled.indexOf(active) : -1;
    const next = enabled[(at + delta + enabled.length) % enabled.length];
    if (next) setActiveValue(next.value);
  };
  const messageId = hint || error ? `${id}-message` : undefined;
  return (
    <FieldShell className={className} style={style} label={label} htmlFor={id} hint={hint} error={error} messageId={messageId}>
      <PopoverPrimitive.Root open={open && !disabled} onOpenChange={(next) => (next ? setOpen(true) : settle(false))}>
        <PopoverPrimitive.Anchor asChild>
          <div ref={anchor} className="chrome-combobox chrome-in-well" data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
            {icon ? <span className="chrome-combobox__icon" aria-hidden="true">{icon}</span> : null}
            <input
              ref={ref}
              id={id}
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              value={text}
              disabled={disabled}
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={open && active ? optionId(active) : undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={cx(describedBy, messageId) || undefined}
              onChange={(event) => {
                setText(event.currentTarget.value);
                setQuery(event.currentTarget.value);
                setActiveValue(null);
                setOpen(true);
              }}
              onClick={(event) => {
                onClick?.(event);
                if (!open) setOpen(true);
              }}
              onBlur={(event) => {
                onBlur?.(event);
                if (text.trim() === "" && selected !== null) setSelected(null);
                settle(text.trim() === "");
              }}
              onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.defaultPrevented || event.nativeEvent.isComposing) return;
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  if (event.altKey) setOpen(true);
                  else step(1);
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  step(-1);
                } else if (event.key === "Enter" && open && active) {
                  event.preventDefault();
                  choose(active);
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  if (open) settle(false);
                  else if (text) {
                    setText("");
                    setSelected(null);
                  }
                }
              }}
              {...props}
            />
          </div>
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          <ChromePortalLayer>
            <PopoverPrimitive.Content
              id={listId}
              role="listbox"
              aria-labelledby={label ? undefined : id}
              aria-label={typeof label === "string" ? label : undefined}
              className="chrome-in-popover chrome-combobox__list"
              align="start"
              sideOffset={6}
              collisionPadding={8}
              onOpenAutoFocus={(event) => event.preventDefault()}
              onCloseAutoFocus={(event) => event.preventDefault()}
              onInteractOutside={(event) => {
                if (anchor.current?.contains(event.target as Node)) event.preventDefault();
              }}
            >
              {shown.length ? (
                shown.map((option) => (
                  <div
                    key={option.value}
                    id={optionId(option)}
                    role="option"
                    className="chrome-in-option"
                    aria-selected={option === active}
                    aria-disabled={option.disabled || undefined}
                    data-highlighted={option === active ? "" : undefined}
                    data-checked={option.value === selected ? "" : undefined}
                    onPointerDown={(event) => event.preventDefault()}
                    onPointerMove={() => { if (!option.disabled && activeValue !== option.value) setActiveValue(option.value); }}
                    onClick={() => { if (!option.disabled) choose(option); }}
                  >
                    {option.icon ? <span className="chrome-in-option__icon" aria-hidden="true">{option.icon}</span> : null}
                    <span className="chrome-in-option__label">{highlight(option.label, query ?? "")}</span>
                    {option.description ? <span className="chrome-in-option__description">{option.description}</span> : null}
                    {option.value === selected ? <Glyph name="check" className="chrome-in-option__check" /> : null}
                  </div>
                ))
              ) : (
                <div role="option" aria-selected={false} aria-disabled="true" className="chrome-in-option" data-empty="">{emptyMessage}</div>
              )}
            </PopoverPrimitive.Content>
          </ChromePortalLayer>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {name ? <input type="hidden" name={name} value={selected ?? ""} /> : null}
    </FieldShell>
  );
});
