import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Avatar,
  Button,
  ButtonGroup,
  Calendar,
  Chip,
  ChromeProvider,
  ColorPicker,
  Combobox,
  DatePicker,
  IconButton,
  InputOTP,
  NumberField,
  TagInput,
  Textarea,
  type ComboboxOption
} from "@loreanai/chrome-ui";

// Dev sheet for the ten input components: every state the design shows, in a Satin and an Ink island.

function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const icons = {
  rerun: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  more: "M4 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0M11 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0M18 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0",
  chevron: "m6 9 6 6 6-6",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  plus: "M12 5v14M5 12h14",
  filter: "M3 5h18l-7 8v6l-4 2v-8Z",
  file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5"
};

const people = ["Rafael Achebe", "Priya Raman", "Mara Lindqvist", "Kwame Mensah", "Hana Sato", "Tomás Ilić"];
const personOptions: ComboboxOption[] = people.map((name) => ({
  value: name.toLowerCase().replace(/\s+/g, "-"),
  label: name,
  icon: <Avatar name={name} size="sm" />
}));

const nov = (day: number) => new Date(2026, 10, day);

function Tile({ title, children, stage }: { title: string; children: ReactNode; stage?: CSSProperties }) {
  return (
    <article className="tile">
      <div className="stage" style={stage}>{children}</div>
      <h3>{title}</h3>
    </article>
  );
}

function ChipRow() {
  const [people, setPeople] = useState(["Priya Raman"]);
  return (
    <div className="row wrap" style={{ justifyContent: "center", gap: "8px 6px" }}>
      <Chip defaultSelected>Failed</Chip>
      <Chip defaultSelected={false}>Rolling</Chip>
      <Chip defaultSelected={false}>Live</Chip>
      {people.map((name) => (
        <Chip key={name} avatar={<Avatar name={name} size="sm" />} onRemove={() => setPeople((list) => list.filter((n) => n !== name))}>
          {name}
        </Chip>
      ))}
      <Chip variant="dashed" icon={<Icon d={icons.plus} size={12} />}>Add filter</Chip>
    </div>
  );
}

