// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { moods } from "../../prototype/moods.js";
import { previewFactors } from "../frontend-preview";
import { formatDay, formatTime } from "../exportar/export";
import { localDayKey, type RecordEntry } from "../historial/records";
import { HistoryGate } from "../historial/views";
import { useHistory } from "../historial/state";
import {
  analysis,
  factorGroups,
  factorName,
  normalizeRange,
  type Range,
} from "./data";
import { DailyChart, type Series } from "./chart";

const title =
  "font-display text-question leading-question font-bold tracking-brand text-balance";
const linkClass =
  "inline-flex min-h-touch max-w-full items-center py-2 text-action underline";

function AnalysisNavigation({
  range,
  current,
}: {
  range: Range;
  current: "evolucion" | "factores";
}) {
  return (
    <nav
      aria-label="Explorar registros"
      className="flex flex-wrap gap-x-5 gap-y-2"
    >
      <Link
        href={`/evolucion?rango=${range}`}
        className={linkClass}
        aria-current={current === "evolucion" ? "page" : undefined}
      >
        Evolución
      </Link>
      <Link
        href={`/factores?rango=${range}`}
        className={linkClass}
        aria-current={current === "factores" ? "page" : undefined}
      >
        Factores de vida
      </Link>
    </nav>
  );
}

function RangeSelector({ range, path }: { range: Range; path: string }) {
  const router = useRouter();
  return (
    <div className="space-y-2">
      <label htmlFor="analysis-range" className="block font-semibold">
        Rango de tiempo
      </label>
      <select
        id="analysis-range"
        value={range}
        onChange={(event) =>
          router.push(`${path}?rango=${normalizeRange(event.target.value)}`, {
            scroll: false,
          })
        }
        className="min-h-touch w-full max-w-full rounded-field border border-line bg-surface px-3 py-2 text-text"
      >
        <option value="7">Últimos 7 días</option>
        <option value="30">Últimos 30 días</option>
        <option value="90">Últimos 90 días</option>
      </select>
    </div>
  );
}

function Counts({ series }: { series: Series }) {
  const days = series.days.filter((point) => point.count > 0).length;
  const total = series.chronology.length;
  return (
    <div className="space-y-2">
      <p className="text-muted">
        Del {formatDay(series.period.start)} al {formatDay(series.period.end)},
        inclusive. Fechas y horas locales de este dispositivo.
      </p>
      <p className="font-semibold">
        {total} {total === 1 ? "registro" : "registros"} en {days}{" "}
        {days === 1 ? "día" : "días"} con datos.
      </p>
      {series.exampleCount > 0 && (
        <p className="text-muted">
          Incluye {series.exampleCount}{" "}
          {series.exampleCount === 1
            ? "ejemplo ficticio"
            : "ejemplos ficticios"}
          .
        </p>
      )}
    </div>
  );
}

function EmptyRange({ factor = false }: { factor?: boolean }) {
  return (
    <div className="space-y-3 rounded-card border border-line p-4">
      <h2 className="font-semibold">Sin registros en este rango</h2>
      <p className="text-muted">
        {factor
          ? "No hay registros con este factor en las fechas seleccionadas. Podés elegir otro rango o consultar los demás factores."
          : "Los registros que guardes aparecerán acá. Podés elegir otro rango o registrar cómo te sentís cuando quieras."}
      </p>
      <Link href="/registro/tipo" className={linkClass}>
        Registrar cómo me siento
      </Link>
    </div>
  );
}

function Distribution({ values }: { values: number[] }) {
  return (
    <dl className="space-y-2">
      {moods.map((mood, index) => (
        <div
          key={mood.label}
          className="flex items-start justify-between gap-3"
        >
          <dt className="min-w-0">
            {index + 1} · {mood.label}
          </dt>
          <dd className="shrink-0 font-semibold">{values[index]}</dd>
        </div>
      ))}
    </dl>
  );
}

