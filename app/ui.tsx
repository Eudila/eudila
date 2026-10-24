// SPDX-License-Identifier: AGPL-3.0-only
import type { ReactNode } from "react";

// 24px line icons, drawn with currentColor. Decorative: names come from text.
const paths = {
  edit: "M12 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7 M16 3l5 5-10 10-5 1 1-5Z M14 5l5 5",
  clock: "M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9 M12 7v5l3 2",
  calendar:
    "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z M16 3v4M8 3v4M3 11h18 M8 15h.01M12 15h.01M16 15h.01",
  sunrise:
    "M12 2v6 M8 6l4-4 4 4 M4.2 10.2l1.4 1.4 M2 18h2 M20 18h2 M18.4 11.6l1.4-1.4 M22 22H2 M16 18a4 4 0 0 0-8 0",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4",
  moon: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  sparkle:
    "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z M19 3v4 M17 5h4",
  chart: "M3 3v18h18 M7 15l4-4 3 3 5-6",
  tag: "M12 2H2v10l9.3 9.3a1 1 0 0 0 1.4 0l8.6-8.6a1 1 0 0 0 0-1.4Z M7 7h.01",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  printer:
    "M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6Z",
  phone:
    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 16v-4 M12 8h.01",
  chevron: "M6 9l6 6 6-6",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  plus: "M12 5v14 M5 12h14",
  check: "M20 6 9 17l-5-5",
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className = "size-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}

// Secondary explanations live closed by default; the summary names them.
export function Disclosure({
  summary,
  icon = "info",
  children,
}: {
  summary: ReactNode;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <details className="disclosure">
      <summary>
        <Icon name={icon} />
        <span className="min-w-0 flex-1">{summary}</span>
        <Icon name="chevron" className="disclosure-chevron size-5" />
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}
