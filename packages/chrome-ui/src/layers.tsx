import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Slot } from "@radix-ui/react-slot";
import { KeyHint } from "./extended";
import { ChevronDownIcon, ChevronRightIcon, CloseIcon } from "./icons";
import { ChromePortalLayer } from "./provider";
import { cx } from "./utils";

/*
 * Inline rendering (catalog previews, docs): pass `inline` to a floating component's Root (or to CommandPalette).
 * The panel renders open, in place, as plain markup: no portal, overlay, positioning, focus trap or dismiss layer
 * (an always-open Radix layer would swallow Escape for every real dialog and menu on the page). Popover, HoverCard,
 * ContextMenu and CommandPalette sit in normal flow, so lay them out with the surrounding markup; Drawer is absolutely
 * positioned inside the nearest positioned ancestor.
 */
const InlineContext = React.createContext(false);

/** Inline panels are plain elements: keep only the props a DOM element understands. */
function domProps(props: object) {
  return Object.fromEntries(Object.entries(props).filter(([key]) => /^(aria-|data-|id$|role$|title$|style$)/.test(key)));
}

/** Dialog layers opened without a Radix Trigger (controlled `open`) would drop focus on <body> when they close; send it back to the opener. */
function useReturnFocus(onOpenAutoFocus?: (event: Event) => void, onCloseAutoFocus?: (event: Event) => void) {
  const opener = React.useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: (event: Event) => {
      opener.current = document.activeElement as HTMLElement | null;
      onOpenAutoFocus?.(event);
    },
    onCloseAutoFocus: (event: Event) => {
      onCloseAutoFocus?.(event);
      const element = opener.current;
      if (event.defaultPrevented || !element?.isConnected || element === document.body) return;
      event.preventDefault();
      element.focus();
    }
  };
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value !== undefined ? value : inner;
  const set = React.useCallback(
    (next: T) => {
      if (value === undefined) setInner(next);
      onChange?.(next);
    },
    [value, onChange]
  );
  return [current, set] as const;
}

function Shortcut({ keys }: { keys: string | readonly string[] }) {
  const list = typeof keys === "string" ? [keys] : keys;
  return (
    <span className="chrome-menu__shortcut">
      {list.map((key, index) => <KeyHint key={`${key}-${index}`}>{key}</KeyHint>)}
    </span>
  );
}

function ItemParts({ icon, shortcut, meta, mono, children }: {
  icon?: React.ReactNode;
  shortcut?: string | readonly string[];
  meta?: React.ReactNode;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      {icon ? <span className="chrome-menu__icon" aria-hidden="true">{icon}</span> : null}
      <span className="chrome-menu__label" data-mono={mono || undefined}>{children}</span>
      {meta != null ? <span className="chrome-menu__meta">{meta}</span> : null}
      {shortcut ? <Shortcut keys={shortcut} /> : null}
    </>
  );
}

function SearchGlyph() {
  return (
    <svg className="chrome-command__search" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** The pointer of a Popover or HoverCard. Radix aims it; inline (no `Arrow`) it is placed by CSS (`--chrome-arrow-x`). */
function LayerArrow({ Arrow }: { Arrow?: typeof PopoverPrimitive.Arrow | typeof HoverCardPrimitive.Arrow }) {
  const arrow = <span className="chrome-layer__arrow" data-inline={Arrow ? undefined : ""} aria-hidden="true" />;
  return Arrow ? <Arrow asChild width={15} height={9}>{arrow}</Arrow> : arrow;
}

function arrowStyle(style: React.CSSProperties | undefined, arrowOffset: number | undefined) {
  return arrowOffset == null ? style : ({ ...style, "--chrome-arrow-x": `${arrowOffset}px` } as React.CSSProperties);
}

/* ---------- Accordion ---------- */

const AccordionRoot = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(function AccordionRoot({ className, ...props }, ref) {
  return <AccordionPrimitive.Root ref={ref} className={cx("chrome-accordion", className)} {...props} />;
});

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem({ className, ...props }, ref) {
  return <AccordionPrimitive.Item ref={ref} className={cx("chrome-accordion__item", className)} {...props} />;
});

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="chrome-accordion__header">
      <AccordionPrimitive.Trigger ref={ref} className={cx("chrome-accordion__trigger", className)} {...props}>
        <span className="chrome-accordion__title">{children}</span>
        <span className="chrome-accordion__chevron" aria-hidden="true"><ChevronDownIcon /></span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content ref={ref} className={cx("chrome-accordion__content", className)} {...props}>
      <div className="chrome-accordion__body">{children}</div>
    </AccordionPrimitive.Content>
  );
});

