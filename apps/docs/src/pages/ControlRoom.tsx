import {
  Avatar,
  Button,
  Dialog,
  IconButton,
  Select,
  Slider,
  Switch,
  Tabs,
  Toast
} from "@loreanai/chrome-ui";
import { useEffect, useMemo, useState } from "react";
import { Brand } from "../components/Brand";
import { UiIcon, type IconName } from "../components/UiIcon";

const tracks = [
  { id: "vox", label: "VOX", icon: "mic" as IconName, seed: 2 },
  { id: "drums", label: "DRUMS", icon: "wave" as IconName, seed: 5 },
  { id: "synth", label: "SYNTH", icon: "synth" as IconName, seed: 8 },
  { id: "fx", label: "FX", icon: "sparkle" as IconName, seed: 13 }
];

function waveformPath(seed: number) {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let x = 0; x <= 100; x += 0.35) {
    const envelope = 0.36 + 0.64 * Math.sin((x / 100) * Math.PI);
    const grain = Math.abs(Math.sin((x + seed * 9.7) * 12.9898) * 43758.5453) % 1;
    const detail = Math.abs(Math.sin((x + seed) * 3.73) * Math.cos((x + seed * 5) * 1.91));
    const body = Math.abs(Math.sin((x + seed) * 0.61) * Math.cos((x + seed * 3) * 0.27));
    const amplitude = 1.2 + (grain * 0.5 + detail * 0.34 + body * 0.16) * 25 * envelope;
    top.push(`${x.toFixed(2)},${(32 - amplitude).toFixed(2)}`);
    bottom.unshift(`${x.toFixed(2)},${(32 + amplitude).toFixed(2)}`);
  }
  return `M ${top.join(" L ")} L ${bottom.join(" L ")} Z`;
}

