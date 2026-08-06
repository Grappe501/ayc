import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SLIDES } from "./content";
import { meetingPath } from "./paths";
import {
  clockPhaseAt,
  formatClock,
  getMeetingStart,
  MEETING_HOUR_MINUTES,
  setMeetingStart,
  timeTrackSummary,
} from "./timeTrack";

export function MeetingClock({ compact = false }: { compact?: boolean }) {
  const location = useLocation();
  const [startMs, setStartMs] = useState<number | null>(() => getMeetingStart());
  const [now, setNow] = useState(() => Date.now());
  const [showTrack, setShowTrack] = useState(false);

  useEffect(() => {
    if (startMs == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [startMs]);

  const elapsedSec = startMs == null ? 0 : Math.floor((now - startMs) / 1000);
  const phase = startMs == null ? null : clockPhaseAt(elapsedSec, location.pathname);

  function start() {
    const t = Date.now();
    setMeetingStart(t);
    setStartMs(t);
    setNow(t);
  }

  function reset() {
    if (!window.confirm("Reset the meeting clock for everyone on this device?")) return;
    setMeetingStart(null);
    setStartMs(null);
  }

  let statusClass = "clock-ok";
  let title = "Meeting clock";
  let primary = "—:—";
  let secondary = `1:00:00 · ${MEETING_HOUR_MINUTES} min hour (+ optional 15)`;

  if (phase?.kind === "segment") {
    const over = phase.segmentRemainingSec < 0;
    statusClass = over ? "clock-over" : phase.segmentRemainingSec <= 60 ? "clock-warn" : "clock-ok";
    title = phase.segment.label;
    primary = formatClock(phase.segmentRemainingSec);
    secondary = `Segment ${over ? "over" : "left"} · Hour ${formatClock(phase.hourRemainingSec)} left · ${phase.segment.speaker ?? ""}`;
  } else if (phase?.kind === "initial-qa") {
    statusClass = phase.remainingSec <= 60 ? "clock-warn" : "clock-ok";
    title = "Initial Q&A (inside the hour)";
    primary = formatClock(phase.remainingSec);
    secondary = `5-minute first questions · Hour ${formatClock(phase.hourRemainingSec)} left`;
  } else if (phase?.kind === "extended-qa") {
    statusClass = "clock-extended";
    title = "Optional extended Q&A";
    primary = formatClock(phase.remainingSec);
    secondary = "After the one-hour mark · up to 15 more minutes";
  } else if (phase?.kind === "complete") {
    statusClass = "clock-done";
    title = "Time complete";
    primary = "0:00";
    secondary = "Hour + optional Q&A window finished";
  }

  return (
    <div className={`meeting-clock ${statusClass}${compact ? " compact" : ""}`}>
      <div className="clock-main">
        <div className="clock-text">
          <p className="clock-label">{title}</p>
          <p className="clock-digits" aria-live="polite">
            {startMs == null ? "Not started" : primary}
          </p>
          <p className="clock-sub">{startMs == null ? secondary : secondary}</p>
        </div>
        <div className="clock-actions">
          {startMs == null ? (
            <button type="button" className="btn btn-gold" onClick={start}>
              Start 1-hour clock
            </button>
          ) : (
            <button type="button" className="btn btn-ghost clock-reset" onClick={reset}>
              Reset
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => setShowTrack((v) => !v)}>
            {showTrack ? "Hide track" : "Time track"}
          </button>
        </div>
      </div>
      {showTrack ? (
        <ol className="time-track-list">
          {timeTrackSummary().map((row) => {
            const active =
              (phase?.kind === "segment" && phase.segment.id === row.id) ||
              (phase?.kind === "initial-qa" && row.id === "qa");
            const slide = row.id === "qa" ? null : row.id;
            return (
              <li key={row.id} className={active ? "active" : undefined}>
                {slide && row.id !== "qa" ? (
                  <Link to={pathForSegment(row.id)}>{row.label}</Link>
                ) : (
                  <span>{row.label}</span>
                )}
                <span className="mins">
                  {row.minutes}m{row.speaker ? ` · ${row.speaker}` : ""}
                </span>
              </li>
            );
          })}
          <li className={phase?.kind === "extended-qa" ? "active" : undefined}>
            <span>Optional extended Q&A</span>
            <span className="mins">15m · after hour</span>
          </li>
        </ol>
      ) : null}
    </div>
  );
}

function pathForSegment(id: string): string {
  const slide = SLIDES.find((s) => s.id === id)
  return slide?.path ?? meetingPath('/')
}
