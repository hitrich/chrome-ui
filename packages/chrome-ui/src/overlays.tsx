import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as ToastPrimitive from "@radix-ui/react-toast";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { CheckIcon, ChevronDownIcon, CloseIcon } from "./icons";
import { ChromePortalLayer } from "./provider";
import { cx } from "./utils";

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger ref={ref} className={cx("chrome-select__trigger", className)} {...props}>
      {children}
      <SelectPrimitive.Icon><ChevronDownIcon /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  Omit<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>, "asChild">
>(function SelectValue({ className, children, placeholder, ...props }, ref) {
  return (
    <span ref={ref} className={cx("chrome-select__value", className)} {...props}>
      <SelectPrimitive.Value placeholder={placeholder}>{children}</SelectPrimitive.Value>
    </span>
  );
});

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = "popper", ...props }, ref) {
  return (
    <SelectPrimitive.Portal>
      <ChromePortalLayer>
        <SelectPrimitive.Content
          ref={ref}
          className={cx("chrome-select__content", className)}
          position={position}
          sideOffset={6}
          {...props}
        >
          <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </ChromePortalLayer>
    </SelectPrimitive.Portal>
  );
});

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item ref={ref} className={cx("chrome-select__item", className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator><CheckIcon /></SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...props }, ref) {
  return <SelectPrimitive.Label ref={ref} className={cx("chrome-select__label", className)} {...props} />;
});

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return <SelectPrimitive.Separator ref={ref} className={cx("chrome-select__separator", className)} {...props} />;
});

export const Select = {
  Root: SelectPrimitive.Root,
  Group: SelectPrimitive.Group,
  Value: SelectValue,
  Label: SelectLabel,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
  Separator: SelectSeparator
};

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent({ className, sideOffset = 8, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <ChromePortalLayer>
        <TooltipPrimitive.Content
          ref={ref}
          className={cx("chrome-tooltip", className)}
          sideOffset={sideOffset}
          {...props}
        />
      </ChromePortalLayer>
    </TooltipPrimitive.Portal>
  );
});

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(function TooltipTrigger({ className, ...props }, ref) {
  return <TooltipPrimitive.Trigger ref={ref} className={cx("chrome-tooltip__trigger", className)} {...props} />;
});

export const Tooltip = {
  Provider: TooltipPrimitive.Provider,
  Root: TooltipPrimitive.Root,
  Trigger: TooltipTrigger,
  Content: TooltipContent
};

const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(function DropdownContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <DropdownPrimitive.Portal>
      <ChromePortalLayer>
        <DropdownPrimitive.Content
          ref={ref}
          className={cx("chrome-dropdown", className)}
          sideOffset={sideOffset}
          {...props}
        />
      </ChromePortalLayer>
    </DropdownPrimitive.Portal>
  );
});

const DropdownTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Trigger>
>(function DropdownTrigger({ className, ...props }, ref) {
  return <DropdownPrimitive.Trigger ref={ref} className={cx("chrome-dropdown__trigger", className)} {...props} />;
});

const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(function DropdownItem({ className, ...props }, ref) {
  return <DropdownPrimitive.Item ref={ref} className={cx("chrome-dropdown__item", className)} {...props} />;
});

const DropdownLabel = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>
>(function DropdownLabel({ className, ...props }, ref) {
  return <DropdownPrimitive.Label ref={ref} className={cx("chrome-dropdown__label", className)} {...props} />;
});

const DropdownSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(function DropdownSeparator({ className, ...props }, ref) {
  return <DropdownPrimitive.Separator ref={ref} className={cx("chrome-dropdown__separator", className)} {...props} />;
});

const DropdownRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.RadioItem>
>(function DropdownRadioItem({ className, children, ...props }, ref) {
  return (
    <DropdownPrimitive.RadioItem ref={ref} className={cx("chrome-dropdown__item", "chrome-dropdown__radio-item", className)} {...props}>
      <span>{children}</span>
      <DropdownPrimitive.ItemIndicator className="chrome-dropdown__indicator"><CheckIcon /></DropdownPrimitive.ItemIndicator>
    </DropdownPrimitive.RadioItem>
  );
});

export const DropdownMenu = {
  Root: DropdownPrimitive.Root,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  Label: DropdownLabel,
  Separator: DropdownSeparator,
  RadioGroup: DropdownPrimitive.RadioGroup,
  RadioItem: DropdownRadioItem
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showClose?: boolean }
>(function DialogContent({ className, children, showClose = true, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <ChromePortalLayer>
        <DialogPrimitive.Overlay className="chrome-dialog__overlay" />
        <DialogPrimitive.Content ref={ref} className={cx("chrome-dialog__content", className)} {...props}>
          {children}
          {showClose ? (
            <DialogPrimitive.Close className="chrome-dialog__close" aria-label="Close dialog">
              <CloseIcon />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </ChromePortalLayer>
    </DialogPrimitive.Portal>
  );
});

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(function DialogTrigger({ className, ...props }, ref) {
  return <DialogPrimitive.Trigger ref={ref} className={cx("chrome-dialog__trigger", className)} {...props} />;
});

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(function DialogClose({ className, ...props }, ref) {
  return <DialogPrimitive.Close ref={ref} className={cx("chrome-dialog__action", className)} {...props} />;
});

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cx("chrome-dialog__title", className)} {...props} />;
});

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description ref={ref} className={cx("chrome-dialog__description", className)} {...props} />;
});

export const Dialog = {
  Root: DialogPrimitive.Root,
  Trigger: DialogTrigger,
  Portal: DialogPrimitive.Portal,
  Content: DialogContent,
  Close: DialogClose,
  Title: DialogTitle,
  Description: DialogDescription
};

const ToastRoot = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(function ToastRoot({ className, ...props }, ref) {
  return <ToastPrimitive.Root ref={ref} className={cx("chrome-toast", className)} {...props} />;
});

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(function ToastViewport({ className, ...props }, ref) {
  return (
    <ChromePortalLayer>
      <ToastPrimitive.Viewport ref={ref} className={cx("chrome-toast__viewport", className)} {...props} />
    </ChromePortalLayer>
  );
});

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(function ToastTitle({ className, ...props }, ref) {
  return <ToastPrimitive.Title ref={ref} className={cx("chrome-toast__title", className)} {...props} />;
});

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(function ToastDescription({ className, ...props }, ref) {
  return <ToastPrimitive.Description ref={ref} className={cx("chrome-toast__description", className)} {...props} />;
});

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(function ToastAction({ className, ...props }, ref) {
  return <ToastPrimitive.Action ref={ref} className={cx("chrome-toast__action", className)} {...props} />;
});

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(function ToastClose({ className, ...props }, ref) {
  return <ToastPrimitive.Close ref={ref} className={cx("chrome-toast__close", className)} {...props} />;
});

export const Toast = {
  Provider: ToastPrimitive.Provider,
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  Viewport: ToastViewport
};
