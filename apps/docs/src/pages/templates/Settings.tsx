import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DropdownMenu,
  IconButton,
  Popover,
  SegmentedControl,
  Select,
  StatusIndicator,
  Switch,
  Table,
  TagInput,
  TextField
} from "@loreanai/chrome-ui";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AppShell, type AppNavItem } from "../../components/AppShell";
import { Icon } from "../../components/Icon";
import { D2Icon, Pill } from "./d2-shared";
import "./Settings.css";

const NB = " ";
const online = <StatusIndicator tone="success" pulse />;

const nav: AppNavItem[] = [
  { label: "Home", icon: "home", to: "/templates/dashboard" },
  { label: "Deployments", icon: "layers", to: "/templates/control-room", badge: { value: 48 } },
  { label: "Incidents", icon: "alert", to: "/templates/control-room", badge: { value: 3, tone: "danger" } },
  { label: "Agents", icon: "cpu", to: "/templates/agent-console", meta: online },
  { label: "Analytics", icon: "chart", to: "/templates/analytics" },
  { label: "On-call", icon: "calendar", to: "/templates/control-room#cr-oncall" }
];

const regions = [
  { value: "eu-west-1", place: "Ireland" },
  { value: "eu-central-1", place: "Frankfurt" },
  { value: "us-east-2", place: "Ohio" },
  { value: "us-west-1", place: "N. California" },
  { value: "ap-south-1", place: "Mumbai" }
];
const zones = [
  { value: "Europe/Stockholm", offset: "UTC+01:00" },
  { value: "Europe/London", offset: "UTC+00:00" },
  { value: "America/New_York", offset: "UTC−05:00" },
  { value: "Asia/Kolkata", offset: "UTC+05:30" }
];

type Role = "Owner" | "Admin" | "Member" | "Billing" | "Viewer";
interface Member {
  name: string;
  email: string;
  role: Role;
  active: string;
  invite?: string;
}
const initialMembers: Member[] = [
  { name: "Mara Lindqvist", email: "mara@orbitalops.example", role: "Owner", active: "Now" },
  { name: "Rafael Achebe", email: "rafael@orbitalops.example", role: "Admin", active: `2${NB}min ago` },
  { name: "Priya Raman", email: "priya@orbitalops.example", role: "Admin", active: `12${NB}min ago` },
  { name: "Kwame Mensah", email: "kwame@orbitalops.example", role: "Member", active: `5${NB}min ago` },
  { name: "Tomás Ilić", email: "tomas@orbitalops.example", role: "Billing", active: "Yesterday" },
  { name: "Hana Sato", email: "hana@orbitalops.example", role: "Viewer", active: `3${NB}days ago` },
  { name: "jun.okafor@orbitalops.example", email: "jun.okafor@orbitalops.example", role: "Member", active: "—", invite: `Sent by Priya Raman · expires in 5${NB}days` }
];
const roles: Role[] = ["Admin", "Member", "Billing", "Viewer"];

interface ApiKey {
  name: string;
  by: string;
  key: string;
  scopes: string[];
  used: string;
  stale?: boolean;
}
const initialKeys: ApiKey[] = [
  { name: "ops-agent", by: "Mara Lindqvist · 14 Jun", key: "c21e", scopes: ["agents:run", "incidents:write"], used: `1${NB}min ago` },
  { name: "ci-deploy", by: "Priya Raman · 2 Sep", key: "3f9a", scopes: ["deploy:write"], used: `12${NB}min ago` },
  { name: "metrics-export", by: "Rafael Achebe · 30 Jul", key: "8d04", scopes: ["metrics:read"], used: `3${NB}h ago` },
  { name: "legacy-billing-sync", by: "Tomás Ilić · 11 Jan", key: "0b77", scopes: ["billing:read"], used: `94${NB}days ago`, stale: true }
];

const notifications = [
  { id: "incidents", title: "Incident pages", text: "SEV-1 and SEV-2, by push and SMS while you’re on call", on: true },
  { id: "approvals", title: "Approval requests", text: "When a deploy or an agent needs your sign-off", on: true },
  { id: "failures", title: "Agent run failures", text: "Runs you started that fail or time out", on: true },
  { id: "digest", title: "Weekly usage digest", text: "Mondays at 09:00, by email", on: false },
  { id: "product", title: "Product updates", text: "New features, about once a month", on: false }
];

