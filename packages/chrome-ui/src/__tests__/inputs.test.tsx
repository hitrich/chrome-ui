import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import {
  Button,
  ButtonGroup,
  Calendar,
  Chip,
  ChromeProvider,
  ColorPicker,
  Combobox,
  DatePicker,
  InputOTP,
  NumberField,
  TagInput,
  Textarea
} from "../index";

const nov = (day: number) => new Date(2026, 10, day);

function renderInChrome(ui: ReactNode) {
  return render(
    <ChromeProvider theme="satin">
      <main>
        <h1>Inputs</h1>
        {ui}
      </main>
    </ChromeProvider>
  );
}

async function expectNoAxeViolations() {
  // popups portal outside <main>; "region" (a best-practice rule) does not apply to them
  const results = await axe(document.body, { rules: { region: { enabled: false } } });
  expect(results.violations).toEqual([]);
}

describe("ButtonGroup", () => {
  it("groups joined and split buttons", async () => {
    renderInChrome(
      <>
        <ButtonGroup aria-label="Run actions">
          <Button size="sm">Rerun</Button>
          <Button size="sm">Logs</Button>
        </ButtonGroup>
        <ButtonGroup variant="split" aria-label="Promote">
          <Button size="sm" finish="polished">Promote</Button>
          <Button size="sm" finish="polished" aria-label="Choose region">v</Button>
        </ButtonGroup>
      </>
    );
    expect(screen.getByRole("group", { name: "Run actions" })).toHaveAttribute("data-variant", "attached");
    expect(screen.getByRole("group", { name: "Promote" })).toHaveAttribute("data-variant", "split");
    await expectNoAxeViolations();
  });
});

describe("Chip", () => {
  it("toggles a filter and removes an entity", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onSelectedChange = vi.fn();
    renderInChrome(
      <>
        <Chip defaultSelected onSelectedChange={onSelectedChange}>Failed</Chip>
        <Chip onRemove={onRemove}>Priya Raman</Chip>
        <Chip variant="dashed">Add filter</Chip>
      </>
    );
    const failed = screen.getByRole("button", { name: "Failed" });
    expect(failed).toHaveAttribute("aria-pressed", "true");
    await user.click(failed);
    expect(failed).toHaveAttribute("aria-pressed", "false");
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: "Add filter" })).not.toHaveAttribute("aria-pressed");
    await user.click(screen.getByRole("button", { name: "Remove Priya Raman" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations();
  });
});

describe("Textarea", () => {
  it("counts characters and reports changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInChrome(<Textarea label="Rollback note" hint="Shown in the deploy log" maxLength={280} defaultValue="Revert" onValueChange={onValueChange} />);
    const field = screen.getByLabelText("Rollback note");
    expect(screen.getByText("6 / 280")).toBeInTheDocument();
    await user.type(field, "ing");
    expect(onValueChange).toHaveBeenLastCalledWith("Reverting");
    expect(screen.getByText("9 / 280")).toBeInTheDocument();
    expect(field.getAttribute("aria-describedby")).toContain(screen.getByText("9 / 280").id);
    await expectNoAxeViolations();
  });
});

describe("NumberField", () => {
  it("steps, clamps and commits typed values", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInChrome(<NumberField label="Replicas per region" defaultValue={6} min={2} max={12} hint="Between 2 and 12" onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton", { name: "Replicas per region" });
    expect(input).toHaveAttribute("aria-valuenow", "6");
    expect(input).toHaveAttribute("aria-valuemin", "2");
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveAttribute("aria-valuenow", "7");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveValue("5");
    await user.keyboard("{End}");
    expect(input).toHaveValue("12");
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(input).toHaveValue("11");
    await user.clear(input);
    await user.type(input, "40");
    await user.tab();
    expect(input).toHaveValue("12");
    expect(onValueChange).toHaveBeenLastCalledWith(12);
    await expectNoAxeViolations();
  });
});

describe("InputOTP", () => {
  it("advances, deletes back and fills every cell from a paste", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderInChrome(<InputOTP label="Verification code" onComplete={onComplete} />);
    const group = screen.getByRole("group", { name: "Verification code" });
    const cells = within(group).getAllByRole("textbox");
    expect(cells).toHaveLength(6);
    await user.click(cells[0]!);
    await user.keyboard("41");
    expect(cells[0]).toHaveValue("4");
    expect(cells[1]).toHaveValue("1");
    expect(cells[2]).toHaveFocus();
    await user.keyboard("x");
    expect(cells[2]).toHaveValue("");
    await user.keyboard("{Backspace}");
    expect(cells[1]).toHaveFocus();
    expect(cells[1]).toHaveValue("");
    fireEvent.paste(cells[1]!, { clipboardData: { getData: () => "418 392" } });
    expect(cells.map((cell) => (cell as HTMLInputElement).value).join("")).toBe("418392");
    expect(onComplete).toHaveBeenCalledWith("418392");
    await expectNoAxeViolations();
  });

  it("sends focus to the first empty cell", async () => {
    const user = userEvent.setup();
    renderInChrome(<InputOTP aria-label="Code" defaultValue="41" />);
    const cells = screen.getAllByRole("textbox");
    await user.click(cells[5]!);
    expect(cells[2]).toHaveFocus();
  });
});