const waveforms = Object.fromEntries(tracks.map((track) => [track.id, waveformPath(track.seed)]));

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}.08`;
}

export function ControlRoom() {
  const [activeSection, setActiveSection] = useState("Live");
  const [mode, setMode] = useState("mix");
  const [selectedTrack, setSelectedTrack] = useState("synth");
  const [visibleTrackIds, setVisibleTrackIds] = useState(() => tracks.map((track) => track.id));
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(134);
  const [gain, setGain] = useState([58]);
  const [pan, setPan] = useState([50]);
  const [spatial, setSpatial] = useState(true);
  const [monitor, setMonitor] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => (value >= 179 ? 90 : value + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const selected = useMemo(() => tracks.find((track) => track.id === selectedTrack) ?? tracks[2], [selectedTrack]);
  const visibleTracks = tracks.filter((track) => visibleTrackIds.includes(track.id));
  const notifySaved = () => {
    setToastOpen(false);
    window.setTimeout(() => setToastOpen(true), 10);
  };
  const removeSelectedTrack = () => {
    if (visibleTrackIds.length <= 1) return;
    const nextIds = visibleTrackIds.filter((id) => id !== selectedTrack);
    setVisibleTrackIds(nextIds);
    setSelectedTrack(nextIds[0] ?? "synth");
  };

  return (
    <Toast.Provider swipeDirection="right">
      <div className="control-room">
        <header className="control-room__topbar">
          <Brand suffix="CONTROL ROOM" />
          <strong>Violet Transmission</strong>
          <div><span className="live-state"><i /> LIVE</span><Avatar name="Arin Reyes" /><IconButton variant="quiet" aria-label="Mixer settings"><UiIcon name="sliders" /></IconButton></div>
        </header>

        <aside className="control-nav" aria-label="Control Room navigation">
          <nav>{([
            ["Sessions", "folder"], ["Library", "library"], ["Live", "wave"], ["Exports", "upload"]
          ] as const).map(([label, icon]) => <button key={label} className={label === activeSection ? "active" : ""} aria-pressed={label === activeSection} onClick={() => setActiveSection(label)}><UiIcon name={icon as IconName} />{label}</button>)}</nav>
          <button aria-pressed={activeSection === "Settings"} onClick={() => setActiveSection("Settings")}><UiIcon name="gear" />Settings</button>
        </aside>

        <main className="mixer-workspace">
          <div className="mixer-heading">
            <div><h1>Violet Transmission</h1><Tabs.Root value={mode} onValueChange={setMode}><Tabs.List aria-label="Workspace mode"><Tabs.Trigger value="arrange">Arrange</Tabs.Trigger><Tabs.Trigger value="mix">Mix</Tabs.Trigger><Tabs.Trigger value="deliver">Deliver</Tabs.Trigger></Tabs.List><Tabs.Content className="sr-only" value="arrange">Arrange the session timeline.</Tabs.Content><Tabs.Content className="sr-only" value="mix">Mix the active channels.</Tabs.Content><Tabs.Content className="sr-only" value="deliver">Prepare the session for delivery.</Tabs.Content></Tabs.Root></div>
            <div><Button variant="quiet" size="sm" onClick={notifySaved}><UiIcon name="bookmark" /> Save snapshot</Button><Button size="sm" onClick={() => setExportOpen(true)}>Export <UiIcon name="arrow-right" /></Button></div>
          </div>

          <div className="timeline-ruler" aria-hidden="true">
            {["01:30", "01:45", "02:00", "02:15", "02:30", "02:45", "03:00"].map((time) => <span key={time}>{time}</span>)}
          </div>
          <div className="playhead" style={{ left: `${Math.max(25, Math.min(87, ((seconds - 90) / 90) * 78 + 12))}%` }}><span>{formatTime(seconds)}</span></div>

          <div className="track-list" style={{ gridTemplateRows: `repeat(${visibleTracks.length}, 101px)` }}>
            {visibleTracks.map((track) => (
              <button key={track.id} className="track-row" data-track={track.id} data-selected={selectedTrack === track.id} onClick={() => setSelectedTrack(track.id)}>
                <span className="track-name"><UiIcon name={track.icon} />{track.label}</span>
                <span className="track-actions"><i>M</i><i data-active={selectedTrack === track.id ? "true" : undefined}>S</i></span>
                <svg className="waveform" preserveAspectRatio="none" viewBox="0 0 100 64" aria-hidden="true"><path d={waveforms[track.id]} /></svg>
              </button>
            ))}
          </div>
        </main>

        <aside className="channel-inspector">
          <h2>{selected?.label} / CHANNEL 03</h2>
          <label><span>Input</span><Select.Root defaultValue="analog"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="analog">Analog 4</Select.Item><Select.Item value="usb">USB interface</Select.Item><Select.Item value="loop">Loopback</Select.Item></Select.Content></Select.Root></label>
          <label className="inspector-slider focused"><span>Gain <output>+{((gain[0] ?? 50) / 24).toFixed(1)} dB</output></span><Slider value={gain} onValueChange={setGain} aria-label="Gain" /></label>
          <label className="inspector-slider"><span>Pan <output>{(pan[0] ?? 50) - 50}</output></span><Slider value={pan} onValueChange={setPan} aria-label="Pan" /></label>
          <label className="labeled-control"><span>Spatial</span><Switch checked={spatial} onCheckedChange={setSpatial} aria-label="Spatial" /></label>
          <label className="labeled-control"><span>Monitor</span><Switch checked={monitor} onCheckedChange={setMonitor} aria-label="Monitor" /></label>
          <label><span>Output</span><Select.Root defaultValue="main"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="main">Main mix</Select.Item><Select.Item value="bus">Bus A</Select.Item><Select.Item value="headphones">Headphones</Select.Item></Select.Content></Select.Root></label>
          <Button variant="quiet" className="remove-track" disabled={visibleTrackIds.length <= 1} onClick={removeSelectedTrack}>Remove track <UiIcon name="trash" /></Button>
        </aside>

        <footer className="transport">
          <IconButton variant="quiet" aria-label="Previous marker" onClick={() => setSeconds((value) => Math.max(90, value - 15))}><UiIcon name="play" className="flip-icon" /></IconButton>
          <IconButton size="lg" aria-label={playing ? "Pause playback" : "Start playback"} onClick={() => setPlaying((value) => !value)}><UiIcon name={playing ? "pause" : "play"} /></IconButton>
          <IconButton variant="quiet" aria-label="Next marker" onClick={() => setSeconds((value) => Math.min(180, value + 15))}><UiIcon name="play" /></IconButton>
          <button className="record-button" data-recording={recording || undefined} aria-label={recording ? "Stop recording" : "Record"} aria-pressed={recording} onClick={() => setRecording((value) => !value)}><UiIcon name="record" /></button>
          <time>{formatTime(seconds)}</time>
          <div className="transport-progress"><Slider value={[seconds]} min={90} max={180} onValueChange={(value) => setSeconds(value[0] ?? 90)} aria-label="Playback position" /></div>
        </footer>

        <Dialog.Root open={exportOpen} onOpenChange={setExportOpen}>
          <Dialog.Content>
            <Dialog.Title>Export Violet Transmission</Dialog.Title>
            <Dialog.Description>Prepare the current mix as a lossless 24-bit package.</Dialog.Description>
            <div className="dialog-actions"><Dialog.Close asChild><Button variant="quiet">Cancel</Button></Dialog.Close><Button onClick={() => { setExportOpen(false); notifySaved(); }}>Export package</Button></div>
          </Dialog.Content>
        </Dialog.Root>

        <Toast.Root open={toastOpen} onOpenChange={setToastOpen} duration={3200}>
          <span className="toast-check"><UiIcon name="check" /></span><Toast.Title>Snapshot saved</Toast.Title><Toast.Description>Just now</Toast.Description><Toast.Close aria-label="Dismiss notification"><UiIcon name="close" /></Toast.Close>
        </Toast.Root>
        <Toast.Viewport />
      </div>
    </Toast.Provider>
  );
}
