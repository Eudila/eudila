// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import { useId } from "react";
import { moods } from "../../prototype/moods.js";
import { formatDay } from "../exportar/export";
import { parseDayKey } from "../historial/records";
import { type analysis } from "./data";

export type Series = ReturnType<typeof analysis>;
export function formatAverage(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
const shortDate = (day: string) =>
  parseDayKey(day)!.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "numeric",
  });

export function DailyChart({ series }: { series: Series }) {
  const id = useId();
  const x = (day: string) =>
    38 +
    (series.days.findIndex((point) => point.day === day) /
      Math.max(1, series.days.length - 1)) *
      284;
  const y = (value: number) => 20 + ((7 - value) / 6) * 156;
  const observed = series.days.filter((point) => point.average !== null);
  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-3">
      <h2 id={`${id}-heading`} className="font-semibold">
        Promedios diarios de ánimo
      </h2>
      <svg
        viewBox="0 0 340 220"
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        className="w-full text-graphite"
      >
        <title id={`${id}-title`}>Promedios diarios de ánimo</title>
        <desc id={`${id}-desc`}>
          Escala de 1 a 7. Cada punto representa el promedio de un día con
          registros. Las fechas avanzan de izquierda a derecha. Los días sin
          registros no tienen punto. Los datos completos están en la tabla
          siguiente.
        </desc>
        {Array.from({ length: 7 }, (_, index) => index + 1).map((value) => (
          <g key={value}>
            <line
              x1="38"
              x2="322"
              y1={y(value)}
              y2={y(value)}
              stroke="currentColor"
              opacity="0.15"
            />
            <text
              x="24"
              y={y(value) + 4}
              textAnchor="end"
              fontSize="12"
              fill="currentColor"
            >
              {value}
            </text>
          </g>
        ))}
        {series.segments.map((segment) => (
          <line
            key={segment.from.day}
            data-series-segment="true"
            data-from={segment.from.day}
            data-to={segment.to.day}
            x1={x(segment.from.day)}
            x2={x(segment.to.day)}
            y1={y(segment.from.average!)}
            y2={y(segment.to.average!)}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
        {observed.map((point) => (
          <circle
            key={point.day}
            data-day={point.day}
            cx={x(point.day)}
            cy={y(point.average!)}
            r="4"
            fill="var(--color-surface)"
            stroke="currentColor"
            strokeWidth="2"
          >
            <title>
              {formatDay(point.day)}: {formatAverage(point.average!)} de 7,{" "}
              {point.count} registros
            </title>
          </circle>
        ))}
        <text
          x="38"
          y="202"
          textAnchor="start"
          fontSize="12"
          fill="currentColor"
        >
          {shortDate(series.period.start)}
        </text>
        <text
          x="322"
          y="202"
          textAnchor="end"
          fontSize="12"
          fill="currentColor"
        >
          {shortDate(series.period.end)}
        </text>
      </svg>
      <p className="text-muted">
        Los puntos muestran promedios diarios. Un espacio sin punto indica un
        día sin registros; no equivale a un ánimo cero.
      </p>
      <p className="text-muted">
        {series.lineEnabled
          ? "Las líneas unen únicamente días consecutivos con registros. Los espacios sin datos quedan abiertos."
          : "Mostramos puntos separados: las líneas se habilitan a partir de 14 registros en al menos 7 días distintos dentro del rango."}
      </p>
      <details className="rounded-control border border-line p-3">
        <summary className="min-h-touch cursor-pointer py-2 font-semibold text-action">
          Cómo se muestra el gráfico
        </summary>
        <p className="pt-3 text-muted">
          El promedio diario se muestra con un decimal. Los registros originales
          están disponibles debajo. Las líneas se habilitan con 14 registros en
          al menos 7 días distintos dentro del rango y unen solamente días
          consecutivos con datos. Los datos describen tus elecciones; no
          permiten concluir causas ni patrones.
        </p>
        <ol className="mt-3 space-y-2">
          {moods.map((mood, index) => (
            <li key={mood.label}>
              {index + 1} · {mood.label}
            </li>
          ))}
        </ol>
      </details>
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="pb-3 text-left font-semibold">
          Datos por día
        </caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="w-1/2 py-2 pr-3">
              Fecha
            </th>
            <th scope="col" className="py-2">
              Datos
            </th>
          </tr>
        </thead>
        <tbody>
          {series.days.map((point) => (
            <tr key={point.day} className="border-b border-line align-top">
              <th scope="row" className="py-3 pr-3 font-normal">
                <Link
                  className="inline-flex min-h-touch items-center text-action underline"
                  href={`/calendario/${point.day}`}
                >
                  {formatDay(point.day)}
                </Link>
              </th>
              <td className="py-3">
                {point.average === null ? (
                  "Sin registros"
                ) : (
                  <>
                    <span className="block">
                      Promedio {formatAverage(point.average)} de 7
                    </span>
                    <span className="block text-muted">
                      {point.count}{" "}
                      {point.count === 1 ? "registro" : "registros"}
                    </span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
