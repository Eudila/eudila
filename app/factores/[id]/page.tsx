// SPDX-License-Identifier: AGPL-3.0-only
import { notFound } from "next/navigation";
import { FactorView } from "../../analisis/views";
import { normalizeRange } from "../../analisis/data";

export const metadata = { title: "Detalle de factor · eudila" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rango?: string | string[] }>;
}) {
  const { id } = await params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    notFound();
  return (
    <FactorView
      id={id.toLowerCase()}
      range={normalizeRange((await searchParams).rango)}
    />
  );
}
