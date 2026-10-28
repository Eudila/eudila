// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEMO_TODAY, POPULATION, findPatient } from "@/lib/demo-data.ts";
import {
  STATES,
  axisDay,
  calendarMonth,
  daily,
  decimal,
  emotionCounts,
  factorGroups,
  monthName,
  monthOf,
  patientSummary,
  periodDays,
  plural,
  recordWhen,
  shiftMonth,
  shortDay,
  stateShares,
  toCsv,
  type DayPoint,
  type FactorGroup,
  type PanelRecord,
  type Range,
} from "@/lib/panel.ts";
import { Icon, Orb, PeriodToggle, stateName } from "../../ui";

const W = 1120;
const H = 296;
const X0 = 40;
const X1 = 1104;
const y = (value: number) => 16 + (7 - value) * 40;
const LEVELS = [1, 2, 3, 4, 5, 6, 7];

function sentence(parts: string[]) {
  const text = parts.join(", ");
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

function dayText(point: DayPoint) {
  if (point.average === null)
    return { value: "Sin registros", sub: "", short: "Sin registros" };
  const count = plural(point.count, "registro", "registros");
  return {
    value: `Promedio ${decimal(point.average)} de 7`,
    sub: `${STATES[Math.round(point.average) - 1]} · ${count}`,
    short: `${decimal(point.average)} · ${count}`,
  };
}

function Evolution({
  points,
  average,
}: {
  points: DayPoint[];
  average: number | null;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const n = points.length;
  const x = (i: number) => X0 + (i / (n - 1)) * (X1 - X0);
  const pct = (value: number, total: number) => (value / total) * 100;
  const step = n <= 7 ? 1 : n <= 31 ? 7 : 14;
  const ticks = points
    .map((_, i) => i)
    .filter((i) => i === n - 1 || (i % step === 0 && i <= n - 1 - step / 2));
  const radius = n > 31 ? 3.5 : 5;
  const segments: string[] = [];
  for (let i = 1; i < n; i++) {
    const a = points[i - 1].average;
    const b = points[i].average;
    if (a !== null && b !== null)
      segments.push(
        `M${x(i - 1).toFixed(1)} ${y(a).toFixed(1)}L${x(i).toFixed(1)} ${y(b).toFixed(1)}`,
      );
  }
  const shown = hover ?? n - 1;
  const point = points[shown];
  const tip = dayText(point);
  const tipLeft = pct(x(shown), W);
  const column = pct((X1 - X0) / (n - 1), W);
  const population = POPULATION.average;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        aria-hidden="true"
        style={{ display: "block", height: "auto", overflow: "visible" }}
      >
        {average !== null && (
          <rect
            x={X0}
            y={Math.min(y(population), y(average))}
            width={X1 - X0}
            height={Math.abs(y(population) - y(average))}
            fill="var(--d-band)"
          />
        )}
        <g stroke="var(--d-a08)" strokeWidth="1">
          {LEVELS.map((level) => (
            <line key={level} x1={X0} x2={X1} y1={y(level)} y2={y(level)} />
          ))}
        </g>
        <g fill="var(--d-muted)" fontSize="13">
          {ticks.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={286}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            >
              {axisDay(points[i].day)}
            </text>
          ))}
        </g>
        <line
          x1={X0}
          x2={X1}
          y1={y(population)}
          y2={y(population)}
          stroke="var(--d-muted)"
          strokeWidth="2"
          strokeDasharray="1 5"
          strokeLinecap="round"
        />
        {average !== null && (
          <line
            x1={X0}
            x2={X1}
            y1={y(average)}
            y2={y(average)}
            stroke="var(--d-action)"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
        )}
        <path
          d={segments.join("")}
          fill="none"
          stroke="var(--d-text)"
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g stroke="var(--d-ring)" strokeWidth="2.5">
          {points.map((item, i) =>
            item.average === null ? null : (
              <circle
                key={item.day}
                cx={x(i).toFixed(1)}
                cy={y(item.average).toFixed(1)}
                r={radius}
                fill={`var(--d-m${Math.round(item.average)})`}
              />
            ),
          )}
        </g>
      </svg>
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {LEVELS.map((level) => (
          <Orb
            key={level}
            level={level}
            size={28}
            style={{
              position: "absolute",
              left: `${pct(16, W)}%`,
              top: `${pct(y(level), H)}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "5.41%",
            bottom: "13.51%",
            width: 1,
            background: "var(--d-cross)",
            pointerEvents: "none",
            left: `${tipLeft}%`,
          }}
        />
        {point.average !== null && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "2px solid var(--d-text)",
              boxSizing: "border-box",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              left: `${tipLeft}%`,
              top: `${pct(y(point.average), H)}%`,
            }}
          />
        )}
        {points.map((item, i) => {
          const text = dayText(item);
          return (
            <button
              key={item.day}
              type="button"
              className="chart-hit"
              aria-label={`${shortDay(item.day)}: ${text.value}${text.sub ? `, ${text.sub}` : ""}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onBlur={() => setHover(null)}
              style={{
                left: `${(pct(x(i), W) - column / 2).toFixed(2)}%`,
                width: `${column.toFixed(2)}%`,
              }}
            />
          );
        })}
        <div
          aria-hidden="true"
          className="tooltip"
          style={{ left: `${Math.min(88, Math.max(8, tipLeft))}%` }}
        >
          <span style={{ color: "var(--d-muted)" }}>{shortDay(point.day)}</span>
          <strong style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
            {tip.value}
          </strong>
          {tip.sub && (
            <span style={{ color: "var(--d-muted)" }}>{tip.sub}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Calendar({ records }: { records: PanelRecord[] }) {
  const current = monthOf(DEMO_TODAY);
  const earliest = monthOf(records[0]?.day ?? DEMO_TODAY);
  const [view, setView] = useState(current);
  const index = (m: { year: number; month: number }) => m.year * 12 + m.month;
  const prev = shiftMonth(view.year, view.month, -1);
  const next = shiftMonth(view.year, view.month, 1);
  const weeks = calendarMonth(records, view.year, view.month, DEMO_TODAY);
  const atStart = index(view) <= index(earliest);
  const atEnd = index(view) >= index(current);

  return (
    <section aria-labelledby="calendario" className="card">
      <div className="card-head" style={{ paddingRight: 12 }}>
        <h2 id="calendario">Calendario</h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            type="button"
            className="icon-button"
            aria-label={monthName(prev.month)}
            disabled={atStart}
            onClick={() => setView(prev)}
          >
            <Icon name="back" />
          </button>
          <span
            aria-live="polite"
            style={{
              fontSize: "0.9375rem",
              minWidth: "7.5rem",
              textAlign: "center",
            }}
          >
            {monthName(view.month)} {view.year}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label={monthName(next.month)}
            disabled={atEnd}
            onClick={() => setView(next)}
          >
            <Icon name="next" />
          </button>
        </div>
      </div>
      <div style={{ flex: "1 1 auto", padding: 24 }}>
        <table className="calendar">
          <caption className="sr-only">
            Estado promedio de cada día de {monthName(view.month).toLowerCase()}
          </caption>
          <thead>
            <tr>
              {[
                ["L", "lunes"],
                ["M", "martes"],
                ["M", "miércoles"],
                ["J", "jueves"],
                ["V", "viernes"],
                ["S", "sábado"],
                ["D", "domingo"],
              ].map(([short, long]) => (
                <th key={long} scope="col">
                  <abbr title={long}>{short}</abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, w) => (
              <tr key={w}>
                {week.map((cell, d) =>
                  cell.kind === "blank" ? (
                    <td key={d} />
                  ) : (
                    <td key={d}>
                      <span className="calendar-day">
                        {cell.level !== null ? (
                          <Orb
                            level={cell.level}
                            size={44}
                            label={stateName(cell.level)}
                          />
                        ) : (
                          <span className="calendar-slot">
                            {!cell.future && (
                              <span className="calendar-empty" />
                            )}
                          </span>
                        )}
                        <span
                          className={cell.today ? "calendar-today" : undefined}
                          style={cell.future ? { opacity: 0.6 } : undefined}
                        >
                          {cell.date}
                          {cell.today && <span className="sr-only">, hoy</span>}
                          {cell.level === null && !cell.future && (
                            <span className="sr-only">, sin registros</span>
                          )}
                        </span>
                      </span>
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function States({
  records,
  firstName,
}: {
  records: PanelRecord[];
  firstName: string;
}) {
  const shares = stateShares(records);
  const population = POPULATION.shares;
  const max = Math.max(
    50,
    Math.ceil(Math.max(...shares, ...population) / 10) * 10,
  );
  return (
    <section aria-labelledby="estados" className="card">
      <div className="card-head">
        <h2 id="estados">Estados</h2>
        <div aria-hidden="true" className="legend">
          <span>
            <span
              style={{
                width: 8,
                height: 14,
                borderRadius: 4,
                background: "var(--d-muted)",
              }}
            />
            {firstName}
          </span>
          <span>
            <span
              style={{
                width: 14,
                height: 2,
                borderRadius: 1,
                background: "var(--d-text)",
              }}
            />
            Población
          </span>
        </div>
      </div>
      <div aria-hidden="true" className="states">
        {LEVELS.map((level, i) => (
          <div key={level} className="state-col">
            <span
              style={{
                fontSize: "0.875rem",
                fontVariantNumeric: "tabular-nums",
                color: shares[i] ? undefined : "var(--d-muted)",
              }}
            >
              {shares[i]} %
            </span>
            <div className="state-track">
              {shares[i] > 0 && (
                <div
                  className="state-fill"
                  style={{
                    height: `${(shares[i] / max) * 100}%`,
                    background: `var(--d-m${level})`,
                  }}
                />
              )}
              <div
                className="state-pop"
                style={{
                  bottom: `${(population[i] / max) * 100}%`,
                  boxShadow:
                    population[i] < shares[i]
                      ? "0 0 0 1.5px var(--d-ring)"
                      : undefined,
                }}
              />
            </div>
            <Orb level={level} size={40} />
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>
          Porcentaje de registros en cada estado: {firstName} y población
        </caption>
        <thead>
          <tr>
            <th scope="col">Estado</th>
            <th scope="col">{firstName}</th>
            <th scope="col">Población</th>
          </tr>
        </thead>
        <tbody>
          {LEVELS.map((level, i) => (
            <tr key={level}>
              <th scope="row">{STATES[i]}</th>
              <td>{shares[i]} %</td>
              <td>{population[i]} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function FactorRow({
  group,
  max,
  muted,
}: {
  group: FactorGroup;
  max: number;
  muted?: boolean;
}) {
  const parts = LEVELS.filter((level) => group.distribution[level - 1] > 0);
  return (
    <li>
      <div className={`meter-label${muted ? " meter-muted" : ""}`}>
        <span>{group.name}</span>
        <span>{group.count}</span>
      </div>
      <div
        role="img"
        aria-label={sentence(
          parts.map(
            (level) =>
              `${STATES[level - 1].toLowerCase()} ${group.distribution[level - 1]}`,
          ),
        )}
        className="meter-stack"
        style={{ width: `${((group.count / max) * 100).toFixed(1)}%` }}
      >
        {parts.map((level) => (
          <span
            key={level}
            style={{
              flex: `${group.distribution[level - 1]} 1 0`,
              background: `var(--d-m${level})`,
            }}
          />
        ))}
      </div>
    </li>
  );
}

function Factors({ records }: { records: PanelRecord[] }) {
  const { groups, without } = factorGroups(records);
  const max = Math.max(1, groups[0]?.count ?? 0, without.count);
  return (
    <section aria-labelledby="factores" className="card">
      <div className="card-head">
        <h2 id="factores">Factores</h2>
      </div>
      {records.length === 0 ? (
        <p className="empty-card">Sin registros en este período.</p>
      ) : (
        <ul className="meters">
          {groups.map((group) => (
            <FactorRow key={group.name} group={group} max={max} />
          ))}
          {without.count > 0 && <FactorRow group={without} max={max} muted />}
        </ul>
      )}
    </section>
  );
}

function Emotions({ records }: { records: PanelRecord[] }) {
  const { top, others } = emotionCounts(records);
  const max = Math.max(1, top[0]?.count ?? 0, others);
  return (
    <section aria-labelledby="emociones" className="card">
      <div className="card-head">
        <h2 id="emociones">Emociones</h2>
      </div>
      {records.length === 0 ? (
        <p className="empty-card">Sin registros en este período.</p>
      ) : (
        <ol className="meters">
          {top.map((item) => (
            <li key={item.name}>
              <div className="meter-label">
                <span>{item.name}</span>
                <span>{item.count}</span>
              </div>
              <div
                aria-hidden="true"
                className="meter-bar"
                style={{ width: `${((item.count / max) * 100).toFixed(1)}%` }}
              />
            </li>
          ))}
          {others > 0 && (
            <li>
              <div className="meter-label meter-muted">
                <span>Otras</span>
                <span>{others}</span>
              </div>
              <div
                aria-hidden="true"
                className="meter-bar"
                style={{
                  width: `${((others / max) * 100).toFixed(1)}%`,
                  background: "var(--d-dis)",
                }}
              />
            </li>
          )}
        </ol>
      )}
    </section>
  );
}

function Recent({
  records,
  firstName,
}: {
  records: PanelRecord[];
  firstName: string;
}) {
  const [all, setAll] = useState(false);
  const newest = [...records].reverse();
  const rows = all ? newest : newest.slice(0, 5);
  return (
    <section
      aria-labelledby="recientes"
      className="card"
      style={{ marginTop: 24 }}
    >
      <div className="card-head">
        <h2 id="recientes">Recientes</h2>
        {records.length > 5 && (
          <button
            type="button"
            className="link-button"
            aria-expanded={all}
            aria-controls="tabla-recientes"
            onClick={() => setAll(!all)}
          >
            {all ? "Ver menos" : `Ver los ${records.length}`}
          </button>
        )}
      </div>
      {records.length === 0 ? (
        <p className="empty-card">Sin registros en este período.</p>
      ) : (
        <div className="table-scroll">
          <table id="tabla-recientes" className="records">
            <caption className="sr-only">
              {all ? "Registros del período" : "Últimos registros"} de{" "}
              {firstName}
            </caption>
            <thead>
              <tr>
                <th scope="col" style={{ width: "22%" }}>
                  Cuándo
                </th>
                <th scope="col" style={{ width: "28%" }}>
                  Estado
                </th>
                <th scope="col" style={{ width: "22%" }}>
                  Emoción
                </th>
                <th scope="col">Factores</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((record) => (
                <tr key={`${record.day}-${record.time}`}>
                  <td
                    style={{
                      color: "var(--d-muted)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {recordWhen(record, DEMO_TODAY)}
                  </td>
                  <td>
                    <span className="state-cell">
                      <Orb
                        level={record.mood}
                        size={36}
                        style={{ margin: "-4px 0" }}
                      />
                      {stateName(record.mood)}
                    </span>
                  </td>
                  <td>{record.emotion}</td>
                  <td style={{ color: "var(--d-muted)" }}>
                    {record.factors.length ? record.factors.join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function Ficha({
  patientId,
  initialRange,
}: {
  patientId: string;
  initialRange: Range;
}) {
  const router = useRouter();
  const patient = findPatient(patientId)!;
  const [range, setRange] = useState<Range>(initialRange);
  const summary = useMemo(
    () => patientSummary(patient, DEMO_TODAY, range),
    [patient, range],
  );
  const points = useMemo(
    () => daily(summary.records, periodDays(DEMO_TODAY, range)),
    [summary, range],
  );

  // En pantallas angostas el gráfico se desplaza: mostrar primero lo más reciente.
  const chart = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chart.current) chart.current.scrollLeft = chart.current.scrollWidth;
  }, [range]);

  const changeRange = (next: Range) => {
    setRange(next);
    router.replace(`/pacientes/${patient.id}?periodo=${next}`, {
      scroll: false,
    });
  };

  const exportCsv = () => {
    const blob = new Blob([`﻿${toCsv(summary.records)}\n`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ejemplo-eudila-${patient.id}-${range}-dias.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <Link href={`/?periodo=${range}`} className="back">
        <Icon name="back" />
        Pacientes
      </Link>
      <div className="page-head" style={{ marginTop: 4 }}>
        <h1 className="page-title">{patient.name}</h1>
        <div className="head-actions">
          <PeriodToggle value={range} onChange={changeRange} />
          <button type="button" className="button-line" onClick={exportCsv}>
            <Icon name="download" />
            Exportar
          </button>
        </div>
      </div>

      <section
        aria-labelledby="diario"
        className="card"
        style={{ marginTop: 32 }}
      >
        <h2 id="diario" className="sr-only">
          Promedios diarios de ánimo
        </h2>
        <dl className="stats stats-bordered">
          <div>
            <dt>Media de {patient.firstName}</dt>
            <dd>
              <span className="stat-value">
                {summary.average === null ? "—" : decimal(summary.average)}
              </span>
              {summary.average !== null && (
                <span aria-hidden="true" className="legend-dash" />
              )}
            </dd>
          </div>
          <div>
            <dt>Población</dt>
            <dd>
              <span className="stat-value">{decimal(POPULATION.average)}</span>
              <span aria-hidden="true" className="legend-dots" />
            </dd>
          </div>
          <div>
            <dt>Período anterior</dt>
            <dd>
              <span className="stat-value">
                {summary.previous === null ? "—" : decimal(summary.previous)}
              </span>
            </dd>
          </div>
          <div>
            <dt>Registros</dt>
            <dd>
              <span className="stat-value">{summary.count}</span>
            </dd>
          </div>
        </dl>

        <div ref={chart} className="chart-wrap">
          <div className="chart-inner">
            <p className="sr-only">
              Escala de 1 a 7, de muy desagradable a muy agradable. Cada punto
              es el promedio de un día con registros.
            </p>
            <Evolution points={points} average={summary.average} />
          </div>
        </div>

        <details className="days-detail">
          <summary>Ver los datos por día</summary>
          <ul>
            {points.map((point) => (
              <li key={point.day}>
                <span style={{ color: "var(--d-text)" }}>
                  {shortDay(point.day)}
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {dayText(point).short}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <div className="panels">
        <Calendar records={patient.records} />
        <States records={summary.records} firstName={patient.firstName} />
        <Factors records={summary.records} />
        <Emotions records={summary.records} />
      </div>

      <Recent records={summary.records} firstName={patient.firstName} />
    </main>
  );
}
