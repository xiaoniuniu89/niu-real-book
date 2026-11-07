"use client";
// Short how-tos on Account → Help, each folded until you open it.
import { HOW_TOS } from "@/lib/howTos";

export function HowTos() {
  return (
    <div className="how-tos">
      <h2>How to</h2>
      {HOW_TOS.map(h => (
        <details className="how-to" key={h.title}>
          <summary>{h.title}</summary>
          <ol>{h.steps.map(s => <li key={s}>{s}</li>)}</ol>
          {h.note && <p className="hint">{h.note}</p>}
        </details>
      ))}
    </div>
  );
}
