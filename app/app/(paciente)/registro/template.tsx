// SPDX-License-Identifier: AGPL-3.0-only
// Keyed by the step, so each registro step eases in on its own.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-enter flex flex-1 flex-col">{children}</div>;
}
