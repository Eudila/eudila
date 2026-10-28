// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  DEMO_TODAY,
  INVITATIONS,
  PATIENTS,
  POPULATION,
} from "@/lib/demo-data.ts";
import { useDemoInvitations } from "@/lib/demo-invitations.ts";
import {
  decimal,
  lastSeen,
  levelOf,
  normalizeText,
  overview,
  patientSummary,
  scalePercent,
  shortDay,
  signed,
  type Patient,
  type Range,
} from "@/lib/panel.ts";
import { Icon, Orb, PeriodToggle, stateName } from "./ui";

type Order = "baja" | "alta" | "reciente" | "nombre";
const ORDERS: { value: Order; label: string }[] = [
  { value: "baja", label: "Media más baja primero" },
  { value: "alta", label: "Media más alta primero" },
  { value: "reciente", label: "Último registro" },
  { value: "nombre", label: "Nombre" },
];

const TICKS = [1, 2, 3, 4, 5, 6, 7];

type Row = { patient: Patient } & ReturnType<typeof patientSummary>;

function lastKey(row: Row) {
  return row.last ? `${row.last.day} ${row.last.time}` : "";
}

function sortRows(rows: Row[], order: Order) {
  return [...rows].sort((a, b) => {
    if (order === "nombre")
      return a.patient.name.localeCompare(b.patient.name, "es");
    if (order === "reciente") return lastKey(b).localeCompare(lastKey(a));
    const diff = (a.average ?? 0) - (b.average ?? 0);
    return (
      (order === "baja" ? diff : -diff) || lastKey(b).localeCompare(lastKey(a))
    );
  });
}

function WeekBars({ points }: { points: Row["lastWeek"] }) {
  const label = points
    .map((point) =>
      point.average === null
        ? "sin registro"
        : decimal(point.average).replace(",0", ""),
    )
    .join(", ");
  return (
    <span role="img" aria-label={`Últimos 7 días: ${label}`} className="bars">
      {points.map((point) => (
        <span key={point.day} className="bar">
          {point.average !== null && (
            <span
              style={{
                height: `${((point.average / 7) * 32).toFixed(1)}px`,
                background: `var(--d-m${levelOf(point.average)})`,
              }}
            />
          )}
        </span>
      ))}
    </span>
  );
}

function PatientRow({ row, range }: { row: Row; range: Range }) {
  const { patient, average, count, last, lastWeek } = row;
  return (
    <li>
      <Link
        href={`/pacientes/${patient.id}?periodo=${range}`}
        className="cols patient-row"
      >
        <span className="who">
          <strong>{patient.name}</strong>
          {last && (
            <span className="who-meta">
              <Orb
                level={last.mood}
                size={22}
                label={stateName(last.mood)}
                style={{ margin: -3 }}
              />
              {lastSeen(last, DEMO_TODAY)}
            </span>
          )}
        </span>
        {average === null ? (
          <>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--d-muted)",
              }}
            >
              —<span className="sr-only">, sin registros en el período</span>
            </span>
            <span />
            <span />
          </>
        ) : (
          <>
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                <span className="sr-only">Media </span>
                {decimal(average)}
              </span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--d-muted)",
                  lineHeight: 1.2,
                }}
              >
                {signed(average - POPULATION.average)}
                <span className="sr-only"> frente a la población</span>
              </span>
            </span>
            <span
              aria-hidden="true"
              style={{ position: "relative", alignSelf: "stretch" }}
            >
              <Orb
                level={levelOf(average)}
                size={40}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${scalePercent(average).toFixed(3)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </span>
          </>
        )}
        {average === null ? null : <WeekBars points={lastWeek} />}
        <span
          style={{
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
            color: count ? undefined : "var(--d-muted)",
          }}
        >
          <span className="sr-only">Registros: </span>
          {count}
        </span>
        <Icon name="next" size={20} color="var(--d-muted)" />
      </Link>
    </li>
  );
}

