// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import { CalendarView } from "../historial/views";

export const metadata: Metadata = {
  title: "Calendario · eudila",
  description: "Consultá tus registros por día, sin rachas ni metas.",
};

export default async function Calendar({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string | string[] }>;
}) {
  const { mes } = await searchParams;
  return <CalendarView requestedMonth={typeof mes === "string" ? mes : null} />;
}
