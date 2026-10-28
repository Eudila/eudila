// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import AltaForm from "./alta-form";

export const metadata: Metadata = { title: "Dar de alta" };

export default function Page() {
  return <AltaForm />;
}