export const Accordion = { Root: AccordionRoot, Item: AccordionItem, Trigger: AccordionTrigger, Content: AccordionContent };

/* ---------- Command Palette ---------- */

export interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string | readonly string[];
  /** Quiet text on the right, such as a region or version. */
  meta?: React.ReactNode;
  /** Extra words that match the query but are not shown. */
  keywords?: readonly string[];
  /** Set the label in the mono face (service names, IDs). */
  mono?: boolean;
  disabled?: boolean;
}

export interface CommandPaletteGroup {
  id?: string;
  label: string;
  items: readonly CommandPaletteItem[];
}

export interface CommandPaletteProps {
  groups: readonly CommandPaletteGroup[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Runs for the chosen item (Enter or click); the palette then closes. */
  onSelect?: (item: CommandPaletteItem) => void;
  defaultQuery?: string;
  placeholder?: string;
  /** Accessible name of the dialog, search field and list. */
  label?: string;
  emptyMessage?: React.ReactNode;
  /** Show the keyboard hints and result count under the list. */
  footer?: boolean;
  size?: "sm" | "md";
  /** Render open in place, without portal or overlay (previews). */
  inline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function queryTerms(query: string) {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function matchScore(item: CommandPaletteItem, terms: string[]) {
  const haystack = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
  return terms.filter((term) => haystack.includes(term)).length;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(label: string, terms: string[]) {
  if (!terms.length) return label;
  const pattern = new RegExp(`(${[...terms].sort((a, b) => b.length - a.length).map(escapeRegExp).join("|")})`, "gi");
  return label.split(pattern).map((part, index) => (index % 2 ? <b key={index}>{part}</b> : part));
}

/** Items match when any query word appears in the label or keywords; more matched words rank first within a group. */
function filterCommandGroups(groups: readonly CommandPaletteGroup[], query: string) {
  const terms = queryTerms(query);
  return groups
    .map((group) => {
      if (!terms.length) return { ...group, items: [...group.items] };
      const scored = group.items.map((item) => ({ item, score: matchScore(item, terms) })).filter((entry) => entry.score > 0);
      return { ...group, items: scored.sort((a, b) => b.score - a.score).map((entry) => entry.item) };
    })
    .filter((group) => group.items.length > 0);
}

export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(function CommandPalette(
  { open, defaultOpen = false, onOpenChange, inline = false, ...props },
  ref
) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const panel = <CommandPanel ref={ref} inline={inline} onClose={() => setOpen(false)} {...props} />;
  return (
    <DialogPrimitive.Root open={inline || isOpen} onOpenChange={setOpen} modal={!inline}>
      {inline ? panel : (
        <DialogPrimitive.Portal>
          <ChromePortalLayer>
            <DialogPrimitive.Overlay className="chrome-layer-scrim" />
            {panel}
          </ChromePortalLayer>
        </DialogPrimitive.Portal>
      )}
    </DialogPrimitive.Root>
  );
});

type CommandPanelProps = Omit<CommandPaletteProps, "open" | "defaultOpen" | "onOpenChange"> & { inline: boolean; onClose: () => void };

const CommandPanel = React.forwardRef<HTMLDivElement, CommandPanelProps>(function CommandPanel(
  {
    groups,
    onSelect,
    defaultQuery = "",
    placeholder = "Search actions and services…",
    label = "Command palette",
    emptyMessage,
    footer = false,
    size = "md",
    inline,
    onClose,
    className,
    style
  },
  ref
) {
  const [query, setQuery] = React.useState(defaultQuery);
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const navigated = React.useRef(false);
  const baseId = React.useId();
  const listId = `${baseId}-list`;
  const terms = queryTerms(query);
  const results = React.useMemo(() => filterCommandGroups(groups, query), [groups, query]);
  const enabled = results.flatMap((group) => group.items).filter((item) => !item.disabled);
  const activeItem = enabled[Math.min(active, enabled.length - 1)];
  const focus = useReturnFocus();
  const optionId = (item: CommandPaletteItem) => `${baseId}-${results.flatMap((group) => group.items).indexOf(item)}`;
  const count = results.reduce((sum, group) => sum + group.items.length, 0);

  // keep the active option visible by scrolling the list only, never the page
  React.useEffect(() => {
    const list = listRef.current;
    const option = list?.querySelector<HTMLElement>("[data-highlighted]");
    if (!list || !option || !navigated.current) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [active]);

  const choose = (item: CommandPaletteItem) => {
    if (item.disabled) return;
    onSelect?.(item);
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!enabled.length) return;
    const current = activeItem ? enabled.indexOf(activeItem) : 0;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      navigated.current = true;
      setActive((current + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length);
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      choose(activeItem);
    }
  };

  const body = (
    <>
      <div className="chrome-command__header">
        <SearchGlyph />
        <input
          className="chrome-command__input"
          type="text"
          role="combobox"
          aria-label={label}
          aria-expanded={count > 0}
          aria-controls={count > 0 ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeItem ? optionId(activeItem) : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        <DialogPrimitive.Close className="chrome-command__esc" aria-label="Close">
          <KeyHint>esc</KeyHint>
        </DialogPrimitive.Close>
      </div>
      {count > 0 ? (
        <div ref={listRef} className="chrome-command__list" id={listId} role="listbox" aria-label={label}>
          {results.map((group, groupIndex) => {
            const groupId = `${baseId}-g${groupIndex}`;
            return (
              <div key={group.id ?? group.label} role="group" aria-labelledby={groupId} className="chrome-command__group">
                <div id={groupId} className="chrome-menu__caption" role="presentation">{group.label}</div>
                {group.items.map((item) => {
                  const highlighted = item === activeItem;
                  return (
                    <div
                      key={item.id}
                      id={optionId(item)}
                      role="option"
                      aria-selected={highlighted}
                      aria-disabled={item.disabled || undefined}
                      className="chrome-menu__item"
                      data-highlighted={highlighted || undefined}
                      data-disabled={item.disabled || undefined}
                      onPointerMove={() => {
                        if (!item.disabled && !highlighted) setActive(enabled.indexOf(item));
                      }}
                      onClick={() => choose(item)}
                    >
                      <ItemParts icon={item.icon} shortcut={item.shortcut} meta={item.meta} mono={item.mono}>
                        {highlight(item.label, terms)}
                      </ItemParts>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="chrome-command__empty">{emptyMessage ?? `No results for “${query.trim()}”`}</div>
      )}
      {footer ? (
        <div className="chrome-command__footer">
          <span className="chrome-command__hint" aria-hidden="true"><KeyHint>↑</KeyHint><KeyHint>↓</KeyHint>Navigate</span>
          <span className="chrome-command__hint" aria-hidden="true"><KeyHint>↵</KeyHint>Run</span>
          <span className="chrome-command__count" role="status">{count} {count === 1 ? "result" : "results"}</span>
        </div>
      ) : (
        <span className="chrome-layer-sr" role="status">{count} {count === 1 ? "result" : "results"}</span>
      )}
    </>
  );
  const shared = { className: cx("chrome-layer", "chrome-command", className), style, "data-size": size };
  if (inline) return <div ref={ref} {...shared} data-chrome-inline="">{body}</div>;
  return (
    <DialogPrimitive.Content ref={ref} {...shared} aria-describedby={undefined} {...focus}>
      <DialogPrimitive.Title className="chrome-layer-sr">{label}</DialogPrimitive.Title>
      {body}
    </DialogPrimitive.Content>
  );
});

/* ---------- Context Menu ---------- */

export interface ContextMenuRootProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root> {
  /** Render the menu open in place as static markup (previews); there is no pointer to open it at. */
  inline?: boolean;
}

function ContextMenuRoot({ inline = false, ...props }: ContextMenuRootProps) {
  return inline ? <InlineContext.Provider value>{props.children}</InlineContext.Provider> : <ContextMenuPrimitive.Root {...props} />;
}

const ContextMenuTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger>
>(function ContextMenuTrigger({ className, asChild, disabled, ...props }, ref) {
  const classes = cx("chrome-context-menu__trigger", className);
  if (React.useContext(InlineContext)) {
    const Comp = asChild ? Slot : "span";
    return <Comp ref={ref} className={classes} data-state="open" {...props} />;
  }
  return <ContextMenuPrimitive.Trigger ref={ref} asChild={asChild} disabled={disabled} className={classes} {...props} />;
});

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(function ContextMenuContent({ className, children, ...props }, ref) {
  const classes = cx("chrome-layer", "chrome-menu", className);
  if (React.useContext(InlineContext)) {
    return <div ref={ref} role="menu" className={classes} data-chrome-inline="" {...domProps(props)}>{children}</div>;
  }
  return (
    <ContextMenuPrimitive.Portal>
      <ChromePortalLayer>
        <ContextMenuPrimitive.Content ref={ref} className={classes} {...props}>{children}</ContextMenuPrimitive.Content>
      </ChromePortalLayer>
    </ContextMenuPrimitive.Portal>
  );
});

export interface ContextMenuItemProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> {
  icon?: React.ReactNode;
  shortcut?: string | readonly string[];
  /** Enamel text for actions that destroy something. */
  destructive?: boolean;
}

const ContextMenuItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Item>, ContextMenuItemProps>(
  function ContextMenuItem({ icon, shortcut, destructive, className, children, ...props }, ref) {
    const classes = cx("chrome-menu__item", className);
    const tone = destructive ? "danger" : undefined;
    const parts = <ItemParts icon={icon} shortcut={shortcut}>{children}</ItemParts>;
    if (React.useContext(InlineContext)) {
      return <div ref={ref} role="menuitem" className={classes} data-tone={tone} aria-disabled={props.disabled || undefined} data-disabled={props.disabled || undefined} {...domProps(props)}>{parts}</div>;
    }
    return <ContextMenuPrimitive.Item ref={ref} className={classes} data-tone={tone} {...props}>{parts}</ContextMenuPrimitive.Item>;
  }
);

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(function ContextMenuSeparator({ className, ...props }, ref) {
  const classes = cx("chrome-menu__separator", className);
  if (React.useContext(InlineContext)) return <div ref={ref} role="separator" className={classes} {...domProps(props)} />;
  return <ContextMenuPrimitive.Separator ref={ref} className={classes} {...props} />;
});

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>
>(function ContextMenuLabel({ className, ...props }, ref) {
  const classes = cx("chrome-menu__caption", className);
  if (React.useContext(InlineContext)) return <div ref={ref} className={classes} {...domProps(props)}>{props.children}</div>;
  return <ContextMenuPrimitive.Label ref={ref} className={classes} {...props} />;
});

function ContextMenuGroup(props: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Group>) {
  if (React.useContext(InlineContext)) return <div role="group" {...domProps(props)}>{props.children}</div>;
  return <ContextMenuPrimitive.Group {...props} />;
}

function ContextMenuSub(props: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Sub>) {
  const inline = React.useContext(InlineContext);
  return inline ? <>{props.children}</> : <ContextMenuPrimitive.Sub {...props} />;
}

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & { icon?: React.ReactNode }
>(function ContextMenuSubTrigger({ icon, className, children, ...props }, ref) {
  const classes = cx("chrome-menu__item", className);
  const parts = <><ItemParts icon={icon}>{children}</ItemParts><ChevronRightIcon className="chrome-menu__chevron" /></>;
  if (React.useContext(InlineContext)) {
    return <div ref={ref} role="menuitem" aria-haspopup="menu" aria-expanded={false} className={classes} {...domProps(props)}>{parts}</div>;
  }
  return <ContextMenuPrimitive.SubTrigger ref={ref} className={classes} {...props}>{parts}</ContextMenuPrimitive.SubTrigger>;
});

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(function ContextMenuSubContent({ className, sideOffset = 6, alignOffset = -5, ...props }, ref) {
  if (React.useContext(InlineContext)) return null;
  return (
    <ContextMenuPrimitive.Portal>
      <ChromePortalLayer>
        <ContextMenuPrimitive.SubContent
          ref={ref}
          className={cx("chrome-layer", "chrome-menu", className)}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          {...props}
        />
      </ChromePortalLayer>
    </ContextMenuPrimitive.Portal>
  );
});

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Separator: ContextMenuSeparator,
  Label: ContextMenuLabel,
  Group: ContextMenuGroup,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent
};

/* ---------- Drawer ---------- */

export interface DrawerRootProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  /** Render open in place: absolutely positioned in the nearest positioned ancestor, with its own scrim. */
  inline?: boolean;
}

function DrawerRoot({ inline = false, open, modal, ...props }: DrawerRootProps) {
  return (
    <InlineContext.Provider value={inline}>
      <DialogPrimitive.Root open={inline || open} modal={!inline && modal} {...props} />
    </InlineContext.Provider>
  );
}

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "left" | "right";
  showClose?: boolean;
}

const DrawerContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DrawerContentProps>(function DrawerContent(
  { side = "right", showClose = true, className, children, onOpenAutoFocus, onCloseAutoFocus, ...props },
  ref
) {
  const inline = React.useContext(InlineContext);
  const focus = useReturnFocus(onOpenAutoFocus, onCloseAutoFocus);
  const classes = cx("chrome-layer", "chrome-layer--bezel", "chrome-drawer", className);
  const body = (
    <>
      {showClose ? (
        <DialogPrimitive.Close className="chrome-layer__close chrome-drawer__close" aria-label="Close">
          <CloseIcon />
        </DialogPrimitive.Close>
      ) : null}
      {children}
    </>
  );
  if (inline) {
    return (
      <>
        <div className="chrome-layer-scrim" data-inline="" aria-hidden="true" />
        <div ref={ref} className={classes} data-side={side} data-chrome-inline="" {...domProps(props)}>{body}</div>
      </>
    );
  }
  return (
    <DialogPrimitive.Portal>
      <ChromePortalLayer>
        <DialogPrimitive.Overlay className="chrome-layer-scrim" />
        <DialogPrimitive.Content ref={ref} className={classes} data-side={side} {...focus} {...props}>{body}</DialogPrimitive.Content>
      </ChromePortalLayer>
    </DialogPrimitive.Portal>
  );
});

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small mono line above the title, such as an incident ID. */
  eyebrow?: React.ReactNode;
}

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(function DrawerHeader({ eyebrow, className, children, ...props }, ref) {
  return (
    <div ref={ref} className={cx("chrome-drawer__header", className)} {...props}>
      {eyebrow != null ? <span className="chrome-drawer__eyebrow">{eyebrow}</span> : null}
      {children}
    </div>
  );
});

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DrawerTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cx("chrome-drawer__title", className)} {...props} />;
});

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DrawerDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description ref={ref} className={cx("chrome-drawer__description", className)} {...props} />;
});

const DrawerBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function DrawerBody({ className, ...props }, ref) {
  return <div ref={ref} className={cx("chrome-drawer__body", className)} {...props} />;
});

const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function DrawerFooter({ className, ...props }, ref) {
  return <div ref={ref} className={cx("chrome-drawer__footer", className)} {...props} />;
});

export const Drawer = {
  Root: DrawerRoot,
  Trigger: DialogPrimitive.Trigger,
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DialogPrimitive.Close
};

/* ---------- Hover Card ---------- */

export interface HoverCardRootProps extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root> {
  inline?: boolean;
}

function HoverCardRoot({ inline = false, open, ...props }: HoverCardRootProps) {
  return (
    <InlineContext.Provider value={inline}>
      <HoverCardPrimitive.Root open={inline || open} {...props} />
    </InlineContext.Provider>
  );
}

export interface HoverCardContentProps extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  arrow?: boolean;
  /** Inline only: the arrow's centre, in px from the card's left edge (default: centre). */
  arrowOffset?: number;
}