const sections = [
  { id: "general", label: "General" },
  { id: "members", label: "Members" },
  { id: "billing", label: "Billing" },
  { id: "api-keys", label: "API keys" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "danger", label: "Danger zone" }
];

interface Profile {
  name: string;
  slug: string;
  region: string;
  zone: string;
  mark: string | null;
}
const savedProfile: Profile = { name: "Orbital Ops", slug: "orbital-ops", region: "eu-west-1", zone: "Europe/Stockholm", mark: "default" };

function Line({ title, text, children, id }: { title: string; text: ReactNode; children: ReactNode; id?: string }) {
  return (
    <div className="st-ln">
      <span className="st-lt">
        <span id={id}>{title}</span>
        <span>{text}</span>
      </span>
      {children}
    </div>
  );
}

function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]!);
  useEffect(() => {
    const seen = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => seen.set(entry.target.id, entry.isIntersecting));
        const first = ids.find((id) => seen.get(id));
        if (first) setActive(first);
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return [active, setActive] as const;
}

const sectionIds = sections.map((s) => s.id);

export default function Page() {
  const [active, setActive] = useScrollSpy(sectionIds);
  const [baseline, setBaseline] = useState(savedProfile);
  const [profile, setProfile] = useState(savedProfile);
  const [changedBy, setChangedBy] = useState("Priya Raman on 3 Nov");
  const [members, setMembers] = useState(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteError, setInviteError] = useState<string | undefined>();
  const [keys, setKeys] = useState(initialKeys);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState({ name: "", scopes: [] as string[] });
  const [copied, setCopied] = useState<string | null>(null);
  const [notify, setNotify] = useState(() => Object.fromEntries(notifications.map((n) => [n.id, n.on])) as Record<string, boolean>);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sso, setSso] = useState(true);
  const [session, setSession] = useState("12h");
  const [ranges, setRanges] = useState(["203.0.113.0/24", "198.51.100.0/24", "192.0.2.0/24"]);
  const [transfer, setTransfer] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [status, setStatus] = useState("");
  const inviteRef = useRef<HTMLInputElement>(null);
  const markInput = useRef<HTMLInputElement>(null);

  const slugOk = /^[a-z0-9][a-z0-9-]*$/.test(profile.slug);
  const dirty = (Object.keys(profile) as (keyof Profile)[]).some((key) => profile[key] !== baseline[key]);
  const people = members.filter((m) => !m.invite);
  const pending = members.length - people.length;
  const seats = members.length;
  const admins = people.filter((m) => m.role === "Admin");
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((p) => ({ ...p, [key]: value }));
  const say = (text: string) => setStatus(text);

  const invite = (event: FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setInviteError("Enter an email address, like name@orbitalops.example.");
    if (members.some((m) => m.email === email)) return setInviteError(`${email} is already in this workspace.`);
    if (seats >= 10) return setInviteError("All 10 seats are in use. Free a seat or compare plans.");
    setMembers((list) => [...list, { name: email, email, role: inviteRole as Role, active: "—", invite: `Sent by Mara Lindqvist · expires in 7${NB}days` }]);
    setInviteEmail("");
    setInviteError(undefined);
    say(`Invite sent to ${email}.`);
  };

  const copyKey = (name: string, key: string) => {
    void navigator.clipboard?.writeText(`oo_live_${key}`).catch(() => undefined);
    setCopied(name);
    say(`Key ID for ${name} copied.`);
    window.setTimeout(() => setCopied((c) => (c === name ? null : c)), 1600);
  };

  const exportCsv = () => {
    const rows = [["Name", "Email", "Role", "Last active"], ...members.map((m) => [m.invite ? "" : m.name, m.email, m.role, m.invite ? "Invited" : m.active.replace(NB, " ")])];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "orbital-ops-members.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      className="pg-settings"
      workspace={{ name: "Orbital Ops", sub: "Production" }}
      nav={nav}
      card={
        <>
          <span className="small st-cardline">
            <span className="t2">Agent minutes</span>
            <span className="num">77%</span>
          </span>
          <Pill parts={[[76.8, "amber"]]} label="Agent minutes used" />
          <span className="small t3 num">38,420 of 50,000 used</span>
        </>
      }
      footer={[{ label: "Settings", icon: "sliders", to: "/templates/settings", active: true }]}
      search={{ label: "Search settings, members and keys", placeholder: "Search settings, members, keys" }}
      actions={
        <>
          <IconButton finish="ghost" aria-label="Notifications, 4 unread">
            <Icon name="bell" />
          </IconButton>
          <Button
            finish="polished"
            leadingIcon={<Icon name="plus" style={{ strokeWidth: 2 }} />}
            onClick={() => {
              document.getElementById("members")?.scrollIntoView({ block: "start" });
              inviteRef.current?.focus({ preventScroll: true });
            }}
          >
            Invite people
          </Button>
        </>
      }
      user={{ name: "Mara Lindqvist" }}
    >
      <div className="st-title">
        <h1 className="st-h1">Settings</h1>
        <span className="small t3">Orbital Ops workspace · changes here apply to all {people.length} members</span>
      </div>

      <div className="st-layout">
        <nav className="st-nav" aria-label="Settings sections">
          {sections.map((section) => (
            <div key={section.id} className="st-nav-wrap">
              {section.id === "danger" ? <div className="divider st-nav-div" /> : null}
              <a
                className={active === section.id ? "nav-item active" : "nav-item"}
                href={`#${section.id}`}
                aria-current={active === section.id ? "true" : undefined}
                data-danger={section.id === "danger" || undefined}
                onClick={() => setActive(section.id)}
              >
                <span className="st-f1">{section.label}</span>
                {section.id === "members" ? <Badge className="num">{people.length}</Badge> : null}
                {section.id === "api-keys" ? <Badge className="num">{keys.length}</Badge> : null}
              </a>
            </div>
          ))}
        </nav>

        <div className="st-content">
          <section className="card card-lit st-sec" id="general" aria-labelledby="st-general">
            <div className="st-sh">
              <div>
                <h2 className="h3 st-h2" id="st-general">
                  Workspace profile
                </h2>
                <p>Shown to members, on invites and in the CLI.</p>
              </div>
            </div>
            <div className="st-fg">
              <TextField
                label="Workspace name"
                hint="Up to 48 characters."
                value={profile.name}
                maxLength={48}
                error={profile.name.trim() ? undefined : "A workspace needs a name."}
                onChange={(e) => set("name", e.currentTarget.value)}
              />
              <div className="st-fl">
                {/* the hint carries a mono command, so it sits outside the field (TextField hints are plain strings) */}
                <TextField
                  className="st-slug"
                  label="URL slug"
                  leading="app/"
                  value={profile.slug}
                  spellCheck={false}
                  autoCapitalize="none"
                  error={slugOk ? undefined : "Use lowercase letters, numbers and dashes."}
                  {...(slugOk ? { "aria-describedby": "st-slug-hint" } : null)}
                  onChange={(e) => set("slug", e.currentTarget.value.toLowerCase())}
                />
                {slugOk ? (
                  <span className="hint" id="st-slug-hint">
                    Sign in from the CLI with <span className="mono">ops login {profile.slug}</span>.
                  </span>
                ) : null}
              </div>
              <div className="st-fl">
                <span className="field-label" id="st-region">
                  Default region
                </span>
                <Select.Root value={profile.region} onValueChange={(v) => set("region", v)}>
                  <Select.Trigger aria-labelledby="st-region" aria-describedby="st-region-hint" className="st-select">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {regions.map((r) => (
                      <Select.Item key={r.value} value={r.value}>
                        <span className="mono st-m125">{r.value}</span> <span className="t3">· {r.place}</span>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <span className="hint" id="st-region-hint">
                  New services deploy here unless they say otherwise.
                </span>
              </div>
              <div className="st-fl">
                <span className="field-label" id="st-tz">
                  Time zone
                </span>
                <Select.Root value={profile.zone} onValueChange={(v) => set("zone", v)}>
                  <Select.Trigger aria-labelledby="st-tz" aria-describedby="st-tz-hint" className="st-select">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {zones.map((z) => (
                      <Select.Item key={z.value} value={z.value}>
                        {z.value} <span className="t3 num">{z.offset}</span>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <span className="hint" id="st-tz-hint">
                  Used for on-call handoffs and digests.
                </span>
              </div>
            </div>
            <div className="row st-mark">
              {profile.mark ? (
                <span className="logo st-logo" aria-hidden="true">
                  <span />
                </span>
              ) : (
                <span className="st-logo st-logo--empty" aria-hidden="true" />
              )}
              <span className="st-markcol">
                <span className="field-label">Workspace mark</span>
                <span className="hint">
                  {profile.mark && profile.mark !== "default" ? `${profile.mark} · saves with your changes` : profile.mark ? `SVG or PNG, at least 128${NB}×${NB}128${NB}px.` : "No mark. Members see the Orbital Ops initials."}
                </span>
              </span>
              <input
                ref={markInput}
                type="file"
                accept="image/svg+xml,image/png"
                hidden
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) set("mark", file.name);
                  e.currentTarget.value = "";
                }}
              />
              <Button finish="graphite" size="sm" onClick={() => markInput.current?.click()}>
                Upload
              </Button>
              <Button finish="ghost" size="sm" className="st-end" disabled={!profile.mark} onClick={() => set("mark", null)}>
                Remove
              </Button>
            </div>
            <div className="hd st-foot">
              <span className="small t3">Last changed by {changedBy}</span>
              <div className="row">
                <Button finish="ghost" disabled={!dirty} onClick={() => setProfile(baseline)}>
                  Discard
                </Button>
                <Button
                  finish="cobalt"
                  disabled={!dirty || !profile.name.trim() || !slugOk}
                  onClick={() => {
                    setBaseline(profile);
                    setChangedBy("you just now");
                    say("Workspace profile saved.");
                  }}
                >
                  Save changes
                </Button>
              </div>
            </div>
          </section>

          <section className="card st-sec" id="members" aria-labelledby="st-members">
            <div className="st-sh">
              <div>
                <h2 className="h3 st-h2" id="st-members">
                  Members
                </h2>
                <p>
                  {seats} of 10 seats used, including {pending} pending invite{pending === 1 ? "" : "s"}. Agents and API keys don’t use seats.
                </p>
              </div>
              <Button finish="ghost" size="sm" className="st-end" leadingIcon={<D2Icon name="download" />} onClick={exportCsv}>
                Export CSV
              </Button>
            </div>
            <form className="row st-invite" aria-label="Invite a member" onSubmit={invite} noValidate>
              <TextField
                ref={inviteRef}
                className="st-grow"
                type="email"
                aria-label="Email address to invite"
                placeholder="name@orbitalops.example"
                leading={<D2Icon name="mail" size={14} className="t3" />}
                value={inviteEmail}
                error={inviteError}
                onChange={(e) => {
                  setInviteEmail(e.currentTarget.value);
                  setInviteError(undefined);
                }}
              />
              <SegmentedControl
                aria-label="Role for the invite"
                items={[
                  { value: "Admin", label: "Admin" },
                  { value: "Member", label: "Member" },
                  { value: "Viewer", label: "Viewer" }
                ]}
                value={inviteRole}
                onValueChange={setInviteRole}
              />
              <Button finish="graphite" type="submit">
                Send invite
              </Button>
            </form>
            <div className="st-bleed">
              <Table aria-label="Members" className="st-tbl">
                <thead>
                  <tr>
                    <th scope="col">Member</th>
                    <th scope="col">Role</th>
                    <th scope="col">Last active</th>
                    <th scope="col" className="r">
                      <span className="chrome-visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.email}>
                      <td>
                        <span className="row st-gap10">
                          {m.invite ? (
                            <span className="st-av st-av--invite" aria-hidden="true">
                              <D2Icon name="mail" size={14} className="t3" />
                            </span>
                          ) : (
                            <Avatar className="st-av" name={m.name} />
                          )}
                          <span className="st-who">
                            <span className="row st-gap6">
                              {m.name}
                              {m.name === "Mara Lindqvist" ? <Badge>You</Badge> : null}
                              {m.invite ? <Badge>Invited</Badge> : null}
                            </span>
                            <span className="small t3">{m.invite ?? m.email}</span>
                          </span>
                        </span>
                      </td>
                      {m.role === "Owner" || m.invite ? (
                        <td className="t2 st-rl">{m.role}</td>
                      ) : (
                        <td>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <Button finish="graphite" size="sm" className="st-role" aria-label={`Role for ${m.name}: ${m.role}`} trailingIcon={<D2Icon name="chevron-down" size={12} className="t3" />}>
                                {m.role}
                              </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content align="start">
                              <DropdownMenu.Label>Role for {m.name}</DropdownMenu.Label>
                              <DropdownMenu.RadioGroup
                                value={m.role}
                                onValueChange={(role) => {
                                  setMembers((list) => list.map((x) => (x.email === m.email ? { ...x, role: role as Role } : x)));
                                  say(`${m.name} is now ${role === "Admin" ? "an" : "a"} ${role}.`);
                                }}
                              >
                                {roles.map((role) => (
                                  <DropdownMenu.RadioItem key={role} value={role}>
                                    {role}
                                  </DropdownMenu.RadioItem>
                                ))}
                              </DropdownMenu.RadioGroup>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                        </td>
                      )}
                      <td className="t3">{m.active}</td>
                      <td className="r">
                        {m.role === "Owner" ? null : m.invite ? (
                          <Button
                            finish="ghost"
                            size="sm"
                            className="st-end"
                            onClick={() => {
                              setMembers((list) => list.map((x) => (x.email === m.email ? { ...x, invite: `Resent by Mara Lindqvist · expires in 7${NB}days` } : x)));
                              say(`Invite resent to ${m.email}.`);
                            }}
                          >
                            Resend
                          </Button>
                        ) : (
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <IconButton finish="ghost" size="sm" className="st-end-icon" aria-label={`More actions for ${m.name}`}>
                                <D2Icon name="more" />
                              </IconButton>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content align="end">
                              <DropdownMenu.Item
                                onSelect={() => {
                                  void navigator.clipboard?.writeText(m.email).catch(() => undefined);
                                  say(`${m.email} copied.`);
                                }}
                              >
                                Copy email
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator />
                              <DropdownMenu.Item
                                data-tone="danger"
                                onSelect={() => {
                                  setMembers((list) => list.filter((x) => x.email !== m.email));
                                  say(`${m.name} was removed from Orbital Ops.`);
                                }}
                              >
                                Remove from workspace
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </section>

          <section className="card st-sec" id="billing" aria-labelledby="st-billing">
            <div className="st-sh">
              <div>
                <h2 className="h3 st-h2" id="st-billing">
                  Plan and usage
                </h2>
                <p>Scale plan, billed yearly by invoice. Renews 1 Mar 2027.</p>
              </div>
              <div className="row">
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <Button finish="ghost" size="sm">
                      Invoices
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content align="end" className="pg-settings-pop">
                    <span className="field-label">Invoices</span>
                    <span className="st-pop-row small">
                      <span>Scale plan, yearly · 1 Mar 2026</span>
                      <span className="num">$17,280</span>
                    </span>
                    <span className="small t3">The next invoice is due 1 Mar 2027. Usage over the included amounts is invoiced monthly.</span>
                  </Popover.Content>
                </Popover.Root>
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <Button finish="graphite" size="sm">
                      Compare plans
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content align="end" className="pg-settings-pop">
                    <span className="field-label">Scale plan</span>
                    <span className="small t3">$1,440 per month. Includes 10 seats, 50,000 agent minutes and 500 GB of log storage with 30-day retention.</span>
                  </Popover.Content>
                </Popover.Root>
              </div>
            </div>
            <div className="row st-price">
              <span className="num st-amount">$1,440</span>
              <span className="small t3">per month · usage over the included amounts is billed monthly</span>
            </div>
            <div className="st-meters">
              <div className="st-mtr">
                <span className="hd small">
                  <span>Seats</span>
                  <span className="num">
                    <span>{seats}</span> <span className="t3">of 10</span>
                  </span>
                </span>
                <Pill parts={[[seats * 10]]} label="Seats used" />
                <span className="small t3">
                  {10 - seats} seat{10 - seats === 1 ? "" : "s"} free
                </span>
              </div>
              <div className="st-mtr">
                <span className="hd small">
                  <span>Agent minutes</span>
                  <span className="num">
                    <span>38,420</span> <span className="t3">of 50,000</span>
                  </span>
                </span>
                <Pill parts={[[76.8, "amber"]]} label="Agent minutes used" />
                <span className="small am num st-pretty">On pace for 72,000 by 30{NB}Nov, about $440 over at $0.02 a{NB}minute</span>
              </div>
              <div className="st-mtr">
                <span className="hd small">
                  <span>Log storage</span>
                  <span className="num">
                    <span>312{NB}GB</span> <span className="t3">of 500{NB}GB</span>
                  </span>
                </span>
                <Pill parts={[[62.4]]} label="Log storage used" />
                <span className="small t3">30-day retention</span>
              </div>
            </div>
          </section>

          <section className="card st-sec" id="api-keys" aria-labelledby="st-keys">
            <div className="st-sh">
              <div>
                <h2 className="h3 st-h2" id="st-keys">
                  API keys
                </h2>
                <p>A key can do only what its scopes allow. We show the full key once, when you create it.</p>
              </div>
              <Button finish="graphite" size="sm" leadingIcon={<Icon name="plus" style={{ strokeWidth: 2 }} />} onClick={() => setCreating(true)}>
                Create key
              </Button>
            </div>
            <div className="st-bleed">
              <Table aria-label="API keys" className="st-tbl">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Key</th>
                    <th scope="col">Scopes</th>
                    <th scope="col">Last used</th>
                    <th scope="col" className="r">
                      <span className="chrome-visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.name}>
                      <td>
                        <span className="st-who">
                          <span className="mono st-m125">{k.name}</span>
                          <span className="small t3">{k.by}</span>
                        </span>
                      </td>
                      <td>
                        <span className="row st-gap2">
                          <span className="mono t2 st-m12">oo_live_••••••••{k.key}</span>
                          <IconButton finish="ghost" size="sm" className="st-copy" aria-label={`Copy key ID for ${k.name}`} onClick={() => copyKey(k.name, k.key)}>
                            <D2Icon name={copied === k.name ? "check" : "copy"} size={14} />
                          </IconButton>
                        </span>
                      </td>
                      <td>
                        <span className="row st-gap4">
                          {k.scopes.map((s) => (
                            <Badge key={s}>{s}</Badge>
                          ))}
                        </span>
                      </td>
                      <td>{k.stale ? <StatusIndicator tone="warn" role="none" label={k.used} className="st-stale" /> : <span className="t3">{k.used}</span>}</td>
                      <td className="r">
                        <Button finish="ghost" size="sm" className="st-end" onClick={() => setRevoking(k.name)}>
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {keys.some((k) => k.name === "legacy-billing-sync") ? (
              <span className="small t3">
                Keys unused for 90{NB}days are flagged. <span className="mono st-m12">legacy-billing-sync</span> is a candidate for revoking.
              </span>
            ) : (
              <span className="small t3">Keys unused for 90{NB}days are flagged. None are flagged right now.</span>
            )}
          </section>

          <section className="card st-sec" id="notifications" aria-labelledby="st-notif">
            <div className="st-sh">
              <div>
                <h2 className="h3 st-h2" id="st-notif">
                  Notifications
                </h2>
                <p>These are your own settings, Mara. Each member chooses theirs.</p>
              </div>
            </div>
            <div>
              {notifications.map((n) => (
                <Line key={n.id} title={n.title} text={n.text} id={`st-n-${n.id}`}>
                  <Switch aria-labelledby={`st-n-${n.id}`} checked={notify[n.id]} onCheckedChange={(on) => setNotify((s) => ({ ...s, [n.id]: on }))} />
                </Line>
              ))}
            </div>
          </section>

          <section className="card st-sec" id="security" aria-labelledby="st-sec">
            <div className="st-sh">
              <div>
                <h2 className="h3 st-h2" id="st-sec">
                  Security
                </h2>
                <p>Applies to every member and every API key.</p>
              </div>
            </div>
            <div>
              <Line title="Require two-factor authentication" text={`All ${people.length} members are enrolled. Invitees set it up on first sign-in.`} id="st-2fa">
                <Switch aria-labelledby="st-2fa" checked={twoFactor} onCheckedChange={setTwoFactor} />
              </Line>
              <Line title="Single sign-on" text={sso ? "SAML, connected 21 Aug. Members sign in through your identity provider." : "Not connected. Members sign in with email and password."}>
                <StatusIndicator tone={sso ? "ok" : "off"} role="none" label={sso ? "Connected" : "Not connected"} className="small" />
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <Button finish="graphite" size="sm">
                      {sso ? "Configure" : "Connect"}
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content align="end" className="pg-settings-pop">
                    <span className="field-label">Single sign-on</span>
                    <span className="small t3">{sso ? "SAML identity provider, connected 21 Aug." : "Connect a SAML identity provider."}</span>
                    <span className="st-pop-actions">
                      <Popover.Close asChild>
                        <Button finish={sso ? "ghost" : "cobalt"} size="sm" onClick={() => setSso(!sso)}>
                          {sso ? "Disconnect" : "Connect SAML"}
                        </Button>
                      </Popover.Close>
                    </span>
                  </Popover.Content>
                </Popover.Root>
              </Line>
              <Line title="Session length" text="Members sign in again after this long.">
                <SegmentedControl
                  aria-label="Session length"
                  items={[
                    { value: "8h", label: "8h" },
                    { value: "12h", label: "12h" },
                    { value: "24h", label: "24h" }
                  ]}
                  value={session}
                  onValueChange={setSession}
                />
              </Line>
              <Line title="IP allowlist" text={`${ranges.length} range${ranges.length === 1 ? "" : "s"}. API keys work only from these addresses.`}>
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <Button finish="ghost" size="sm" className="st-end">
                      Edit ranges
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content align="end" className="pg-settings-pop st-pop-wide">
                    <TagInput
                      label="Allowed ranges"
                      hint="CIDR blocks, such as 203.0.113.0/24. Press Enter to add."
                      value={ranges}
                      onValueChange={setRanges}
                      validate={(tag) => /^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/.test(tag)}
                      removeLabel={(tag) => `Remove ${tag}`}
                    />
                  </Popover.Content>
                </Popover.Root>
              </Line>
            </div>
          </section>

          <section className="card st-sec st-danger" id="danger" aria-labelledby="st-danger">
            <div className="st-sh">
              <div>
                <h2 className="h3 st-h2 dn" id="st-danger">
                  Danger zone
                </h2>
                <p>Only the owner can do these.</p>
              </div>
            </div>
            <div>
              <Line title="Transfer ownership" text="Make an admin the owner of Orbital Ops. You become an admin.">
                <Button finish="graphite" onClick={() => setTransfer(admins[0]?.email ?? null)} disabled={!admins.length || members[0]?.role !== "Owner"}>
                  Transfer…
                </Button>
              </Line>
              <div className="st-ln">
                <span className="st-lt st-gap6">
                  <span>Delete this workspace</span>
                  <span className="st-mw600">
                    Permanently deletes Orbital Ops with its 214 services, 18 agents, {keys.length} API keys and 312{NB}GB of logs. Running agents stop at once and all {people.length} members lose access.
                    You can’t undo this.
                  </span>
                  <span>
                    You’ll confirm by typing <span className="mono st-confirm">orbital-ops</span>.
                  </span>
                </span>
                <Button finish="enamel" disabled={deleted} onClick={() => setDeleting(true)}>
                  {deleted ? "Deletion scheduled" : "Delete workspace…"}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <span className="chrome-visually-hidden" role="status">
        {status}
      </span>

      <Dialog.Root open={revoking !== null} onOpenChange={(open) => !open && setRevoking(null)}>
        <Dialog.Content className="pg-settings-dialog">
          <Dialog.Title>Revoke {revoking}?</Dialog.Title>
          <Dialog.Description>Requests with this key fail at once. Anything still using it needs a new key.</Dialog.Description>
          <div className="st-dialog-actions">
            <Dialog.Close asChild>
              <Button finish="ghost">Cancel</Button>
            </Dialog.Close>
            <Button
              finish="enamel"
              onClick={() => {
                setKeys((list) => list.filter((k) => k.name !== revoking));
                say(`${revoking} was revoked.`);
                setRevoking(null);
              }}
            >
              Revoke key
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={creating} onOpenChange={setCreating}>
        <Dialog.Content className="pg-settings-dialog">
          <Dialog.Title>Create an API key</Dialog.Title>
          <Dialog.Description>Give it a name and only the scopes it needs. You’ll see the full key once.</Dialog.Description>
          <form
            className="st-dialog-form"
            onSubmit={(e) => {
              e.preventDefault();
              const name = newKey.name.trim();
              if (!name || keys.some((k) => k.name === name) || !newKey.scopes.length) return;
              const suffix = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
              setKeys((list) => [...list, { name, by: "Mara Lindqvist · 18 Nov", key: suffix, scopes: newKey.scopes, used: "Never" }]);
              setNewKey({ name: "", scopes: [] });
              setCreating(false);
              say(`${name} was created.`);
            }}
          >
            <TextField
              label="Name"
              placeholder="status-page-sync"
              value={newKey.name}
              spellCheck={false}
              error={keys.some((k) => k.name === newKey.name.trim()) ? "A key with this name exists." : undefined}
              onChange={(e) => setNewKey((k) => ({ ...k, name: e.currentTarget.value }))}
            />
            <TagInput
              label="Scopes"
              hint="resource:action, such as metrics:read. Press Enter to add."
              value={newKey.scopes}
              onValueChange={(scopes) => setNewKey((k) => ({ ...k, scopes }))}
              validate={(tag) => /^[a-z]+:(read|write|run)$/.test(tag)}
            />
            <div className="st-dialog-actions">
              <Dialog.Close asChild>
                <Button finish="ghost" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button finish="cobalt" type="submit" disabled={!newKey.name.trim() || !newKey.scopes.length}>
                Create key
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={transfer !== null} onOpenChange={(open) => !open && setTransfer(null)}>
        <Dialog.Content className="pg-settings-dialog">
          <Dialog.Title>Transfer ownership</Dialog.Title>
          <Dialog.Description>The new owner can delete the workspace and manage billing. You become an admin.</Dialog.Description>
          <div className="st-dialog-form">
            <span className="field-label" id="st-new-owner">
              New owner
            </span>
            <Select.Root value={transfer ?? undefined} onValueChange={setTransfer}>
              <Select.Trigger aria-labelledby="st-new-owner" className="st-select">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {admins.map((a) => (
                  <Select.Item key={a.email} value={a.email}>
                    {a.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
          <div className="st-dialog-actions">
            <Dialog.Close asChild>
              <Button finish="ghost">Cancel</Button>
            </Dialog.Close>
            <Button
              finish="graphite"
              onClick={() => {
                const next = members.find((m) => m.email === transfer);
                setMembers((list) => list.map((m) => (m.email === transfer ? { ...m, role: "Owner" } : m.role === "Owner" ? { ...m, role: "Admin" } : m)));
                if (next) say(`${next.name} now owns Orbital Ops. You are an admin.`);
                setTransfer(null);
              }}
            >
              Transfer ownership
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        open={deleting}
        onOpenChange={(open) => {
          setDeleting(open);
          if (!open) setConfirmText("");
        }}
      >
        <Dialog.Content className="pg-settings-dialog">
          <Dialog.Title>Delete Orbital Ops?</Dialog.Title>
          <Dialog.Description>
            This deletes 214 services, 18 agents, {keys.length} API keys and 312{NB}GB of logs. Running agents stop at once. You can’t undo this.
          </Dialog.Description>
          <form
            className="st-dialog-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (confirmText !== "orbital-ops") return;
              setDeleted(true);
              setDeleting(false);
              setConfirmText("");
              say("Orbital Ops is scheduled for deletion.");
            }}
          >
            <TextField label="Type orbital-ops to confirm" value={confirmText} spellCheck={false} autoComplete="off" onChange={(e) => setConfirmText(e.currentTarget.value)} />
            <div className="st-dialog-actions">
              <Dialog.Close asChild>
                <Button finish="ghost" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button finish="enamel" type="submit" disabled={confirmText !== "orbital-ops"}>
                Delete workspace
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </AppShell>
  );
}
