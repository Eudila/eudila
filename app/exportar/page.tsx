// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import Exportar from "./exportar";

export const metadata: Metadata = { title: "Exportar · eudila" };

export default function ExportPage() {
  return <Exportar />;
}
