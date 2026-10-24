// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import { Icon } from "../ui";
import MoodOrb from "../mood/orb";
import Mascota from "../mood/mascota";

export const metadata: Metadata = { title: "Ayuda ahora · eudila" };

export default function Help() {
  return (
    <div className="space-y-8 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-question leading-question font-bold tracking-brand text-balance">
          Ayuda ahora
        </h1>
        {/* Peeks in on first use only; the numbers below never wait for it. */}
        <Mascota
          mood={4}
          moment="asomar"
          once="local:eudila-ayuda-vista"
          className="help-mascota size-16 shrink-0"
          fallback={<MoodOrb level={4} />}
        />
      </div>
      <section aria-labelledby="emergency-title" className="space-y-4">
        <h2 id="emergency-title" className="text-title font-semibold">
          Peligro inmediato
        </h2>
        <p className="text-muted">
          Si vos u otra persona están en peligro inmediato, llamá al 911.
        </p>
        <a
          href="tel:911"
          className="surface-card flex min-h-touch items-center gap-4 px-4 py-3 text-action hover:underline"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-action-fill text-on-action">
            <Icon name="phone" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold">Llamar al 911</span>
            <span className="text-muted">Emergencias · Desde todo el país</span>
          </span>
        </a>
      </section>
      <p className="text-muted">
        Podés consultar los números sin internet. Para llamar necesitás señal
        telefónica.
      </p>
      <section aria-labelledby="cas-title" className="space-y-4">
        <h2 id="cas-title" className="text-title font-semibold">
          Centro de Asistencia al Suicida
        </h2>
        <p className="text-muted">
          De 8:00 a 0:00. La línea puede estar ocupada.
        </p>
        <a
          href="tel:135"
          className="surface-card flex min-h-touch items-center gap-4 px-4 py-3 text-action hover:underline"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-action-fill text-on-action">
            <Icon name="phone" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold">Llamar al 135</span>
            <span className="text-muted">
              Capital Federal y Gran Buenos Aires
            </span>
          </span>
        </a>
        <a
          href="tel:08003451435"
          className="surface-card flex min-h-touch items-center gap-4 px-4 py-3 text-action hover:underline"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-action-fill text-on-action">
            <Icon name="phone" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold">Llamar al 0800 345 1435</span>
            <span className="text-muted">Desde todo el país</span>
          </span>
        </a>
      </section>
      <section aria-labelledby="national-title" className="space-y-4">
        <h2 id="national-title" className="text-title font-semibold">
          Urgencias de salud mental
        </h2>
        <p className="text-muted">Atención nacional, las 24 horas.</p>
        <a
          href="tel:08009990091"
          className="surface-card flex min-h-touch items-center gap-4 px-4 py-3 text-action hover:underline"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-action-fill text-on-action">
            <Icon name="phone" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold">Llamar al 0800 999 0091</span>
            <span className="text-muted">Desde todo el país</span>
          </span>
        </a>
      </section>
      <p className="text-muted">
        Números, cobertura y horarios:{" "}
        <a
          className="text-action underline"
          href="https://www.asistenciaalsuicida.org.ar/ayuda"
        >
          Centro de Asistencia al Suicida
        </a>
        , sus{" "}
        <a
          className="text-action underline"
          href="https://www.asistenciaalsuicida.org.ar/horarios-de-atencion"
        >
          horarios de atención
        </a>{" "}
        y{" "}
        <a
          className="text-action underline"
          href="https://www.argentina.gob.ar/node/513585"
        >
          Ministerio de Salud de la Nación
        </a>
        {" y "}
        <a
          className="text-action underline"
          href="https://www.argentina.gob.ar/tema/emergencias"
        >
          Emergencias Argentina
        </a>
        . Verificado el 04/10/2026.
      </p>
    </div>
  );
}
