// SPDX-License-Identifier: AGPL-3.0-only
// Local, conventional line icons. Meaning always comes from the visible label.
const paths = {
  register: [
    "M12 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7",
    "m16 3 5 5-10 10-5 1 1-5Z",
    "m14 5 5 5",
  ],
  today: ["M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9", "M12 7v5l3 2"],
  calendar: [
    "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    "M16 3v4M8 3v4M3 11h18",
    "M8 15h.01M12 15h.01M16 15h.01",
  ],
  help: [
    "M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9",
    "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    "m5.6 5.6 3.6 3.6m5.6 5.6 3.6 3.6M5.6 18.4l3.6-3.6m5.6-5.6 3.6-3.6",
  ],
  arrowRight: ["M5 12h14m-6-6 6 6-6 6"],
  arrowLeft: ["M19 12H5m6-6-6 6 6 6"],
  close: ["m6 6 12 12M18 6 6 18"],
  user: ["M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0", "M4 21v-2a8 8 0 0 1 16 0v2"],
  download: ["M12 3v12m-5-5 5 5 5-5", "M5 16v4h14v-4"],
  chart: ["M4 3v17h17", "m7 14 4-4 4 2 5-7"],
  factors: ["M4 6h16M4 12h16M4 18h16", "M8 4v4m8 2v4m-6 2v4"],
  phone: ["m7 3 3 5-3 3a15 15 0 0 0 6 6l3-3 5 3-1 4C10 22 2 14 3 4Z"],
  search: ["M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0", "m15 15 6 6"],
  check: ["m5 12 4 4L19 6"],
  edit: ["m15 4 5 5-11 11H4v-5Z", "m12 7 5 5"],
  print: ["M7 8V3h10v5M7 16H3V8h18v8h-4", "M7 13h10v8H7Z", "M17 10h.01"],
  sunrise: [
    "M2 20h20M4 16h16",
    "M8 16a4 4 0 0 1 8 0",
    "M12 3v3M4 9l2 2m14-2-2 2M2 16h2m16 0h2",
  ],
  sun: [
    "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5",
  ],
  moon: ["M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z"],
  eye: [
    "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",
    "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  ],
  eyeOff: [
    "m3 3 18 18M10.6 5.1 12 5c7 0 10 7 10 7a18 18 0 0 1-3 4m-3.5 2.4L12 19C5 19 2 12 2 12a18 18 0 0 1 3-4",
    "m10 10 4 4",
  ],
} as const;

export type IconName = keyof typeof paths;
export default function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="ui-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name].map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  );
}