const HoverCardContent = React.forwardRef<React.ElementRef<typeof HoverCardPrimitive.Content>, HoverCardContentProps>(
  function HoverCardContent({ className, children, arrow = true, arrowOffset, sideOffset, style, ...props }, ref) {
    const classes = cx("chrome-layer", "chrome-hover-card", className);
    if (React.useContext(InlineContext)) {
      return (
        <div ref={ref} className={classes} data-chrome-inline="" data-side="bottom" {...domProps(props)} style={arrowStyle(style, arrowOffset)}>
          {children}
          {arrow ? <LayerArrow /> : null}
        </div>
      );
    }
    return (
      <HoverCardPrimitive.Portal>
        <ChromePortalLayer>
          <HoverCardPrimitive.Content ref={ref} className={classes} sideOffset={sideOffset ?? (arrow ? 2 : 6)} arrowPadding={14} style={style} {...props}>
            {children}
            {arrow ? <LayerArrow Arrow={HoverCardPrimitive.Arrow} /> : null}
          </HoverCardPrimitive.Content>
        </ChromePortalLayer>
      </HoverCardPrimitive.Portal>
    );
  }
);

export const HoverCard = { Root: HoverCardRoot, Trigger: HoverCardPrimitive.Trigger, Content: HoverCardContent };