function OriginalRecords({ records }: { records: RecordEntry[] }) {
  return (
    <section aria-labelledby="original-records-title" className="space-y-3">
      <h2 id="original-records-title" className="font-semibold">
        Registros del período
      </h2>
      <ol className="space-y-3">
        {records.map((record) => (
          <li
            key={record.id}
            className="space-y-2 rounded-card border border-line p-4"
          >
            <Link
              href={`/calendario/${localDayKey(record.recordedAt)}`}
              className={linkClass}
            >
              {formatDay(localDayKey(record.recordedAt))}
            </Link>
            <p>
              <time dateTime={record.recordedAt}>
                {formatTime(record.recordedAt)}
              </time>{" "}
              ·{" "}
              {record.type === "libre"
                ? "Registro libre"
                : record.type[0].toUpperCase() + record.type.slice(1)}
            </p>
            <p className="font-semibold">
              {record.mood} de 7 · {moods[record.mood - 1].label}
            </p>
            <p>Emoción: {record.emotion.nombre}</p>
            <p>
              Factores:{" "}
              {record.factors.length
                ? record.factors.map((factor) => factor.nombre).join(" · ")
                : "Sin factores elegidos"}
            </p>
            <p className="text-muted">
              {record.source === "example"
                ? "Ejemplo ficticio"
                : "Registro de esta vista previa"}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EvolutionContent({ range }: { range: Range }) {
  const { records } = useHistory();
  const series = analysis(records, range, new Date());
  return (
    <>
      <RangeSelector range={range} path="/evolucion" />
      <Counts series={series} />
      {series.chronology.length ? (
        <>
          <DailyChart series={series} />
          <OriginalRecords records={series.chronology} />
        </>
      ) : (
        <EmptyRange />
      )}
    </>
  );
}

export function EvolutionView({ range }: { range: Range }) {
  return (
    <section className="space-y-6 px-4 py-6">
      <h1 className={title}>Evolución</h1>
      <p className="text-muted">
        Tus registros, reunidos por fecha. Podés consultar los promedios diarios
        y cada selección original.
      </p>
      <AnalysisNavigation range={range} current="evolucion" />
      <HistoryGate>
        <EvolutionContent range={range} />
      </HistoryGate>
    </section>
  );
}

function FactorsContent({ range }: { range: Range }) {
  const { records } = useHistory();
  const now = new Date();
  const series = analysis(records, range, now);
  const { groups, withoutFactors } = factorGroups(records, range, now);
  return (
    <>
      <RangeSelector range={range} path="/factores" />
      <Counts series={series} />
      <p className="text-muted">
        Un registro puede incluir varios factores y aparecer en más de un grupo.
        El orden refleja la cantidad de registros, no la importancia ni el
        efecto de un factor.
      </p>
      <p>
        {withoutFactors}{" "}
        {withoutFactors === 1
          ? "registro sin factores elegidos"
          : "registros sin factores elegidos"}
        .
      </p>
      {groups.length ? (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li
              key={group.id}
              className="space-y-3 rounded-card border border-line p-4"
            >
              <h2 className="font-semibold">
                <Link
                  href={`/factores/${group.id}?rango=${range}`}
                  className={linkClass}
                >
                  {group.nombre}
                </Link>
              </h2>
              <p>
                {group.count}{" "}
                {group.count === 1
                  ? "registro con este factor"
                  : "registros con este factor"}
                .
              </p>
              <h3 className="font-semibold">Cantidad por ánimo</h3>
              <Distribution values={group.distribution} />
            </li>
          ))}
        </ul>
      ) : series.chronology.length ? (
        <p className="text-muted">
          Ningún registro de este rango tiene factores elegidos. Elegirlos es
          opcional.
        </p>
      ) : (
        <EmptyRange />
      )}
    </>
  );
}

export function FactorsView({ range }: { range: Range }) {
  return (
    <section className="space-y-6 px-4 py-6">
      <h1 className={title}>Factores de vida</h1>
      <p className="text-muted">
        Consultá los factores que elegiste junto a tus registros. Los conteos
        describen esas selecciones.
      </p>
      <AnalysisNavigation range={range} current="factores" />
      <HistoryGate>
        <FactorsContent range={range} />
      </HistoryGate>
    </section>
  );
}

function FactorContent({ range, id }: { range: Range; id: string }) {
  const { records } = useHistory();
  const name =
    factorName(records, id) ??
    previewFactors.find((factor) => factor.id === id)?.nombre;
  const series = analysis(records, range, new Date(), id);
  const values = moods.map(
    (_, index) =>
      series.chronology.filter((record) => record.mood === index + 1).length,
  );
  return (
    <>
      <RangeSelector range={range} path={`/factores/${id}`} />
      {name ? (
        <>
          <Counts series={series} />
          <p className="text-muted">
            Estos registros incluyen el factor seleccionado. Su presencia no
            indica que haya causado el ánimo registrado.
          </p>
          {series.chronology.length ? (
            <>
              <section
                aria-labelledby="factor-distribution-title"
                className="space-y-3 rounded-card border border-line p-4"
              >
                <h2 id="factor-distribution-title" className="font-semibold">
                  Cantidad por ánimo
                </h2>
                <Distribution values={values} />
              </section>
              <DailyChart series={series} />
              <OriginalRecords records={series.chronology} />
            </>
          ) : (
            <EmptyRange factor />
          )}
        </>
      ) : (
        <p role="status">
          No encontramos este factor en el historial de esta pestaña ni en el
          catálogo de vista previa. Podés volver al listado para consultar los
          factores disponibles.
        </p>
      )}
    </>
  );
}

export function FactorView({ range, id }: { range: Range; id: string }) {
  const { records, ready, preview, problem } = useHistory();
  const name =
    ready && preview && !problem
      ? (factorName(records, id) ??
        previewFactors.find((factor) => factor.id === id)?.nombre ??
        "Factor no disponible")
      : "Detalle del factor";
  return (
    <section className="space-y-6 px-4 py-6">
      <Link href={`/factores?rango=${range}`} className={linkClass}>
        Volver a factores
      </Link>
      <h1 className={title}>{name}</h1>
      <AnalysisNavigation range={range} current="factores" />
      <HistoryGate>
        <FactorContent range={range} id={id} />
      </HistoryGate>
    </section>
  );
}
