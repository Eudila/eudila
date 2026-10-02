// SPDX-License-Identifier: AGPL-3.0-only
import { notFound } from "next/navigation";
import Registro from "../registro";

const implemented = ["tipo", "animo", "emocion"];

export function generateStaticParams() {
  return implemented.map((paso) => ({ paso }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ paso: string }>;
}) {
  const { paso } = await params;
  if (!implemented.includes(paso)) notFound();
  return <Registro paso={paso} />;
}