export default function Patients({ initialRange }: { initialRange: Range }) {
  const router = useRouter();
  const [range, setRange] = useState<Range>(initialRange);
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order>("baja");
  const [resent, setResent] = useState<string[]>([]);
  const extra = useDemoInvitations();

  const changeRange = (next: Range) => {
    setRange(next);
    router.replace(`/?periodo=${next}`, { scroll: false });
  };

  const rows: Row[] = useMemo(
    () =>
      PATIENTS.map((patient) => ({
        patient,
        ...patientSummary(patient, DEMO_TODAY, range),
      })),
    [range],
  );
  const total = useMemo(() => overview(PATIENTS, DEMO_TODAY, range), [range]);

  const needle = normalizeText(query);
  const matches = (name: string) => normalizeText(name).includes(needle);
  const visible = rows.filter((row) => matches(row.patient.name));
  const active = sortRows(
    visible.filter((row) => row.count > 0),
    order,
  );
  const inactive = sortRows(
    visible.filter((row) => row.count === 0),
    "reciente",
  );
  const invitations = [...INVITATIONS, ...extra].filter(
    (invitation) => matches(invitation.name) || matches(invitation.email),
  );
  const shown = visible.length + invitations.length;
  const population = scalePercent(POPULATION.average);

  return (
    <main>
      <div className="page-head" style={{ marginTop: 48 }}>
        <h1 className="page-title">Tus pacientes</h1>
        <div className="head-actions">
          <PeriodToggle value={range} onChange={changeRange} />
          <Link href="/alta" className="button-fill">
            <Icon name="plus" strokeWidth={2.25} />
            Dar de alta
          </Link>
        </div>
      </div>

      <section
        aria-labelledby="lista"
        className="card"
        style={{ marginTop: 32 }}
      >
        <dl className="stats">
          <div>
            <dt>Media de tus pacientes</dt>
            <dd>
              <span className="stat-value">
                {total.average === null ? "—" : decimal(total.average)}
              </span>
            </dd>
          </div>
          <div>
            <dt>Media de la población</dt>
            <dd>
              <span className="stat-value">{decimal(POPULATION.average)}</span>
              <span aria-hidden="true" className="legend-pop" />
            </dd>
          </div>
          <div>
            <dt>Registros</dt>
            <dd>
              <span className="stat-value">{total.count}</span>
            </dd>
          </div>
        </dl>

        <div className="toolbar">
          <h2 id="lista">
            {shown === 1 ? "1 paciente" : `${shown} pacientes`}
          </h2>
          <div className="head-actions" style={{ gap: 8 }}>
            <label htmlFor="buscar" className="sr-only">
              Buscar paciente
            </label>
            <div className="search">
              <Icon name="search" strokeWidth={1.75} color="var(--d-muted)" />
              <input
                id="buscar"
                type="search"
                placeholder="Buscar"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <label htmlFor="orden" className="sr-only">
              Ordenar
            </label>
            <select
              id="orden"
              value={order}
              onChange={(event) => setOrder(event.target.value as Order)}
            >
              {ORDERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {shown === 0 ? (
          <p className="empty-state" role="status">
            Ningún paciente coincide con «{query.trim()}».
          </p>
        ) : (
          <div className="table-scroll">
            <div className="table-min">
              {active.length > 0 && (
                <div style={{ position: "relative" }}>
                  <div aria-hidden="true" className="cols grid-lines">
                    <span />
                    <span />
                    <span
                      style={{ position: "relative", alignSelf: "stretch" }}
                    >
                      {TICKS.map((tick) => (
                        <span
                          key={tick}
                          style={{
                            position: "absolute",
                            top: 64,
                            bottom: 0,
                            left: `${scalePercent(tick)}%`,
                            width: 1,
                            background: "var(--d-a07)",
                          }}
                        />
                      ))}
                      <span
                        style={{
                          position: "absolute",
                          top: 30,
                          bottom: 0,
                          left: `${population}%`,
                          borderLeft: "2px dashed var(--d-pop)",
                        }}
                      />
                    </span>
                  </div>
                  <div aria-hidden="true" className="cols cols-head">
                    <span>Paciente</span>
                    <span>Media</span>
                    <span style={{ position: "relative", height: "100%" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: `${population}%`,
                          top: 10,
                          transform: "translateX(-50%)",
                          whiteSpace: "nowrap",
                          color: "var(--d-text)",
                          fontWeight: 600,
                        }}
                      >
                        Población
                      </span>
                      {TICKS.map((tick) => (
                        <span
                          key={tick}
                          style={{
                            position: "absolute",
                            left: `${scalePercent(tick)}%`,
                            bottom: 0,
                            transform: "translateX(-50%)",
                          }}
                        >
                          {tick}
                        </span>
                      ))}
                    </span>
                    <span>Últimos 7 días</span>
                    <span style={{ textAlign: "right" }}>Registros</span>
                    <span />
                  </div>
                  <ul className="rows">
                    {active.map((row) => (
                      <PatientRow
                        key={row.patient.id}
                        row={row}
                        range={range}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {inactive.length > 0 && (
                <>
                  <h3 className="group-title">Sin registros</h3>
                  <ul className="rows">
                    {inactive.map((row) => (
                      <PatientRow
                        key={row.patient.id}
                        row={row}
                        range={range}
                      />
                    ))}
                  </ul>
                </>
              )}

              {invitations.length > 0 && (
                <>
                  <h3 className="group-title">Invitaciones</h3>
                  <ul className="rows">
                    {invitations.map((invitation, index) => {
                      const key = `${invitation.email}-${index}`;
                      const done = resent.includes(key);
                      return (
                        <li
                          key={key}
                          className="cols"
                          style={{
                            height: 80,
                            borderBottom:
                              index < invitations.length - 1
                                ? "1px solid var(--d-a08)"
                                : undefined,
                          }}
                        >
                          <span className="who">
                            <strong>{invitation.name}</strong>
                            <span
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--d-muted)",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {invitation.email}
                            </span>
                          </span>
                          <span
                            style={{
                              gridColumn: "2 / 4",
                              fontSize: "0.875rem",
                              color: "var(--d-muted)",
                            }}
                          >
                            Enviada el{" "}
                            {shortDay(invitation.sentDay).split(" ")[1]}
                          </span>
                          <span
                            style={{
                              gridColumn: "4 / 7",
                              justifySelf: "end",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <span role="status" className="sr-only">
                              {done
                                ? `Vista previa: no se envió ningún email a ${invitation.email}.`
                                : ""}
                            </span>
                            <button
                              type="button"
                              className="button-line"
                              style={{
                                minHeight: 44,
                                padding: "0 18px",
                                fontSize: "0.875rem",
                              }}
                              disabled={done}
                              onClick={() => setResent([...resent, key])}
                            >
                              {done ? "Reenviada" : "Reenviar"}
                            </button>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