/* ---------- Popover ---------- */

export interface PopoverRootProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
  inline?: boolean;
}

function PopoverRoot({ inline = false, open, modal, ...props }: PopoverRootProps) {
  return (
    <InlineContext.Provider value={inline}>
      <PopoverPrimitive.Root open={inline || open} modal={!inline && modal} {...props} />
    </InlineContext.Provider>
  );
}

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  arrow?: boolean;
  /** Inline only: the arrow's centre, in px from the panel's left edge (default: centre). */
  arrowOffset?: number;
  /** A close button in the top-right corner. */
  showClose?: boolean;
  /** No padding, for panels with their own header and rows (notification trays). */
  flush?: boolean;
}

const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(function PopoverContent(
  { className, children, arrow = true, arrowOffset, showClose = false, flush = false, sideOffset, style, ...props },
  ref
) {
  const inline = React.useContext(InlineContext);
  const classes = cx("chrome-layer", "chrome-popover", className);
  const close = showClose ? (
    <PopoverPrimitive.Close className="chrome-layer__close chrome-popover__close" aria-label="Close">
      <CloseIcon />
    </PopoverPrimitive.Close>
  ) : null;
  if (inline) {
    return (
      <div ref={ref} className={classes} data-chrome-inline="" data-side="bottom" data-flush={flush || undefined} {...domProps(props)} style={arrowStyle(style, arrowOffset)}>
        {children}
        {close}
        {arrow ? <LayerArrow /> : null}
      </div>
    );
  }
  return (
    <PopoverPrimitive.Portal>
      <ChromePortalLayer>
        <PopoverPrimitive.Content ref={ref} className={classes} data-flush={flush || undefined} sideOffset={sideOffset ?? (arrow ? 2 : 6)} arrowPadding={14} style={style} {...props}>
          {children}
          {close}
          {arrow ? <LayerArrow Arrow={PopoverPrimitive.Arrow} /> : null}
        </PopoverPrimitive.Content>
      </ChromePortalLayer>
    </PopoverPrimitive.Portal>
  );
});

