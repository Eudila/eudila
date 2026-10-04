// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseDayKey } from "../../historial/records";
import { DayView } from "../../historial/views";

type Props = { params: Promise<{ fecha: string }> };

async function requestedDay(params: Props["params"]) {
  const { fecha } = await params;
  if (!parseDayKey(fecha)) notFound();
  return fecha;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fecha = await requestedDay(params);
  return {
    title: `${fecha} · Calendario · eudila`,
    description: "Todos los registros de este día y la escala de ánimo.",
  };
}

export default async function Day({ params }: Props) {
  const fecha = await requestedDay(params);
  return <DayView dayKey={fecha} />;
}
