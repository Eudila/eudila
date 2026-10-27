// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import { currentUser } from "../auth/server";
import { redirect } from "next/navigation";
import { authConfigured } from "../auth/config";
import { previewEnabled } from "../frontend-preview";
import MoodOrb from "@eudila/mood/orb.tsx";
import Mascota from "@eudila/mood/mascota.tsx";
import { brandMood } from "@eudila/mood/critter.ts";

export default async function Home() {
  const user = await currentUser();
  if (authConfigured && !previewEnabled && !user) redirect("/bienvenida");
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8 text-center">
      {/* Saludo once per session instead of a splash: no delay before the task. */}
      <Mascota
        mood={brandMood}
        moment="hola"
        once="session:eudila-saludo"
        className="size-36 max-w-full shrink-0"
        fallback={<MoodOrb level={brandMood} />}
      />
      <h1 className="font-display max-w-question text-question leading-question font-bold tracking-brand text-balance">
        ¿Cómo te sentís ahora?
      </h1>
      <p className="max-w-copy text-body leading-body text-muted">
        Un momento para registrar lo que sentís, a tu manera.
      </p>
      <Link href="/registro/tipo" className="action action-primary w-full">
        Empezar registro
      </Link>
      <Link
        href={user ? "/cuenta" : "/ingresar"}
        className="action action-text"
      >
        {user ? "Mi cuenta" : "Ingresar o crear cuenta"}
      </Link>
    </div>
  );
}