/** Inline, the panel is not a Radix layer, so the trigger must not point `aria-controls` at it. */
const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(function PopoverTrigger(props, ref) {
  const inline = React.useContext(InlineContext);
  return <PopoverPrimitive.Trigger ref={ref} {...props} {...(inline ? { "aria-controls": undefined } : null)} />;
});

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Anchor: PopoverPrimitive.Anchor,
  Content: PopoverContent,
  Close: PopoverPrimitive.Close
};

/* ---------- Tree View ---------- */

export interface TreeViewNode {
  id: string;
  label: React.ReactNode;
  /** Text for type-ahead when the label is not a string. */
  textValue?: string;
  icon?: React.ReactNode;
  /** Quiet text on the right, such as a count. */
  meta?: React.ReactNode;
  children?: readonly TreeViewNode[];
  disabled?: boolean;
}

export interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children" | "defaultValue" | "onSelect"> {
  items: readonly TreeViewNode[];
  expanded?: readonly string[];
  defaultExpanded?: readonly string[];
  onExpandedChange?: (ids: string[]) => void;
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (id: string, node: TreeViewNode) => void;
  /** Engraved guide beside nested leaves. */
  lines?: boolean;
}

type TreeRow = { node: TreeViewNode; level: number; parent: string | null };

const TYPEAHEAD_MS = 500;

