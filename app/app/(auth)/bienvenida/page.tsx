// SPDX-License-Identifier: AGPL-3.0-only
import { cookies } from "next/headers";
import Welcome from "./welcome";

export default async function Bienvenida() {
  const seen = (await cookies()).has("eudila-intro");
  return <Welcome intro={!seen} />;
}
