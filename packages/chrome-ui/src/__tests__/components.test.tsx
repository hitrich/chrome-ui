import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { createRef, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Checkbox,
  ChromeProvider,
  CodeBlock,
  Dialog,
  Divider,
  DropdownMenu,
  EmptyState,
  FileDropzone,
  IconButton,
  KeyHint,
  Meter,
  Pagination,
  Progress,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Stat,
  StatusIndicator,
  Stepper,
  Surface,
  Switch,
  Table,
  Tabs,
  TextField,
  Timeline,
  Toast,
  ToggleButton,
  Toolbar,
  Tooltip,
  useChrome
} from "../index";

function ThemeProbe() {
  const { theme, setTheme } = useChrome();
  return <button onClick={() => setTheme(theme === "ink" ? "arctic" : "ink")}>{theme}</button>;
}

function MotionProbe() {
  const { motion, setMotion } = useChrome();
  return <button onClick={() => setMotion(motion === "reduced" ? "system" : "reduced")}>{motion}</button>;
}

describe("Chrome public API", () => {
  it("exports all documented components", () => {
    [
      Alert,
      Avatar,
      Badge,
      Breadcrumb,
      Button,
      Checkbox,
      CodeBlock,
      Dialog,
      Divider,
      DropdownMenu,
      EmptyState,
      FileDropzone,
      IconButton,
      KeyHint,
      Meter,
      Pagination,
      Progress,
      RadioGroup,
      SearchField,
      SegmentedControl,
      Select,
      Skeleton,
      Slider,
      Spinner,
      Stat,
      StatusIndicator,
      Stepper,
      Surface,
      Switch,
      Table,
      Tabs,
      TextField,
      Timeline,
      Toast,
      ToggleButton,
      Toolbar,
      Tooltip
    ].forEach((value) => expect(value).toBeTruthy());
  });

  it("supports controlled theme changes", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    const { rerender } = render(<ChromeProvider theme="ink" onThemeChange={onThemeChange}><ThemeProbe /></ChromeProvider>);
    await user.click(screen.getByRole("button", { name: "ink" }));
    expect(onThemeChange).toHaveBeenCalledWith("arctic");
    rerender(<ChromeProvider theme="arctic" onThemeChange={onThemeChange}><ThemeProbe /></ChromeProvider>);
    expect(screen.getByRole("button", { name: "arctic" })).toBeVisible();
  });

  it("owns uncontrolled theme state while reporting changes", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(<ChromeProvider defaultTheme="arctic" onThemeChange={onThemeChange}><ThemeProbe /></ChromeProvider>);
    await user.click(screen.getByRole("button", { name: "arctic" }));
    expect(screen.getByRole("button", { name: "ink" })).toBeVisible();
    expect(onThemeChange).toHaveBeenCalledWith("ink");
  });

  it("exposes explicit full and reduced motion modes on the material root", () => {
    const { container, rerender } = render(<ChromeProvider motion="full"><span>Full motion</span></ChromeProvider>);
    expect(container.firstElementChild).toHaveAttribute("data-chrome-motion", "full");
    rerender(<ChromeProvider motion="reduced"><span>Reduced motion</span></ChromeProvider>);
    expect(container.firstElementChild).toHaveAttribute("data-chrome-motion", "reduced");
  });

  it("owns uncontrolled motion state while reporting changes", async () => {
    const user = userEvent.setup();
    const onMotionChange = vi.fn();
    const { container } = render(<ChromeProvider defaultMotion="reduced" onMotionChange={onMotionChange}><MotionProbe /></ChromeProvider>);
    await user.click(screen.getByRole("button", { name: "reduced" }));
    expect(container.firstElementChild).toHaveAttribute("data-chrome-motion", "system");
    expect(onMotionChange).toHaveBeenCalledWith("system");
  });

  it("applies button variants and native disabled behavior", () => {
    render(<><Button variant="danger" size="lg" disabled>Delete project</Button><Button static>Static action</Button></>);
    const button = screen.getByRole("button", { name: "Delete project" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-variant", "danger");
    expect(button).toHaveAttribute("data-size", "lg");
    expect(screen.getByRole("button", { name: "Static action" })).toHaveAttribute("data-static", "true");
  });

  it("tracks responsive button light without swallowing consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const onDisabledPointerMove = vi.fn();
    render(
      <>
        <Button onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>Responsive light</Button>
        <Button asChild aria-disabled="true" onPointerMove={onDisabledPointerMove}>
          <a href="/unavailable">Unavailable light</a>
        </Button>
      </>
    );
    const button = screen.getByRole("button", { name: "Responsive light" });
    const boundsSpy = vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 200,
      bottom: 100,
      left: 0,
      width: 200,
      height: 100,
      toJSON: () => ({})
    });

    fireEvent.pointerMove(button, { clientX: 150, clientY: 25, pointerType: "mouse" });
    expect(button.style.getPropertyValue("--chrome-light-x")).toBe("75.00%");
    expect(button.style.getPropertyValue("--chrome-light-y")).toBe("25.00%");
    expect(onPointerMove).toHaveBeenCalledOnce();

    fireEvent.pointerMove(button, { clientX: 50, clientY: 75, pointerType: "mouse" });
    expect(button.style.getPropertyValue("--chrome-light-x")).toBe("25.00%");
    expect(button.style.getPropertyValue("--chrome-light-y")).toBe("75.00%");
    expect(onPointerMove).toHaveBeenCalledTimes(2);
    expect(boundsSpy).toHaveBeenCalledOnce();

    fireEvent.pointerLeave(button, { pointerType: "mouse" });
    expect(button.style.getPropertyValue("--chrome-light-x")).toBe("");
    expect(button.style.getPropertyValue("--chrome-light-y")).toBe("");
    expect(onPointerLeave).toHaveBeenCalledOnce();

    const disabledLink = screen.getByRole("link", { name: "Unavailable light" });
    const disabledBoundsSpy = vi.spyOn(disabledLink, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 200,
      bottom: 100,
      left: 0,
      width: 200,
      height: 100,
      toJSON: () => ({})
    });
    fireEvent.pointerMove(disabledLink, { clientX: 100, clientY: 50, pointerType: "mouse" });
    expect(disabledLink.style.getPropertyValue("--chrome-light-x")).toBe("");
    expect(disabledLink.style.getPropertyValue("--chrome-light-y")).toBe("");
    expect(onDisabledPointerMove).toHaveBeenCalledOnce();
    expect(disabledBoundsSpy).not.toHaveBeenCalled();
  });

  it("forwards refs, merges class names, and passes native props on direct controls", async () => {
    const user = userEvent.setup();
    const buttonRef = createRef<HTMLButtonElement>();
    const fieldRef = createRef<HTMLInputElement>();
    const surfaceRef = createRef<HTMLDivElement>();
    const switchRef = createRef<HTMLButtonElement>();
    const sliderRef = createRef<HTMLSpanElement>();
    const anchorRef = createRef<HTMLAnchorElement>();
    const iconAnchorRef = createRef<HTMLAnchorElement>();
    const onClick = vi.fn();
    const onAnchorClick = vi.fn();
    const onIconAnchorClick = vi.fn();

    render(
      <>
        <Button ref={buttonRef} className="consumer-button" data-contract="button" onClick={onClick}>Launch</Button>
        <TextField ref={fieldRef} className="consumer-field" data-contract="field" aria-label="Project" />
        <Surface ref={surfaceRef} className="consumer-surface" title="Material surface" />
        <Switch ref={switchRef} className="consumer-switch" data-contract="switch" aria-label="Motion" />
        <Slider ref={sliderRef} className="consumer-slider" data-contract="slider" aria-label="Gain" defaultValue={[20]} />
        <Button asChild ref={anchorRef} className="consumer-link" data-contract="link">
          <a href="/components" onClick={(event) => { event.preventDefault(); onAnchorClick(); }}>Browse components</a>
        </Button>
        <IconButton asChild ref={iconAnchorRef} className="consumer-icon-link" data-contract="icon-link" aria-label="Open material docs">
          <a href="/foundations" onClick={(event) => { event.preventDefault(); onIconAnchorClick(); }}>i</a>
        </IconButton>
      </>
    );

    await user.click(screen.getByRole("button", { name: "Launch" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(buttonRef.current).toBe(screen.getByRole("button", { name: "Launch" }));
    expect(buttonRef.current).toHaveClass("chrome-button", "consumer-button");
    expect(buttonRef.current).toHaveAttribute("data-contract", "button");
    expect(fieldRef.current).toBe(screen.getByRole("textbox", { name: "Project" }));
    expect(fieldRef.current).toHaveAttribute("data-contract", "field");
    expect(fieldRef.current?.closest(".chrome-field")).toHaveClass("consumer-field");
    expect(surfaceRef.current).toHaveClass("chrome-surface", "consumer-surface");
    expect(surfaceRef.current).toHaveAttribute("title", "Material surface");
    expect(switchRef.current).toHaveClass("chrome-switch", "consumer-switch");
    expect(sliderRef.current).toHaveClass("chrome-slider", "consumer-slider");
    await user.click(screen.getByRole("link", { name: "Browse components" }));
    expect(onAnchorClick).toHaveBeenCalledOnce();
    expect(anchorRef.current).toBe(screen.getByRole("link", { name: "Browse components" }));
    expect(anchorRef.current).toHaveClass("chrome-button", "consumer-link");
    expect(anchorRef.current).toHaveAttribute("href", "/components");
    expect(anchorRef.current).toHaveAttribute("data-contract", "link");
    await user.click(screen.getByRole("link", { name: "Open material docs" }));
    expect(onIconAnchorClick).toHaveBeenCalledOnce();
    expect(iconAnchorRef.current).toBe(screen.getByRole("link", { name: "Open material docs" }));
    expect(iconAnchorRef.current).toHaveClass("chrome-button", "chrome-icon-button", "consumer-icon-link");
    expect(iconAnchorRef.current).toHaveAttribute("href", "/foundations");
    expect(iconAnchorRef.current).toHaveAttribute("data-contract", "icon-link");
  });

  it("connects field labels, hints, and errors", () => {
    const { rerender } = render(<TextField label="Project name" hint="Use a memorable name." />);
    expect(screen.getByLabelText("Project name")).toHaveAccessibleDescription("Use a memorable name.");
    rerender(<TextField label="Project name" error="A project name is required." />);
    expect(screen.getByLabelText("Project name")).toHaveAccessibleDescription("A project name is required.");
    expect(screen.getByLabelText("Project name")).toHaveAttribute("aria-invalid", "true");
  });

  it("updates switch state through pointer interaction", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Responsive light" />);
    const control = screen.getByRole("switch", { name: "Responsive light" });
    expect(control).toHaveAttribute("aria-checked", "false");
    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("keeps structured controls inert and programmatically disabled", async () => {
    const user = userEvent.setup();
    const onCheckboxChange = vi.fn();
    const onRadioChange = vi.fn();
    const onSwitchChange = vi.fn();
    const onSliderChange = vi.fn();
    const onTabChange = vi.fn();

    render(
      <ChromeProvider>
        <Checkbox disabled onCheckedChange={onCheckboxChange}>Unavailable choice</Checkbox>
        <RadioGroup.Root defaultValue="ink" onValueChange={onRadioChange} aria-label="Theme">
          <RadioGroup.Item value="ink">Ink</RadioGroup.Item>
          <RadioGroup.Item value="arctic" disabled>Arctic</RadioGroup.Item>
        </RadioGroup.Root>
        <Switch disabled onCheckedChange={onSwitchChange} aria-label="Unavailable switch" />
        <Slider disabled onValueChange={onSliderChange} defaultValue={[30]} aria-label="Unavailable gain" />
        <Tabs.Root defaultValue="preview" onValueChange={onTabChange}>
          <Tabs.List><Tabs.Trigger value="preview">Preview</Tabs.Trigger><Tabs.Trigger value="code" disabled>Code</Tabs.Trigger></Tabs.List>
          <Tabs.Content value="preview">Preview panel</Tabs.Content><Tabs.Content value="code">Code panel</Tabs.Content>
        </Tabs.Root>
        <Select.Root disabled defaultValue="analog"><Select.Trigger aria-label="Unavailable input"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="analog">Analog 4</Select.Item></Select.Content></Select.Root>
      </ChromeProvider>
    );

    const disabledControls = [
      screen.getByRole("checkbox", { name: "Unavailable choice" }),
      screen.getByRole("radio", { name: "Arctic" }),
      screen.getByRole("switch", { name: "Unavailable switch" }),
      screen.getByRole("slider", { name: "Unavailable gain" }),
      screen.getByRole("tab", { name: "Code" }),
      screen.getByRole("combobox", { name: "Unavailable input" })
    ];
    for (const control of disabledControls) expect(control).toHaveAttribute("data-disabled");
    for (const control of disabledControls) await user.click(control);
    expect(onCheckboxChange).not.toHaveBeenCalled();
    expect(onRadioChange).not.toHaveBeenCalled();
    expect(onSwitchChange).not.toHaveBeenCalled();
    expect(onSliderChange).not.toHaveBeenCalled();
    expect(onTabChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "true");
  });

  it("names slider thumbs and responds to keyboard input", async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="Gain" defaultValue={[30]} />);
    const thumb = screen.getByRole("slider", { name: "Gain" });
    expect(thumb).toHaveAttribute("aria-valuenow", "30");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "31");
  });

  it("keeps tabs connected to panels during keyboard navigation", async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="preview">
        <Tabs.List aria-label="Component view"><Tabs.Trigger value="preview">Preview</Tabs.Trigger><Tabs.Trigger value="code">Code</Tabs.Trigger></Tabs.List>
        <Tabs.Content value="preview">Live component</Tabs.Content><Tabs.Content value="code">Source code</Tabs.Content>
      </Tabs.Root>
    );
    const preview = screen.getByRole("tab", { name: "Preview" });
    preview.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Code" })).toHaveTextContent("Source code");
  });

  it("supports keyboard selection in radio groups", async () => {
    const user = userEvent.setup();
    render(<RadioGroup.Root aria-label="Theme" defaultValue="ink"><RadioGroup.Item value="ink">Ink</RadioGroup.Item><RadioGroup.Item value="arctic">Arctic</RadioGroup.Item></RadioGroup.Root>);
    const arctic = screen.getByRole("radio", { name: "Arctic" });
    arctic.focus();
    await user.keyboard(" ");
    expect(arctic).toHaveAttribute("aria-checked", "true");
  });

  it("opens and selects an option with the keyboard", async () => {
    const user = userEvent.setup();
    const valueRef = createRef<HTMLSpanElement>();
    const onValueChange = vi.fn();
    render(<ChromeProvider><Select.Root defaultValue="analog" onValueChange={onValueChange}><Select.Trigger aria-label="Input source"><Select.Value ref={valueRef} className="consumer-select-value" data-contract="value" /></Select.Trigger><Select.Content><Select.Group><Select.Label>Inputs</Select.Label><Select.Item value="analog">Analog 4</Select.Item><Select.Item value="line" disabled>Line input unavailable</Select.Item><Select.Item value="usb">USB interface</Select.Item></Select.Group><Select.Separator /></Select.Content></Select.Root></ChromeProvider>);
    const trigger = screen.getByRole("combobox", { name: "Input source" });
    expect(valueRef.current).toHaveClass("chrome-select__value", "consumer-select-value");
    expect(valueRef.current).toHaveAttribute("data-contract", "value");
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Inputs")).toHaveClass("chrome-select__label");
    expect(document.querySelector(".chrome-select__separator")).toBeInTheDocument();
    const disabledOption = screen.getByRole("option", { name: "Line input unavailable" });
    expect(disabledOption).toHaveAttribute("data-disabled");
    await user.keyboard("Line");
    expect(disabledOption).not.toHaveAttribute("data-highlighted");
    await user.keyboard("{ArrowDown}");
    expect(disabledOption).not.toHaveAttribute("data-highlighted");
    expect(screen.getByRole("option", { name: "USB interface" })).toHaveAttribute("data-highlighted");
    await user.keyboard("{Enter}");
    expect(trigger).toHaveTextContent("USB interface");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("usb");
    expect(onValueChange).not.toHaveBeenCalledWith("line");
  });

  it("styles dropdown compound parts and supports keyboard radio selection with focus return", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onDisabledSelect = vi.fn();
    const triggerRef = createRef<HTMLButtonElement>();

    function DropdownHarness() {
      const [value, setValue] = useState("recent");
      const handleValueChange = (nextValue: string) => {
        setValue(nextValue);
        onValueChange(nextValue);
      };
      return (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger ref={triggerRef} asChild className="consumer-dropdown-trigger" data-contract="trigger"><Button>Open project menu</Button></DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>Sort order</DropdownMenu.Label>
            <DropdownMenu.RadioGroup value={value} onValueChange={handleValueChange}>
              <DropdownMenu.RadioItem value="recent">Recent</DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="name">Name</DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator />
            <DropdownMenu.Item disabled onSelect={onDisabledSelect}>Delete project</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );
    }

    render(
      <ChromeProvider>
        <DropdownHarness />
      </ChromeProvider>
    );

    const trigger = screen.getByRole("button", { name: "Open project menu" });
    expect(triggerRef.current).toBe(trigger);
    expect(trigger).toHaveClass("chrome-dropdown__trigger", "consumer-dropdown-trigger");
    expect(trigger).toHaveAttribute("data-contract", "trigger");
    await user.click(trigger);
    expect(screen.getByText("Sort order")).toHaveClass("chrome-dropdown__label");
    expect(document.querySelector(".chrome-dropdown__separator")).toBeInTheDocument();
    const disabledItem = screen.getByRole("menuitem", { name: "Delete project" });
    expect(disabledItem).toHaveAttribute("data-disabled");
    await user.click(disabledItem);
    disabledItem.focus();
    await user.keyboard("{Enter}");
    expect(onDisabledSelect).not.toHaveBeenCalled();
    const nameChoice = screen.getByRole("menuitemradio", { name: "Name" });
    expect(nameChoice).toHaveClass("chrome-dropdown__item", "chrome-dropdown__radio-item");
    nameChoice.focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("name");
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    expect(screen.getByRole("menuitemradio", { name: "Name" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("opens a tooltip from keyboard focus and dismisses it with Escape", async () => {
    const user = userEvent.setup();
    const triggerRef = createRef<HTMLButtonElement>();
    render(
      <ChromeProvider>
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root>
            <Tooltip.Trigger ref={triggerRef} asChild className="consumer-tooltip-trigger" data-contract="trigger"><Button>Material help</Button></Tooltip.Trigger>
            <Tooltip.Content className="consumer-tooltip">Reactive chrome</Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      </ChromeProvider>
    );

    const trigger = screen.getByRole("button", { name: "Material help" });
    expect(triggerRef.current).toBe(trigger);
    expect(trigger).toHaveClass("chrome-tooltip__trigger", "consumer-tooltip-trigger");
    await user.tab();
    expect(trigger).toHaveFocus();
    await waitFor(() => expect(document.querySelector(".chrome-tooltip")).toHaveClass("chrome-tooltip", "consumer-tooltip"));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector(".chrome-tooltip")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("merges toast part contracts and reports controlled close state", async () => {
    const user = userEvent.setup();
    const onToastChange = vi.fn();
    const titleRef = createRef<HTMLDivElement>();
    const closeRef = createRef<HTMLButtonElement>();
    render(
      <ChromeProvider>
        <Toast.Provider swipeDirection="up">
          <Toast.Root open onOpenChange={onToastChange} className="consumer-toast">
            <Toast.Title ref={titleRef} className="consumer-toast-title" data-contract="title">Snapshot saved</Toast.Title>
            <Toast.Close ref={closeRef} className="consumer-toast-close" data-contract="close">Dismiss snapshot</Toast.Close>
          </Toast.Root>
          <Toast.Viewport />
        </Toast.Provider>
      </ChromeProvider>
    );

    expect(titleRef.current).toHaveClass("chrome-toast__title", "consumer-toast-title");
    expect(titleRef.current).toHaveAttribute("data-contract", "title");
    expect(closeRef.current).toHaveClass("chrome-toast__close", "consumer-toast-close");
    expect(screen.getByText("Snapshot saved").closest(".chrome-toast")).toHaveClass("consumer-toast");
    expect(screen.getByText("Snapshot saved").closest(".chrome-toast")).toHaveAttribute("data-swipe-direction", "up");
    await user.click(screen.getByRole("button", { name: "Dismiss snapshot" }));
    expect(onToastChange).toHaveBeenCalledWith(false);
  });

  it("traps dialog focus, closes with Escape and pointer, and restores trigger focus", async () => {
    const user = userEvent.setup();
    const triggerRef = createRef<HTMLButtonElement>();
    const titleRef = createRef<HTMLHeadingElement>();
    const descriptionRef = createRef<HTMLParagraphElement>();
    const actionRef = createRef<HTMLButtonElement>();
    render(
      <ChromeProvider>
        <Dialog.Root>
          <Dialog.Trigger ref={triggerRef} asChild className="consumer-dialog-trigger" data-contract="trigger"><Button>Open export</Button></Dialog.Trigger>
          <Dialog.Content><Dialog.Title ref={titleRef} className="consumer-dialog-title">Export package</Dialog.Title><Dialog.Description ref={descriptionRef} className="consumer-dialog-description">Prepare files.</Dialog.Description><Dialog.Close ref={actionRef} className="consumer-dialog-action">Done</Dialog.Close></Dialog.Content>
        </Dialog.Root>
      </ChromeProvider>
    );
    const trigger = screen.getByRole("button", { name: "Open export" });
    expect(triggerRef.current).toBe(trigger);
    expect(trigger).toHaveClass("chrome-dialog__trigger", "consumer-dialog-trigger");
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Export package" });
    expect(dialog).toBeVisible();
    expect(titleRef.current).toHaveClass("chrome-dialog__title", "consumer-dialog-title");
    expect(descriptionRef.current).toHaveClass("chrome-dialog__description", "consumer-dialog-description");
    expect(actionRef.current).toHaveClass("chrome-dialog__action", "consumer-dialog-action");
    within(dialog).getByRole("button", { name: "Close dialog" }).focus();
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Export package" })).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(trigger).toHaveFocus();
  });

  it("updates extended selection, search, pagination, toggle, and stepper controls", async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    const onViewChange = vi.fn();
    const onPageChange = vi.fn();
    const onPressedChange = vi.fn();
    const onStepChange = vi.fn();

    render(
      <ChromeProvider>
        <SearchField label="Search components" defaultValue="Signal" onValueChange={onQueryChange} />
        <SegmentedControl
          aria-label="Component view"
          defaultValue="preview"
          onValueChange={onViewChange}
          items={[{ value: "preview", label: "Preview" }, { value: "code", label: "Code" }]}
        />
        <Pagination page={4} count={12} onPageChange={onPageChange} />
        <ToggleButton onPressedChange={onPressedChange}>Pin view</ToggleButton>
        <Stepper
          activeStep={1}
          onStepChange={onStepChange}
          steps={[{ id: "source", label: "Source" }, { id: "map", label: "Map" }, { id: "review", label: "Review" }]}
        />
      </ChromeProvider>
    );

    expect(screen.getByRole("searchbox", { name: "Search components" })).toHaveValue("Signal");
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByRole("searchbox", { name: "Search components" })).toHaveValue("");
    expect(onQueryChange).toHaveBeenLastCalledWith("");

    await user.click(screen.getByRole("button", { name: "Code" }));
    expect(screen.getByRole("button", { name: "Code" })).toHaveAttribute("aria-pressed", "true");
    expect(onViewChange).toHaveBeenCalledWith("code");

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(5);
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "Pin view" }));
    expect(screen.getByRole("button", { name: "Pin view" })).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole("button", { name: "Review" }));
    expect(onStepChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("button", { name: "Map" })).toHaveAttribute("aria-current", "step");
  });

  it("moves focus through toolbar controls with directional keys", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Toolbar label="Editing tools">
          <button type="button">Cut</button>
          <button type="button">Copy</button>
          <button type="button">Paste</button>
        </Toolbar>
        <button type="button">After toolbar</button>
      </>
    );

    const cut = screen.getByRole("button", { name: "Cut" });
    const copy = screen.getByRole("button", { name: "Copy" });
    const paste = screen.getByRole("button", { name: "Paste" });
    await waitFor(() => {
      expect(cut).toHaveAttribute("tabindex", "0");
      expect(copy).toHaveAttribute("tabindex", "-1");
      expect(paste).toHaveAttribute("tabindex", "-1");
    });
    cut.focus();
    await user.keyboard("{ArrowRight}");
    expect(copy).toHaveFocus();
    expect(copy).toHaveAttribute("tabindex", "0");
    expect(cut).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(screen.getByRole("button", { name: "After toolbar" })).toHaveFocus();
    copy.focus();
    await user.keyboard("{End}");
    expect(paste).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(cut).toHaveFocus();
  });

  it("reports selected files and explicit code copy completion", async () => {
    const user = userEvent.setup();
    const onFiles = vi.fn();
    const onCopy = vi.fn();
    const { container } = render(
      <>
        <FileDropzone label="Upload component source" accept=".tsx" onFiles={onFiles} />
        <CodeBlock code="<Button>Build</Button>" onCopy={onCopy} />
      </>
    );
    const file = new File(["export {}"], "component.tsx", { type: "text/typescript" });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    await user.upload(input!, file);
    expect(onFiles).toHaveBeenCalledWith([file]);

    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(onCopy).toHaveBeenCalledWith("<Button>Build</Button>");
    expect(screen.getByRole("button", { name: "Code copied" })).toBeVisible();
  });

  it("renders extended data-display components with native semantics", () => {
    render(
      <ChromeProvider>
        <Alert title="Build ready">No warnings.</Alert>
        <Breadcrumb items={[{ label: "Components", href: "/components" }, { label: "Alert" }]} />
        <Meter label="Coverage" value={92} />
        <Spinner label="Loading report" />
        <StatusIndicator tone="success" label="Operational" />
        <Table aria-label="Builds"><tbody><tr><td>Alert</td></tr></tbody></Table>
        <Timeline items={[{ id: "ready", title: "Build ready", meta: "Now" }]} />
      </ChromeProvider>
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    expect(screen.getByRole("meter", { name: "Coverage" })).toHaveAttribute("aria-valuenow", "92");
    expect(screen.getByRole("status", { name: "Loading report" })).toBeVisible();
    expect(screen.getByRole("table", { name: "Builds" })).toBeVisible();
    expect(screen.getAllByText("Build ready")).toHaveLength(2);
  });

  it.each(["ink", "arctic"] as const)("has no detectable structural accessibility violations in %s theme", async (theme) => {
    const { container } = render(
      <ChromeProvider theme={theme}>
        <main>
          <h1>Chrome sample</h1>
          <TextField label="Email" type="email" />
          <Checkbox defaultChecked>Include styles</Checkbox>
          <Button>Continue</Button>
          <Progress value={68} aria-label="Build progress" />
        </main>
      </ChromeProvider>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
