// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { useState } from "react";
import { moods, shapePath } from "@/prototype/moods.js";
import {
  averageMood,
  entriesForDay,
  localDayKey,
  parseDayKey,
  type RecordEntry,
} from "./records";
import { useHistory } from "./state";

const action =
  "inline-flex min-h-action max-w-full items-center justify-center rounded-control bg-action px-5 py-3 text-center font-semibold text-white hover:underline";
const textAction =
  "inline-flex min-h-touch max-w-full items-center justify-center rounded-control px-2 py-2 text-center text-action underline";
const title =
  "font-display text-question leading-question font-bold tracking-brand text-balance";
const fullDate = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const monthDate = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
});
const recordTime = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function MoodShape({ mood, small = false }: { mood: number; small?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 220"
      aria-hidden="true"
      className={small ? "size-5 shrink-0" : "size-12 shrink-0"}
      style={{ color: `var(--color-mood-${mood}-orb)` }}
    >
      <path d={shapePath(moods[mood - 1])} fill="currentColor" />
    </svg>
  );
}

export function HistoryGate({ children }: { children: React.ReactNode }) {
  const { ready, problem, preview, retry } = useHistory();
  if (!ready) return <p role="status">Preparando tus registros…</p>;
  if (problem)
    return (
      <div className="space-y-4">
        <p role="alert">{problem}</p>
        <button type="button" className={action} onClick={retry}>
          Volver a intentar
        </button>
      </div>
    );
  if (!preview)
    return (
      <div className="space-y-4">
        <p role="status">
          El historial de tu cuenta todavía no está disponible. Podrás consultar
          tus registros cuando se habilite la conexión.
        </p>
        <Link href="/registro/tipo" className={textAction}>
          Preparar un registro
        </Link>
      </div>
    );
  return children;
}

function HistoryActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/registro/tipo" className={action}>
        Registrar cómo me siento
      </Link>
      <Link href="/exportar" className={textAction}>
        Exportar historial
      </Link>
      <Link href="/evolucion" className={textAction}>
        Ver evolución
      </Link>
      <Link href="/factores" className={textAction}>
        Ver factores de vida
      </Link>
    </div>
  );
}

function DaySummary({ entries }: { entries: RecordEntry[] }) {
  const average = averageMood(entries);
  if (average === null) return null;
  return (
    <div className="flex items-center gap-3 rounded-control border border-line p-4">
      <MoodShape mood={average} />
      <div className="min-w-0">
        <h2 className="font-semibold">Resumen del día</h2>
        <p>
          {moods[average - 1].label} · {average} de 7
        </p>
        <p className="text-muted">
          Promedio redondeado de {entries.length}{" "}
          {entries.length === 1 ? "registro" : "registros"}.
        </p>
      </div>
    </div>
  );
}