export const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
  {
    items,
    expanded: expandedProp,
    defaultExpanded = [],
    onExpandedChange,
    selected: selectedProp,
    defaultSelected = null,
    onSelectedChange,
    lines = true,
    className,
    onKeyDown,
    ...props
  },
  ref
) {
  const [expanded, setExpanded] = useControllable<readonly string[]>(expandedProp, defaultExpanded, onExpandedChange && ((ids) => onExpandedChange([...ids])));
  const [selected, setSelectedState] = useControllable<string | null>(selectedProp, defaultSelected);
  const [focused, setFocused] = React.useState<string | null>(null);
  const nodes = React.useRef(new Map<string, HTMLLIElement>());
  const typeahead = React.useRef({ text: "", time: 0 });
  const baseId = React.useId();
  const open = React.useMemo(() => new Set(expanded), [expanded]);

  const rows = React.useMemo(() => {
    const out: TreeRow[] = [];
    const walk = (list: readonly TreeViewNode[], level: number, parent: string | null) => {
      for (const node of list) {
        out.push({ node, level, parent });
        if (node.children?.length && open.has(node.id)) walk(node.children, level + 1, node.id);
      }
    };
    walk(items, 1, null);
    return out;
  }, [items, open]);

  const tabStop = rows.some((row) => row.node.id === focused) ? focused
    : rows.some((row) => row.node.id === selected) ? selected
      : rows[0]?.node.id ?? null;

  const focusNode = (id: string | undefined) => {
    if (!id) return;
    setFocused(id);
    nodes.current.get(id)?.focus();
  };
  const toggle = (id: string, next: boolean) => {
    if (open.has(id) === next) return;
    setExpanded(next ? [...expanded, id] : expanded.filter((value) => value !== id));
  };
  const select = (node: TreeViewNode) => {
    if (node.disabled) return;
    setSelectedState(node.id);
    onSelectedChange?.(node.id, node);
  };
  const textOf = (node: TreeViewNode) => (node.textValue ?? (typeof node.label === "string" ? node.label : "")).toLowerCase();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const index = rows.findIndex((row) => row.node.id === tabStop);
    const row = rows[index];
    if (!row) return;
    const { node } = row;
    const isParent = Boolean(node.children?.length);
    const isOpen = open.has(node.id);
    let handled = true;
    switch (event.key) {
      case "ArrowDown": focusNode(rows[index + 1]?.node.id); break;
      case "ArrowUp": focusNode(rows[index - 1]?.node.id); break;
      case "Home": focusNode(rows[0]?.node.id); break;
      case "End": focusNode(rows[rows.length - 1]?.node.id); break;
      case "ArrowRight":
        if (isParent && !node.disabled) {
          if (isOpen) focusNode(rows[index + 1]?.node.id);
          else toggle(node.id, true);
        }
        break;
      case "ArrowLeft":
        if (isParent && isOpen && !node.disabled) toggle(node.id, false);
        else focusNode(row.parent ?? undefined);
        break;
      case "Enter":
      case " ":
        select(node);
        break;
      default: {
        handled = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
        if (!handled) break;
        const now = event.timeStamp;
        const state = typeahead.current;
        state.text = now - state.time > TYPEAHEAD_MS ? event.key.toLowerCase() : state.text + event.key.toLowerCase();
        state.time = now;
        // a repeated single letter cycles through matches; a longer prefix keeps the current match if it still fits
        const start = state.text.length > 1 ? index : index + 1;
        const ordered = [...rows.slice(start), ...rows.slice(0, start)];
        focusNode(ordered.find((candidate) => textOf(candidate.node).startsWith(state.text))?.node.id);
      }
    }
    if (handled) event.preventDefault();
  };

  const renderNodes = (list: readonly TreeViewNode[], level: number): React.ReactNode =>
    list.map((node) => {
      const isParent = Boolean(node.children?.length);
      const isOpen = isParent && open.has(node.id);
      const labelId = `${baseId}-${node.id}`;
      return (
        <li
          key={node.id}
          ref={(element) => {
            if (element) nodes.current.set(node.id, element);
            else nodes.current.delete(node.id);
          }}
          role="treeitem"
          className="chrome-tree__item"
          aria-labelledby={labelId}
          aria-expanded={isParent ? isOpen : undefined}
          aria-selected={selected === node.id ? true : undefined}
          aria-disabled={node.disabled || undefined}
          tabIndex={tabStop === node.id ? 0 : -1}
          data-leaf={!isParent || undefined}
          data-nested={level > 1 || undefined}
          style={{ "--chrome-tree-level": level } as React.CSSProperties}
          onFocus={(event) => {
            if (event.target === event.currentTarget) setFocused(node.id);
          }}
        >
          <div
            className="chrome-tree__row"
            data-selected={selected === node.id || undefined}
            onClick={() => {
              focusNode(node.id);
              select(node);
              if (isParent && !node.disabled) toggle(node.id, !isOpen);
            }}
          >
            {isParent ? <ChevronRightIcon className="chrome-tree__toggle" /> : null}
            {node.icon ? <span className="chrome-tree__icon" aria-hidden="true">{node.icon}</span> : null}
            <span className="chrome-tree__label" id={labelId}>{node.label}</span>
            {node.meta != null ? <span className="chrome-tree__meta">{node.meta}</span> : null}
          </div>
          {isOpen ? <ul role="group" className="chrome-tree__group">{renderNodes(node.children ?? [], level + 1)}</ul> : null}
        </li>
      );
    });

  return (
    <ul ref={ref} role="tree" className={cx("chrome-tree", className)} data-lines={lines || undefined} onKeyDown={handleKeyDown} {...props}>
      {renderNodes(items, 1)}
    </ul>
  );
});
