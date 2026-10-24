// SPDX-License-Identifier: AGPL-3.0-only
// Remounts on each top-level navigation, replaying the short entrance.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-enter flex flex-1 flex-col">{children}</div>;
}
