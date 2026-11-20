// Finance desk template (Harbor & Pine, Satin) — work/canvas/project/FinanceDesk.dc.html
import {
  Badge,
  BarChart,
  Button,
  ChartSwatch,
  ChartWell,
  Checkbox,
  Drawer,
  IconButton,
  NumberField,
  Popover,
  SegmentedControl,
  StatusIndicator,
  Table,
  TextField,
  type StatusIndicatorProps
} from "@loreanai/chrome-ui";
import { useState, type ReactNode } from "react";
import { AppShell, type AppNavItem } from "../../components/AppShell";
import { Icon, type IconName } from "../../components/Icon";
import { ChevronIcon, Confirm, Notifications, PageHead, Split, Track, type PillFinish } from "./d1-shared";
import "./FinanceDesk.css";

type Tone = StatusIndicatorProps["tone"];
const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// the artboard's axis reads in millions: $0.5M, not $500k
const millions = (v: number) => (v === 0 ? "$0" : `$${v / 1000000}M`);

/* ---- data (every number from the artboard) ---- */
const accounts: { name: string; no: string; finish: "smoked" | "cobalt" | "silver" | "flat"; value: ReactNode }[] = [
  { name: "Reserve", no: "MM ••5560", finish: "smoked", value: "$6,500,000" },
  { name: "Operating", no: "CHK ••4821", finish: "cobalt", value: "$4,218,640" },
  { name: "Payroll", no: "CHK ••0937", finish: "silver", value: "$1,102,300" },
  { name: "EUR collections", no: "••7713", finish: "flat", value: <span className="d1-row"><span className="t3">€842,115</span>$909,484</span> }
];

const weeks = ["28 Sep", "5 Oct", "12 Oct", "19 Oct", "26 Oct", "2 Nov", "9 Nov", "16 Nov"];
const net = ["+$230k", "−$260k", "+$510k", "−$250k", "+$490k", "−$80k", "+$550k", "+$413k"];

interface Approval { id: string; payee: string; flag?: ReactNode; detail: string; due: string; cents: number }
const approvals: Approval[] = [
  { id: "saltmarsh", payee: "Saltmarsh Freight", detail: "Inbound freight, 6 containers · INV-20931 · Felix Oduya", due: "Wed 18 Nov", cents: 1362000 },
  { id: "bramblewick", payee: "Bramblewick Office Supply", flag: <Badge tone="bad">Possible duplicate</Badge>, detail: "INV-5512 matches a payment sent 3 Nov · Felix Oduya", due: "Thu 19 Nov", cents: 218437 },
  { id: "orbital", payee: "Orbital Ops", detail: "October cloud usage · INV-OO-10482 · Felix Oduya", due: "Fri 20 Nov", cents: 4821000 },
  { id: "quillfield", payee: "Quillfield Staffing", flag: <Badge>Needs 2nd approver</Badge>, detail: "Contract warehouse staff, 26 Oct – 8 Nov · Theo Lambert", due: "Mon 23 Nov", cents: 8640000 }
];
const LIMIT = 5000000; // $50,000 per payment; above it a second approver signs
type Decision = "approved" | "second" | "rejected";
const decisionText: Record<Decision, [string, Tone]> = { approved: ["approved", "ok"], second: ["with 2nd approver", "warn"], rejected: ["rejected", "bad"] };

