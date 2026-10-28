// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, type CSSProperties, type ReactNode } from "react";
import MoodOrb from "@eudila/mood/orb.tsx";
import logo from "@eudila/brand/assets/logo-mascota.svg";
import { RANGES, STATES, type Range } from "@/lib/panel.ts";

const paths = {
  plus: "M12 5v14M5 12h14",
  back: "m15 6-6 6 6 6",
  next: "m9 6 6 6-6 6",
  search: "M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm5 11.5 4.5 4.5",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  user: "M12 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM5.5 19.5a7 7 0 0 1 13 0",
};

export function Icon({
  name,
  size = 18,
  strokeWidth = 2,
  color = "currentColor",
}: {
  name: keyof typeof paths;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}

/** Mascota quieta con carita: así aparece en listas y fichas (mascota, regla 6). */
export function Orb({
  level,
  size,
  label,
  style,
}: {
  level: number;
  size: number;
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <span className="orb" style={{ width: size, height: size, ...style }}>
      <MoodOrb level={level} compact={size <= 44} className="orb-svg" />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

export function stateName(level: number) {
  return STATES[level - 1];
}

export function PeriodToggle({
  value,
  onChange,
}: {
  value: Range;
  onChange: (range: Range) => void;
}) {
  return (
    <div role="group" aria-label="Período" className="segmented">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          aria-pressed={value === range}
          onClick={() => onChange(range)}
        >
          {range} días
        </button>
      ))}
    </div>
  );
}

function InfoDialog({
  label,
  trigger,
  triggerClass,
  title,
  children,
}: {
  label?: string;
  trigger: ReactNode;
  triggerClass: string;
  title: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = `${title.replace(/\W+/g, "-")}-titulo`;
  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        className={triggerClass}
        onClick={() => dialog.current?.showModal()}
      >
        {trigger}
      </button>
      <dialog
        ref={dialog}
        className="dialog"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="dialog-body">
          <h2 id={titleId}>{title}</h2>
          {children}
        </div>
        <div className="dialog-actions">
          <button
            type="button"
            className="button-text"
            onClick={() => dialog.current?.close()}
          >
            Cerrar
          </button>
        </div>
      </dialog>
    </>
  );
}

export function Header() {
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <Image src={logo} alt="" width={40} height={40} unoptimized />
        <span>eudila</span>
      </Link>
      <div className="topbar-actions">
        <InfoDialog
          trigger="Ayuda"
          triggerClass="pill-outline"
          title="Cómo leer el panel"
        >
          <dl>
            <dt>Media</dt>
            <dd>
              Promedio de los registros del período, de 1 (Muy desagradable) a 7
              (Muy agradable).
            </dd>
            <dt>Población</dt>
            <dd>
              Promedio de referencia sin identidades. En esta vista previa es un
              valor ficticio.
            </dd>
            <dt>Período anterior</dt>
            <dd>La media de los días previos, con la misma duración.</dd>
            <dt>Sin registros</dt>
            <dd>Pacientes que no registraron nada en el período elegido.</dd>
          </dl>
          <p>
            eudila no diagnostica: ordena lo que el paciente registra para que
            lo interpretes en la consulta.
          </p>
        </InfoDialog>
        <InfoDialog
          label="Tu cuenta"
          trigger={<Icon name="user" size={22} strokeWidth={1.75} />}
          triggerClass="avatar"
          title="Vista previa sin cuenta"
        >
          <p>
            Esta versión del panel no tiene inicio de sesión ni accede a datos
            reales. Cuando se conecte, acá vas a ver tu cuenta y vas a poder
            cerrar sesión.
          </p>
        </InfoDialog>
      </div>
    </header>
  );
}