describe("TagInput", () => {
  it("adds with Enter and comma, removes with Backspace and buttons", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInChrome(<TagInput label="Regions" defaultValue={["eu-west-1"]} hint="Press Enter to add a region" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Regions");
    await user.type(input, "us-east-2{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["eu-west-1", "us-east-2"]);
    expect(input).toHaveValue("");
    await user.type(input, "ap-south-1,eu-west-1,");
    expect(onValueChange).toHaveBeenLastCalledWith(["eu-west-1", "us-east-2", "ap-south-1"]);
    await user.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith(["eu-west-1", "us-east-2"]);
    await user.click(screen.getByRole("button", { name: "Remove eu-west-1" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["us-east-2"]);
    expect(input).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("eu-west-1 removed");
    await expectNoAxeViolations();
  });
});

describe("ColorPicker", () => {
  it("validates hex input and moves with the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInChrome(<ColorPicker defaultValue="#1447E6" onValueChange={onValueChange} />);
    const hex = screen.getByRole("textbox", { name: "Hex color" });
    expect(hex).toHaveValue("#1447E6");
    await user.clear(hex);
    await user.type(hex, "#12zz");
    expect(hex).toHaveAttribute("aria-invalid", "true");
    await user.tab();
    expect(hex).toHaveValue("#1447E6");
    expect(onValueChange).not.toHaveBeenCalled();
    await user.clear(hex);
    await user.type(hex, "d42e1f{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("#D42E1F");
    expect(screen.getByRole("button", { name: "#D42E1F" })).toHaveAttribute("aria-pressed", "true");
    const hue = screen.getByRole("slider", { name: "Hue" });
    hue.focus();
    await user.keyboard("{Home}");
    expect(hue).toHaveAttribute("aria-valuenow", "0");
    const area = screen.getByRole("slider", { name: "Saturation and brightness" });
    area.focus();
    await user.keyboard("{ArrowLeft}");
    expect(area.getAttribute("aria-valuetext")).toMatch(/^Saturation \d+%, brightness \d+%$/);
    await user.click(screen.getByRole("button", { name: "#1447E6" }));
    expect(onValueChange).toHaveBeenLastCalledWith("#1447E6");
    await expectNoAxeViolations();
  });
});

describe("Calendar", () => {
  it("moves through the grid with the keyboard and selects a day", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInChrome(<Calendar defaultMonth={nov(1)} defaultValue={nov(17)} today={nov(18)} onValueChange={onValueChange} />);
    const grid = screen.getByRole("grid", { name: "November 2026" });
    const selected = within(grid).getByRole("button", { name: "Tuesday, November 17, 2026" });
    expect(selected.closest("td")).toHaveAttribute("aria-selected", "true");
    expect(selected).toHaveAttribute("tabindex", "0");
    expect(within(grid).getByRole("button", { name: "Wednesday, November 18, 2026" })).toHaveAttribute("aria-current", "date");
    selected.focus();
    await user.keyboard("{ArrowRight}{ArrowDown}");
    expect(within(grid).getByRole("button", { name: "Wednesday, November 25, 2026" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(within(grid).getByRole("button", { name: "Sunday, November 22, 2026" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(within(grid).getByRole("button", { name: "Saturday, November 28, 2026" })).toHaveFocus();
    await user.keyboard("{PageDown}");
    expect(screen.getByRole("grid", { name: "December 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Monday, December 28, 2026" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 11, 28));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it("selects a range in two clicks", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInChrome(<Calendar mode="range" defaultMonth={nov(1)} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Friday, November 20, 2026" }));
    await user.click(screen.getByRole("button", { name: "Monday, November 16, 2026" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: nov(16), to: nov(20) });
    expect(screen.getByRole("button", { name: "Wednesday, November 18, 2026" }).closest("td")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "Saturday, November 21, 2026" }).closest("td")).toHaveAttribute("aria-selected", "false");
  });
});

describe("DatePicker", () => {
  it("opens a calendar dialog, picks a date and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInChrome(<DatePicker label="Deploy date" defaultMonth={nov(1)} onValueChange={onValueChange} name="deploy" />);
    const trigger = screen.getByRole("button", { name: /Deploy date/ });
    expect(trigger).toHaveTextContent("Pick a date");
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Choose a date" });
    expect(within(dialog).getByRole("grid", { name: "November 2026" })).toBeInTheDocument();
    await expectNoAxeViolations();
    await user.click(within(dialog).getByRole("button", { name: "Tuesday, November 17, 2026" }));
    expect(onValueChange).toHaveBeenCalledWith(nov(17));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent("Nov 17, 2026");
    expect(document.querySelector('input[name="deploy"]')).toHaveValue("2026-11-17");
  });
});

describe("Combobox", () => {
  const options = ["Rafael Achebe", "Priya Raman", "Mara Lindqvist", "Kwame Mensah"].map((label) => ({ value: label.split(" ")[0]!.toLowerCase(), label }));

  it("filters as you type and picks with the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInChrome(<Combobox label="Assignee" options={options} onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Assignee" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.type(input, "ra");
    const listbox = screen.getByRole("listbox");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(within(listbox).getAllByRole("option").map((o) => o.textContent)).toEqual(["Rafael Achebe", "Priya Raman", "Mara Lindqvist"]);
    expect(input.getAttribute("aria-activedescendant")).toBe(within(listbox).getAllByRole("option")[0]!.id);
    await expectNoAxeViolations();
    await user.keyboard("{ArrowDown}");
    const second = within(listbox).getByRole("option", { name: "Priya Raman" });
    expect(input).toHaveAttribute("aria-activedescendant", second.id);
    expect(second).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("priya");
    expect(input).toHaveValue("Priya Raman");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape, restores the selection and clears on a second Escape", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderInChrome(<Combobox aria-label="Assignee" options={options} defaultValue="mara" onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Assignee" });
    expect(input).toHaveValue("Mara Lindqvist");
    await user.clear(input);
    await user.type(input, "zz");
    expect(screen.getByRole("option", { name: "No matches" })).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("Mara Lindqvist");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });
});
