// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import { TodayView } from "../historial/views";

export const metadata: Metadata = {
  title: "Hoy · eudila",
  description: "Tus registros de hoy, en orden y a tu manera.",
};

export default function Today() {
  return <TodayView />;
}
