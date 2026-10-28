// SPDX-License-Identifier: AGPL-3.0-only
import { parseRange } from "@/lib/panel.ts";
import Patients from "./patients";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string | string[] }>;
}) {
  const { periodo } = await searchParams;
  return <Patients initialRange={parseRange(periodo)} />;
}
