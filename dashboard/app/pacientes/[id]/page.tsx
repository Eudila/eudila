// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPatient } from "@/lib/demo-data.ts";
import { parseRange } from "@/lib/panel.ts";
import Ficha from "./ficha";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ periodo?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const patient = findPatient((await params).id);
  return { title: patient?.name ?? "Paciente" };
}

export default async function Page({ params, searchParams }: Props) {
  const patient = findPatient((await params).id);
  if (!patient) notFound();
  const { periodo } = await searchParams;
  return <Ficha patientId={patient.id} initialRange={parseRange(periodo)} />;
}