function RecordList({ entries }: { entries: RecordEntry[] }) {
  return (
    <section aria-labelledby="records-title" className="space-y-3">
      <h2 id="records-title" className="font-semibold">
        Registros del día
      </h2>
      <ol className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-control border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <time dateTime={entry.recordedAt} className="font-semibold">
                {recordTime.format(new Date(entry.recordedAt))}
              </time>
              <span className="text-muted">
                {entry.type === "libre"
                  ? "Registro libre"
                  : entry.type[0].toUpperCase() + entry.type.slice(1)}
              </span>
            </div>
            <p className="mt-3 font-semibold">{entry.emotion.nombre}</p>
            <div className="mt-1 flex items-center gap-2">
              <MoodShape mood={entry.mood} small />
              <p>
                {moods[entry.mood - 1].label} · {entry.mood} de 7
              </p>
            </div>
            {entry.factors.length ? (
              <div className="mt-3">
                <p className="text-muted">Factores elegidos</p>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {entry.factors.map((factor) => (
                    <li
                      key={factor.id}
                      className="rounded-control border border-line px-2 py-1"
                    >
                      {factor.nombre}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-muted">Sin factores elegidos.</p>
            )}
            {entry.source === "example" && (
              <p className="mt-3 text-muted">Ejemplo ficticio</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function MoodLegend() {
  return (
    <details className="rounded-control border border-line p-3">
      <summary className="min-h-touch cursor-pointer py-2 font-semibold text-action">
        Escala de ánimo · 1 a 7
      </summary>
      <p className="py-3 text-muted">
        Cada día muestra el promedio redondeado de los ánimos registrados. El
        número, la forma y la etiqueta acompañan al color. La escala describe lo
        que elegiste; no es una evaluación ni un diagnóstico.
      </p>
      <ol className="space-y-2">
        {moods.map((mood, index) => (
          <li key={mood.label} className="flex items-center gap-2">
            <MoodShape mood={index + 1} small />
            <span>
              {index + 1} · {mood.label}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function TodayView() {
  const { records, ready, loadExamples } = useHistory();
  const [exampleProblem, setExampleProblem] = useState<string | null>(null);
  const dayKey = ready ? localDayKey(new Date()) : null;
  const entries = dayKey ? entriesForDay(records, dayKey) : [];
  return (
    <section className="space-y-6 px-6 py-6">
      <h1 className={title}>Hoy</h1>
      {dayKey && (
        <p className="text-muted">{fullDate.format(parseDayKey(dayKey)!)}</p>
      )}
      <HistoryGate>
        {entries.length ? (
          <>
            <DaySummary entries={entries} />
            <RecordList entries={entries} />
          </>
        ) : (
          <div className="space-y-2">
            <h2 className="font-semibold">Un espacio para tu día</h2>
            <p className="text-muted">
              Todavía no hay registros de hoy. Cuando quieras, podés dedicar un
              momento a registrar cómo te sentís.
            </p>
            {!records.length && (
              <>
                <button
                  type="button"
                  className={textAction}
                  onClick={() => {
                    try {
                      loadExamples();
                      setExampleProblem(null);
                    } catch {
                      setExampleProblem(
                        "No pudimos cargar los ejemplos en esta pestaña. Podés volver a intentar.",
                      );
                    }
                  }}
                >
                  Cargar ejemplos ficticios
                </button>
                {exampleProblem && <p role="alert">{exampleProblem}</p>}
              </>
            )}
          </div>
        )}
        <HistoryActions />
        <Link href="/calendario" className={textAction}>
          Ver otros días
        </Link>
      </HistoryGate>
    </section>
  );
}

export function CalendarView({
  requestedMonth,
}: {
  requestedMonth: string | null;
}) {
  const { records, ready } = useHistory();
  const today = ready ? localDayKey(new Date()) : null;
  const requested = requestedMonth ? parseDayKey(`${requestedMonth}-01`) : null;
  const month = today
    ? requested && requestedMonth! <= today.slice(0, 7)
      ? requestedMonth!
      : today.slice(0, 7)
    : null;
  const first = month ? parseDayKey(`${month}-01`)! : null;
  const previous = first ? new Date(first) : null;
  const next = first ? new Date(first) : null;
  previous?.setMonth(previous.getMonth() - 1);
  next?.setMonth(next.getMonth() + 1);
  const firstOffset = first ? (first.getDay() + 6) % 7 : 0;
  const days = first
    ? new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    : 0;
  const weekdays = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const shortWeekdays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
  return (
    <section className="space-y-6 px-4 py-6">
      <h1 className={title}>Calendario</h1>
      <HistoryGate>
        {first && today && (
          <>
            <nav
              aria-label="Mes del calendario"
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <h2
                id="month-title"
                className="w-full text-center font-semibold first-letter:uppercase"
              >
                {monthDate.format(first)}
              </h2>
              {first.getFullYear() > 1 || first.getMonth() > 0 ? (
                <Link
                  href={`/calendario?mes=${localDayKey(previous!).slice(0, 7)}`}
                  className={textAction}
                >
                  Mes anterior
                </Link>
              ) : (
                <span />
              )}
              {month! < today.slice(0, 7) ? (
                <Link
                  href={`/calendario?mes=${localDayKey(next!).slice(0, 7)}`}
                  className={textAction}
                >
                  Mes siguiente
                </Link>
              ) : (
                <span className="px-2 text-muted">Mes actual</span>
              )}
            </nav>
            <div
              aria-labelledby="month-title"
              className="-mx-2 grid grid-cols-7 gap-1"
            >
              {weekdays.map((day, index) => (
                <span
                  key={day}
                  className="py-2 text-center text-sm text-muted"
                  aria-label={day}
                >
                  {shortWeekdays[index]}
                </span>
              ))}
              {Array.from({ length: firstOffset }, (_, index) => (
                <span key={`blank-${index}`} aria-hidden="true" />
              ))}
              {Array.from({ length: days }, (_, index) => {
                const day = `${month}-${String(index + 1).padStart(2, "0")}`;
                const entries = entriesForDay(records, day);
                const average = averageMood(entries);
                const isToday = day === today;
                const content = (
                  <>
                    <span className="text-sm font-semibold">{index + 1}</span>
                    {average ? (
                      <span className="flex flex-col items-center">
                        <MoodShape mood={average} small />
                        <span className="text-xs">{average}</span>
                      </span>
                    ) : (
                      <span aria-hidden="true" className="text-muted">
                        ·
                      </span>
                    )}
                  </>
                );
                const cellClass = `flex min-h-20 min-w-0 flex-col items-center justify-start gap-1 rounded-control border py-2 ${isToday ? "border-action bg-primary/10" : "border-line"}`;
                return day > today ? (
                  <span
                    key={day}
                    className={`${cellClass} border-transparent text-muted`}
                    aria-label={`${fullDate.format(parseDayKey(day)!)}, fecha futura`}
                  >
                    <span className="text-sm">{index + 1}</span>
                  </span>
                ) : (
                  <Link
                    key={day}
                    href={`/calendario/${day}`}
                    className={`${cellClass} hover:bg-primary/10`}
                    aria-current={isToday ? "date" : undefined}
                    aria-label={`${fullDate.format(parseDayKey(day)!)}${isToday ? ", hoy" : ""}, ${average ? `${entries.length} ${entries.length === 1 ? "registro" : "registros"}, promedio ${average} de 7, ${moods[average - 1].label}` : "sin registros"}`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
            <p className="text-muted">
              El punto indica un día sin registros. Tocá una fecha para ver el
              detalle.
            </p>
            {!records.length && (
              <p className="text-muted">
                Tu calendario está vacío. Los registros que guardes aparecerán
                acá.
              </p>
            )}
            <MoodLegend />
            <HistoryActions />
          </>
        )}
      </HistoryGate>
    </section>
  );
}

export function DayView({ dayKey }: { dayKey: string }) {
  const { records, ready } = useHistory();
  const date = parseDayKey(dayKey)!;
  const today = ready ? localDayKey(new Date()) : null;
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  const entries = entriesForDay(records, dayKey);
  return (
    <section className="space-y-6 px-6 py-6">
      <Link
        href={`/calendario?mes=${dayKey.slice(0, 7)}`}
        className={textAction}
      >
        Volver al calendario
      </Link>
      <h1 className={title}>{fullDate.format(date)}</h1>
      <HistoryGate>
        {today && dayKey > today ? (
          <p role="status">
            Fecha no disponible. Podés consultar los días hasta hoy.
          </p>
        ) : (
          <>
            <nav
              aria-label="Cambiar día"
              className="flex flex-wrap justify-between gap-2"
            >
              {localDayKey(previous) >= "0001-01-01" && (
                <Link
                  href={`/calendario/${localDayKey(previous)}`}
                  className={textAction}
                >
                  Día anterior
                </Link>
              )}
              {today && dayKey < today && (
                <Link
                  href={`/calendario/${localDayKey(next)}`}
                  className={textAction}
                >
                  Día siguiente
                </Link>
              )}
            </nav>
            {entries.length ? (
              <>
                <DaySummary entries={entries} />
                <RecordList entries={entries} />
              </>
            ) : (
              <p className="text-muted">
                No hay registros de este día. Podés explorar otras fechas o
                registrar cómo te sentís ahora.
              </p>
            )}
            <MoodLegend />
            <HistoryActions />
          </>
        )}
      </HistoryGate>
    </section>
  );
}