interface PayoutRow { tone: Tone; text: string; amount: string; approval?: string }
interface PayoutDay { day: string; long: string; value?: string; note: ReactNode; holiday?: boolean; rows: PayoutRow[] }
const payoutDays: PayoutDay[] = [
  { day: "Mon 16", long: "Monday 16 November", value: "$228.0k", note: <span className="t3">sent today</span>, rows: [
    { tone: "info", text: "State sales tax remittance, October", amount: "$154,359.82" },
    { tone: "ok", text: "Pier 9 warehouse lease, November", amount: "$42,000.00" },
    { tone: "info", text: "Corporate card statement ••3391", amount: "$31,640.18" }
  ] },
  { day: "Tue 17", long: "Tuesday 17 November", note: <span>&nbsp;</span>, rows: [] },
  { day: "Wed 18", long: "Wednesday 18 November", value: "$13.6k", note: <span className="t3">1 payee</span>, rows: [{ tone: "warn", text: "Saltmarsh Freight · awaiting approval", amount: "$13,620.00", approval: "saltmarsh" }] },
  { day: "Thu 19", long: "Thursday 19 November", note: <span className="d1-dn">1 flagged</span>, rows: [{ tone: "bad", text: "Bramblewick Office Supply · on hold, possible duplicate", amount: "$2,184.37", approval: "bramblewick" }] },
  { day: "Fri 20", long: "Friday 20 November", value: "$1.11M", note: <span className="t3">payroll</span>, rows: [
    { tone: "ok", text: "Payroll, biweekly · from ••0937", amount: "$1,062,400.00" },
    { tone: "warn", text: "Orbital Ops · awaiting approval", amount: "$48,210.00", approval: "orbital" }
  ] },
  { day: "Mon 23", long: "Monday 23 November", value: "$86.4k", note: <span className="t3">1 payee</span>, rows: [{ tone: "warn", text: "Quillfield Staffing · needs 2nd approver", amount: "$86,400.00", approval: "quillfield" }] },
  { day: "Tue 24", long: "Tuesday 24 November", note: <span>&nbsp;</span>, rows: [] },
  { day: "Wed 25", long: "Wednesday 25 November", value: "$18.9k", note: <span className="t3">1 payee</span>, rows: [{ tone: "ok", text: "1 payee, scheduled", amount: "$18.9k" }] },
  { day: "Thu 26", long: "Thursday 26 November", note: null, holiday: true, rows: [] },
  { day: "Fri 27", long: "Friday 27 November", value: "$24.8k", note: <span className="t3">1 payee</span>, rows: [{ tone: "ok", text: "1 payee, scheduled", amount: "$24.8k" }] }
];
const selectableDays = payoutDays.map((d, i) => (d.holiday ? -1 : i)).filter((i) => i >= 0);

interface Txn { time: string; desc: ReactNode; category: string; tone: Tone; status: string; amount: string; cents: number; returned?: boolean }
const txns: Txn[] = [
  { time: "09:42", desc: "Marlow & Finch · wholesale receipt", category: "Wholesale", tone: "ok", status: "Cleared", amount: "+$360,187.45", cents: 36018745 },
  { time: "09:15", desc: "Tidewater Goods · wholesale receipt", category: "Wholesale", tone: "ok", status: "Cleared", amount: "+$184,300.00", cents: 18430000 },
  { time: "08:30", desc: "Card settlements · 1,284 orders, 15 Nov", category: "Card sales", tone: "ok", status: "Cleared", amount: "+$96,412.55", cents: 9641255 },
  { time: "08:05", desc: "State sales tax remittance, October", category: "Tax", tone: "info", status: "Pending", amount: "−$154,359.82", cents: -15435982 },
  { time: "07:50", desc: "Pier 9 warehouse lease, November", category: "Facilities", tone: "ok", status: "Cleared", amount: "−$42,000.00", cents: -4200000 },
  { time: "07:12", desc: <>Corporate card statement <span className="mono t3" style={{ fontSize: 12 }}>••3391</span></>, category: "Card spend", tone: "info", status: "Pending", amount: "−$31,640.18", cents: -3164018 },
  { time: "06:58", desc: <>Pinecrest Utilities · ACH <span className="small t3">R02, account closed</span></>, category: "Facilities", tone: "bad", status: "Returned", amount: "−$3,912.40", cents: -391240, returned: true }
];

const budgets: { team: string; spent: ReactNode; of: string; value: number; finish: PillFinish; note?: ReactNode }[] = [
  { team: "Operations", spent: "$268.4k", of: "of $420k", value: 64, finish: "si" },
  { team: "Marketing", spent: "$151.2k", of: "of $180k", value: 84, finish: "am", note: <span className="small d1-am">84% spent, ahead of pace</span> },
  { team: "Engineering", spent: "$139.0k", of: "of $260k", value: 53, finish: "si" },
  { team: "People", spent: <span className="d1-dn">$102.6k</span>, of: "of $95k", value: 100, finish: "en", note: <span className="small d1-dn">Over by $7,600 · benefits true-up</span> },
  { team: "Facilities", spent: "$42.0k", of: "of $70k", value: 60, finish: "si" }
];