function Board() {
  const [attachments, setAttachments] = useState(["incident-418.log"]);
  return (
    <div className="board">
      <Tile title="Combobox" stage={{ alignItems: "flex-start", paddingTop: 28 }}>
        <Combobox
          aria-label="Assignee"
          icon={<Icon d={icons.person} />}
          options={personOptions}
          defaultInputValue="ra"
          defaultOpen
          style={{ width: "100%" }}
        />
      </Tile>
      <Tile title="Date Picker" stage={{ alignItems: "flex-start", paddingTop: 14, minHeight: 250 }}>
        <DatePicker
          aria-label="Rollout window"
          mode="range"
          defaultValue={{ from: nov(16), to: nov(20) }}
          defaultOpen
          style={{ width: 196 }}
        />
      </Tile>
      <Tile title="Button Group">
        <div className="col" style={{ alignItems: "center", gap: 12 }}>
          <ButtonGroup aria-label="Run actions">
            <Button size="sm" leadingIcon={<Icon d={icons.rerun} />}>Rerun</Button>
            <Button size="sm">Logs</Button>
            <IconButton size="sm" aria-label="More actions"><Icon d={icons.more} /></IconButton>
          </ButtonGroup>
          <ButtonGroup variant="split" aria-label="Promote">
            <Button size="sm" finish="polished">Promote to eu-west-1</Button>
            <IconButton size="sm" finish="polished" aria-label="Choose region"><Icon d={icons.chevron} /></IconButton>
          </ButtonGroup>
        </div>
      </Tile>
      <Tile title="Color Picker">
        <ColorPicker defaultValue="#1447E6" />
      </Tile>
      <Tile title="Input OTP">
        <InputOTP
          label="Verification code"
          defaultValue="418"
          style={{ alignItems: "center", gap: 8 }}
          hint={<>Expires in 4:52 · <button type="button" className="link-button">Resend</button></>}
        />
      </Tile>
      <Tile title="Number Field">
        <NumberField label="Replicas per region" defaultValue={6} min={2} max={12} hint="Between 2 and 12" style={{ width: 180 }} />
      </Tile>
      <Tile title="Tag Input">
        <TagInput label="Regions" defaultValue={["eu-west-1", "us-east-2"]} hint="Press Enter to add a region" style={{ width: "100%" }} />
      </Tile>
      <Tile title="Textarea">
        <Textarea
          label="Rollback note"
          defaultValue={"Reverting v4.18.0: p95 hit 380 ms in ap-south-1 after the cache change."}
          maxLength={280}
          hint="Shown in the deploy log"
          style={{ width: "100%" }}
        />
      </Tile>
      <Tile title="Calendar" stage={{ padding: 8 }}>
        <Calendar
          aria-label="Release calendar"
          size="sm"
          defaultMonth={nov(1)}
          defaultValue={nov(17)}
          isDateMarked={(d) => d.getDay() === 2}
          markedLabel="release train"
          legend="Release train, every Tuesday"
        />
      </Tile>
      <Tile title="Chip">
        <ChipRow />
      </Tile>

      <Tile title="Chips in blocks" stage={{ flexDirection: "column", gap: 12 }}>
        <div className="row wrap" style={{ justifyContent: "center" }}>
          <Chip size="sm" icon={<Icon d={icons.filter} size={12} />}>Version: v4.x</Chip>
          {attachments.map((name) => (
            <Chip key={name} size="sm" icon={<Icon d={icons.file} size={12} />} onRemove={() => setAttachments([])} removeLabel={`Remove ${name}`}>
              <span className="mono">{name}</span>
            </Chip>
          ))}
        </div>
      </Tile>
      <Tile title="Color Picker, alpha">
        <ColorPicker alpha defaultValue="#0F8A5FB3" aria-label="Lamp color" />
      </Tile>
      <Tile title="Date Picker fields" stage={{ flexDirection: "column", gap: 12 }}>
        <DatePicker label="Deploy date" defaultValue={nov(17)} defaultMonth={nov(1)} min={nov(2)} style={{ width: "100%" }} />
        <DatePicker label="Freeze window" mode="range" hint="Pick a start and an end" style={{ width: "100%" }} />
      </Tile>
      <Tile title="Composer (Agent console)" stage={{ alignItems: "stretch", flexDirection: "column", justifyContent: "center" }}>
        <Textarea aria-label="Message to ops-agent" size="lg" rows={2} resize="none" placeholder="Ask a follow-up, or type / for commands" />
      </Tile>
      <Tile title="States" stage={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
        <NumberField label="p95 threshold" defaultValue={300} min={100} max={1000} step={50} unit="ms" />
        <InputOTP aria-label="Recovery code" length={4} defaultValue="72" error="That code has expired" />
      </Tile>
      <Tile title="Combobox, selected" stage={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
        <Combobox label="Owner" icon={<Icon d={icons.person} />} options={personOptions} defaultValue="hana-sato" />
        <TagInput label="Reviewers" mono={false} defaultValue={["Priya", "Kwame"]} placeholder="Add a reviewer" disabled />
      </Tile>
    </div>
  );
}

const css = `
.pg-inputs{min-height:100vh;padding:32px 24px 64px;background:var(--chrome-bg);color:var(--chrome-text)}
.pg-inputs h1{margin:0 0 20px;font:500 22px/28px var(--chrome-font-sans)}
.pg-inputs .islands{display:flex;flex-wrap:wrap;gap:24px;justify-content:center;align-items:flex-start}
.pg-inputs .island{padding:20px;border-radius:28px;background:var(--chrome-bg);max-width:100%}
.pg-inputs .island h2{margin:0 0 14px;font:500 12px/16px var(--chrome-font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--chrome-text-3)}
.pg-inputs .board{display:grid;grid-template-columns:repeat(2,254px);gap:16px}
@media (max-width:640px){.pg-inputs .board{grid-template-columns:minmax(0,254px)}}
.pg-inputs .tile{display:flex;flex-direction:column;border-radius:24px;background:var(--chrome-surface);box-shadow:inset 0 0 0 1px var(--chrome-line)}
.pg-inputs .island[data-chrome-theme="satin"] .tile{border:0;background:linear-gradient(180deg,#e4e5e5,#dcdddd);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),inset 0 0 0 1px rgba(255,255,255,.35),0 1px 2px rgba(0,0,0,.05)}
.pg-inputs .stage{position:relative;min-height:192px;margin:6px 6px 0;padding:16px;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--chrome-well);box-shadow:var(--chrome-well-shadow)}
.pg-inputs .tile h3{margin:0;padding:12px 16px 14px;font:500 15px/22px var(--chrome-font-sans)}
.pg-inputs .row{display:flex;align-items:center;gap:8px}
.pg-inputs .wrap{flex-wrap:wrap}
.pg-inputs .col{display:flex;flex-direction:column}
.pg-inputs .mono{font-family:var(--chrome-font-mono);font-size:11.5px}
.pg-inputs .link-button{padding:0;border:0;background:none;color:var(--chrome-cobalt-text);font:inherit;cursor:pointer}
`;

export default function Page() {
  return (
    <main className="pg-inputs">
      <style>{css}</style>
      <h1>Inputs sheet</h1>
      <div className="islands">
        <ChromeProvider theme="satin" className="island">
          <h2>Satin</h2>
          <Board />
        </ChromeProvider>
        <ChromeProvider theme="ink" className="island">
          <h2>Ink</h2>
          <Board />
        </ChromeProvider>
      </div>
    </main>
  );
}