const navItems: [string, IconName, number?][] = [["Treasury", "bank"], ["Payments", "arrow-up-right", 4], ["Transactions", "receipt"], ["Budgets", "pie"], ["Payouts", "calendar"], ["Reports", "chart"]];
const views: [string, ReactNode][] = [
  ["Over $50,000", <span className="t3 num small">1</span>],
  ["Due this week", <span className="t3 num small">3</span>],
  ["Returned ACH", <span className="small num" style={{ color: "var(--chrome-enamel-text)" }}>1</span>]
];

function NewPayment() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button finish="polished" leadingIcon={<Icon name="plus" style={{ strokeWidth: 2 }} />}>New payment</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header eyebrow="Payments">
          <Drawer.Title>New payment</Drawer.Title>
          <Drawer.Description>From Operating ••4821. Above $50,000 a second approver signs.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="fd-form">
          <TextField label="Payee" placeholder="Search payees" />
          <NumberField label="Amount" unit="USD" min={0} step={100} formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
          <TextField label="Invoice" placeholder="INV-" />
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild><Button finish="ghost">Cancel</Button></Drawer.Close>
          <Button finish="cobalt" onClick={() => setOpen(false)}>Send for approval</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}

export default function Page() {
  const [active, setActive] = useState("Treasury");
  const [view, setView] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(["saltmarsh", "orbital"]);
  const [decided, setDecided] = useState<Record<string, Decision>>({});
  const [day, setDay] = useState(4);
  const [direction, setDirection] = useState("all");

  const nav: AppNavItem[] = navItems.map(([label, icon, badge]) => ({
    label,
    icon,
    badge: badge ? { value: badge } : undefined,
    active: active === label,
    ...(label === "Treasury" ? { to: "/templates/finance-desk" } : { onSelect: () => setActive(label) })
  }));

  const open = approvals.filter((a) => !decided[a.id]);
  const picked = approvals.filter((a) => selected.includes(a.id));
  const total = picked.reduce((sum, a) => sum + a.cents, 0);
  const allState = picked.length === 0 ? false : picked.length === open.length ? true : "indeterminate";
  const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)));
  const decide = (approve: boolean) => {
    setDecided((d) => ({ ...d, ...Object.fromEntries(picked.map((a) => [a.id, approve ? (a.cents > LIMIT ? "second" : "approved") : "rejected"])) }));
    setSelected([]);
  };
  const count = `${picked.length} payment${picked.length === 1 ? "" : "s"}`;
  const payees = picked.map((a) => a.payee).join(" and ");

  const shown = payoutDays[day]!;
  const pos = selectableDays.indexOf(day);
  const rows = txns.filter((t) => direction === "all" || (direction === "in" ? t.cents > 0 : t.cents < 0));

  return (
    <AppShell
      className="pg-finance"
      workspace={{ name: "Harbor & Pine", sub: "Finance" }}
      nav={nav}
      sections={[{ label: "Saved views", items: views.map(([label, meta]) => ({ label, meta, current: view === label, onSelect: () => setView(label) })) }]}
      card={
        <>
          <StatusIndicator className="small" tone="success" label="Bank feeds synced" />
          <span className="small t3">4 accounts · 10:02 ET</span>
        </>
      }
      footer={[{ label: "Settings", icon: "sliders", active: active === "Settings", onSelect: () => setActive("Settings") }]}
      search={{ label: "Search payees, invoices and transactions", placeholder: "Search payees, invoices, transactions" }}
      actions={
        <>
          <Notifications
            label="Notifications, 2 unread"
            items={[
              { text: "Bramblewick Office Supply · INV-5512 looks like a duplicate", meta: "Thu 19" },
              { text: "Pinecrest Utilities ACH returned · R02, account closed", meta: "06:58" }
            ]}
          />
          <NewPayment />
        </>
      }
      user={{ name: "Nadia Brennan", title: "Nadia Brennan, controller" }}
    >
      <PageHead
        title="Treasury"
        sub="Monday 16 Nov 2026 · balances as of 10:02 ET · reported in USD"
        periods={["8 weeks", "Quarter", "Year"]}
        periodLabel="Period"
        defaultPeriod="8 weeks"
      />

      <div className="bento">
        <article className="card card-lit s4 fd-cash">
          <div className="d1-hd"><h2 className="h3">Cash position</h2><span className="small t3">4 accounts</span></div>
          <span className="num fd-total">$12,730,424</span>
          <span className="small"><span className="d1-up num">+$412,900</span> <span className="t3">this week so far</span></span>
          <Split className="fd-cash__split" parts={[[51.1, "sk"], [33.1, "co"], [8.7, "si"], [7.1, "fl"]]} />
          {accounts.map((a) => (
            <div className="fd-acct" key={a.name}>
              <span className="d1-hd small">
                <span className="d1-lg"><ChartSwatch kind="square" finish={a.finish} />{a.name} <span className="mono t3" style={{ fontSize: 11.5 }}>{a.no}</span></span>
                <span className="num">{a.value}</span>
              </span>
            </div>
          ))}
          <span className="small t3 num fd-cash__foot">Operating floor $1,500,000 · covered 2.8×</span>
        </article>

        <article className="card s8 fd-flow">
          <div className="d1-hd d1-hd--start">
            <div className="d1-col">
              <h2 className="h3">Cash in and out</h2>
              <span className="small t3">Weekly, all accounts · pending included · payroll every other Friday</span>
            </div>
            <ul className="chrome-chart-legend fd-legend">
              <li><ChartSwatch kind="square" finish="cobalt" />Cash in</li>
              <li><ChartSwatch kind="square" finish="silver" />Cash out</li>
              <li><span className="fd-etched" aria-hidden="true" />Week to date</li>
            </ul>
          </div>
          <ChartWell className="fd-plot">
            <BarChart
              aria-label="Weekly cash in and out for the 8 weeks from 28 September. Cash out beat cash in during the three payroll weeks. This week so far: 640.9 thousand in, 228 thousand out."
              height={274}
              barWidth={22}
              barGap={4}
              padding={{ top: 20, bottom: 54, left: 54, right: 0 }}
              yTicks={[0, 500000, 1000000, 1500000, 2000000, 2500000]}
              formatY={millions}
              labels={weeks}
              bands={[{ from: 4.5, to: 5.5 }]}
              renderXLabel={(l, i) => (
                <span className="fd-xl">
                  <span className={i === 5 ? "fd-xl__now" : undefined}>{l}</span>
                  <span className={net[i]!.startsWith("+") ? "d1-up" : "d1-dn"}>{net[i]}</span>
                </span>
              )}
              series={[
                { label: "Cash in", data: [1840000, 1720000, 2050000, 1960000, 2180000, 2240000, 2310000, { value: 640900, pending: true }] },
                { label: "Cash out", data: [1610000, 1980000, 1540000, 2210000, 1690000, 2320000, 1760000, { value: 228000, pending: true }] }
              ]}
              dataTable
            />
          </ChartWell>
          <div className="small fd-flow__foot">
            <span><span className="t3">In, 8 weeks </span><span className="num">$14.94M</span></span>
            <span><span className="t3">Out, 8 weeks </span><span className="num">$13.34M</span></span>
            <span><span className="t3">Net </span><span className="num d1-up">+$1.60M</span></span>
            <span className="t3 fd-flow__note">Week of 2 Nov: payroll and Q3 bonus</span>
          </div>
        </article>

        <article className="card s7 fd-approvals">
          <div className="d1-hd d1-hd--start fd-approvals__head">
            <div className="d1-col">
              <div className="d1-row" style={{ gap: 10 }}>
                <h2 className="h3">Payment approvals</h2>
                <Badge className="num">{open.length} pending</Badge>
              </div>
              <span className="small t3">Your limit is $50,000 per payment. Above it, a second approver signs.</span>
            </div>
            <Popover.Root>
              <Popover.Trigger asChild>
                <button type="button" className="d1-link" style={{ lineHeight: "22px" }}>Approval rules</button>
              </Popover.Trigger>
              <Popover.Content align="end" aria-label="Approval rules" className="fd-rules">
                <span className="small" style={{ fontWeight: 600 }}>Approval rules</span>
                <span className="small t2">Up to $50,000 you approve alone. Above it, a second approver signs before the payment is sent.</span>
                <span className="small t2">Possible duplicates stay on hold until someone clears them.</span>
              </Popover.Content>
            </Popover.Root>
          </div>
          <div className="fd-ap-grid" role="group" aria-label="Payments waiting for approval">
            <div className="fd-ap fd-ap--th">
              <Checkbox checked={allState} disabled={!open.length} onCheckedChange={(c) => setSelected(c === true ? open.map((a) => a.id) : [])} aria-label={`Select all payments, ${picked.length} of ${open.length} selected`} />
              <span>Payee</span><span>Due</span><span style={{ textAlign: "right" }}>Amount</span>
            </div>
            {approvals.map((a) => {
              const d = decided[a.id];
              const on = selected.includes(a.id);
              return (
                <div className={on ? "fd-ap fd-ap--sel" : "fd-ap"} key={a.id}>
                  <Checkbox checked={on} disabled={!!d} onCheckedChange={(c) => toggle(a.id, c === true)} aria-label={`Select ${a.payee} payment`} />
                  <span className="d1-col" style={{ gap: 3 }}>
                    <span className="d1-row">
                      <span className="d1-trunc" style={{ fontWeight: 500 }}>{a.payee}</span>
                      {d ? <Badge tone={d === "rejected" ? "bad" : d === "approved" ? "success" : "warning"}>{decisionText[d][0].replace(/^./, (c) => c.toUpperCase())}</Badge> : a.flag}
                    </span>
                    <span className="small t3 d1-trunc">{a.detail}</span>
                  </span>
                  <span className="num t2">{a.due}</span>
                  <span className="num" style={{ textAlign: "right", fontWeight: 500 }}>{usd(a.cents)}</span>
                </div>
              );
            })}
          </div>
          <div className="d1-hd fd-foot fd-approvals__foot">
            <span className="small" aria-live="polite"><span className="num" style={{ fontWeight: 600 }}>{picked.length} selected · {usd(total)}</span> <span className="t3">from Operating ••4821</span></span>
            <div className="d1-row">
              <Confirm
                trigger={<Button finish="ghost" disabled={!picked.length}>Reject</Button>}
                title={`Reject ${count}?`}
                description={`${payees} will not be paid. ${usd(total)} stays in Operating ••4821.`}
                confirm={`Reject ${count}`}
                finish="enamel"
                onConfirm={() => decide(false)}
              />
              <Confirm
                trigger={<Button finish="cobalt" disabled={!picked.length}>Approve {count}</Button>}
                title={`Approve ${count}?`}
                description={`${usd(total)} from Operating ••4821 to ${payees}. Payments above $50,000 go to a second approver.`}
                confirm={`Approve ${count}`}
                onConfirm={() => decide(true)}
              />
            </div>
          </div>
        </article>

        <article className="card s5 fd-payouts">
          <div className="d1-hd">
            <div className="d1-col">
              <h2 className="h3">Upcoming payouts</h2>
              <span className="small t3 num">17–27 Nov · $1,254,280 scheduled</span>
            </div>
            <div className="d1-row" style={{ gap: 2 }}>
              <IconButton finish="ghost" size="sm" aria-label="Previous payout day" disabled={pos <= 0} onClick={() => setDay(selectableDays[pos - 1]!)}><ChevronIcon dir="left" /></IconButton>
              <IconButton finish="ghost" size="sm" aria-label="Next payout day" disabled={pos >= selectableDays.length - 1} onClick={() => setDay(selectableDays[pos + 1]!)}><ChevronIcon dir="right" /></IconButton>
            </div>
          </div>
          <div className="fd-strip" role="group" aria-label="Payout days, 16 to 27 November">
            {payoutDays.map((d, i) =>
              d.holiday ? (
                <span className="fd-cal fd-cal--holiday" key={d.day}><span className="t3">{d.day}</span><span className="t3">Bank</span><span className="t3">holiday</span></span>
              ) : (
                <button type="button" className="fd-cal" key={d.day} aria-pressed={day === i} onClick={() => setDay(i)} aria-label={`${d.long}${d.value ? `, ${d.value}` : ", nothing scheduled"}`}>
                  <span className={day === i ? "fd-cal__day--on" : "t3"}>{d.day}</span>
                  {d.value ? <span className={day === i ? "num fd-cal__value--on" : "num fd-cal__value"}>{d.value}</span> : <span className="t3">{d.day === "Thu 19" ? "On hold" : "—"}</span>}
                  {d.note}
                </button>
              )
            )}
          </div>
          <div className="fd-day">
            <span className="small t3" style={{ paddingBottom: 10 }}>{shown.long}</span>
            {shown.rows.length ? (
              shown.rows.map((r) => {
                const d = r.approval ? decided[r.approval] : undefined;
                const [text, tone] = d ? [`${r.text.split(" · ")[0]} · ${decisionText[d][0]}`, decisionText[d][1]] : [r.text, r.tone];
                return (
                  <div className="d1-hd small fd-day__row" key={r.text}>
                    <StatusIndicator tone={tone} label={text} role="none" className="fd-day__label" />
                    <span className="num">{r.amount}</span>
                  </div>
                );
              })
            ) : (
              <div className="small t3 fd-day__row">No payouts scheduled.</div>
            )}
            <span className="small t3 fd-foot" style={{ marginTop: "auto" }}>Payroll ••0937 holds $1,102,300, enough for Friday.</span>
          </div>
        </article>

        <article className="card s8 fd-txns">
          <div className="d1-hd fd-txns__head">
            <div className="d1-col">
              <h2 className="h3">Transactions today</h2>
              <span className="small t3 num">7 transactions · $640,900.00 in · $228,000.00 out · 1 returned</span>
            </div>
            <SegmentedControl aria-label="Direction" value={direction} onValueChange={setDirection} items={[{ value: "all", label: "All" }, { value: "in", label: "In" }, { value: "out", label: "Out" }]} />
          </div>
          <Table aria-label="Transactions today" containerClassName="fd-txns__table">
            <thead>
              <tr><th scope="col">Time</th><th scope="col">Description</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col" className="r">Amount</th></tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.time}>
                  <td className="num t3">{t.time}</td>
                  <td>{t.desc}</td>
                  <td className="t2">{t.category}</td>
                  <td><StatusIndicator tone={t.tone} label={t.status} role="none" /></td>
                  <td className={t.returned ? "r t3" : t.cents > 0 ? "r d1-up" : "r"}>{t.returned ? <s>{t.amount}</s> : t.amount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </article>

        <article className="card s4 fd-budgets">
          <div className="d1-hd d1-hd--start">
            <div className="d1-col">
              <h2 className="h3">Team budgets</h2>
              <span className="small t3">November · day 16 of 30</span>
            </div>
            <span className="small t3 d1-lg" style={{ lineHeight: "22px" }}><span className="fd-pace-key" aria-hidden="true" />Pace 53%</span>
          </div>
          {budgets.map((b) => (
            <div className="fd-bm" key={b.team}>
              <span className="d1-hd small"><span>{b.team}</span><span className="num">{b.spent} <span className="t3">{b.of}</span></span></span>
              <div style={{ position: "relative" }}>
                <Track value={b.value} finish={b.finish} />
                <span className="fd-pace" aria-hidden="true" />
              </div>
              {b.note}
            </div>
          ))}
          <div className="d1-hd small fd-budgets__foot">
            <span className="t2">All teams</span>
            <span className="num">$703.2k <span className="t3">of $1,025k · 69% spent</span></span>
          </div>
        </article>
      </div>
    </AppShell>
  );
}
