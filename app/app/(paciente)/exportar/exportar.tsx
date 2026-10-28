// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useState } from "react";
import Link from "next/link";
import { useHistory } from "../historial/state";
import { parseDayKey, type RecordEntry } from "@eudila/domain/records.ts";
import {
  exportFilename,
  formatDay,
  recordsCsv,
  reportPeriod,
  summarize,
  type Period,
  type PeriodChoice,
} from "@eudila/domain/export.ts";
import Report from "./report";
import { Disclosure, Icon } from "../../ui";
import "./exportar.css";

const actionClass = "action action-secondary";
const fieldClass =
  "min-h-touch w-full rounded-field border border-line bg-surface px-3 py-3";

export default function Exportar() {
  const { records, ready, available, problem, retry } = useHistory();
  return (
    <div className="export-page space-y-6 px-6 py-8">
      <div className="export-controls space-y-3">
        <h1 className="font-display text-question leading-question font-bold tracking-brand">
          Exportar
        </h1>
      </div>
      {!ready ? (
        <p role="status">Preparando tus registros…</p>
      ) : !available ? (
        <p>Ingresá a tu cuenta para exportar tus registros.</p>
      ) : problem ? (
        <div role="alert" className="space-y-3">
          <p>{problem}</p>
          <button type="button" className={actionClass} onClick={retry}>
            Reintentar lectura
          </button>
        </div>
      ) : (
        <ExportControls records={records} />
      )}
    </div>
  );
}

function ExportControls({ records }: { records: RecordEntry[] }) {
  const { preview } = useHistory();
  const [choice, setChoice] = useState<PeriodChoice | "custom">("7");
  const [range, setRange] = useState<Period>({ start: "", end: "" });
  const [generatedAt, setGeneratedAt] = useState(() => new Date());
  const [problem, setProblem] = useState<string | null>(null);
  // Custom dates stay inside the whole history, so the day list stays bounded.
  const history = reportPeriod(records, "all", generatedAt);
  const rangeValid =
    !!parseDayKey(range.start) &&
    !!parseDayKey(range.end) &&
    range.start <= range.end &&
    range.start >= history.start &&
    range.end <= history.end;
  const period =
    choice === "custom"
      ? rangeValid
        ? range
        : null
      : reportPeriod(records, choice, generatedAt);
  const summary = period && summarize(records, period);
  const count = summary?.chronology.length ?? 0;

  function download() {
    if (!records.length) return;
    let url: string | null = null;
    let anchor: HTMLAnchorElement | null = null;
    try {
      url = URL.createObjectURL(
        new Blob([recordsCsv(records)], { type: "text/csv;charset=utf-8" }),
      );
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = exportFilename(generatedAt, "csv", preview);
      document.body.append(anchor);
      anchor.click();
      setProblem(null);
    } catch {
      setProblem(
        "No pudimos preparar la descarga. Tus registros se conservan; volvé a intentar.",
      );
    } finally {
      anchor?.remove();
      // Dar al navegador tiempo para comenzar la descarga antes de revocar.
      if (url) {
        const downloadUrl = url;
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }
    }
  }

  function printReport() {
    if (!count) return;
    const previousTitle = document.title;
    try {
      document.title = exportFilename(generatedAt, "pdf", preview).replace(
        /\.pdf$/,
        "",
      );
      window.print();
      setProblem(null);
    } catch {
      setProblem(
        "No pudimos abrir la impresión. Volvé a intentar desde este navegador.",
      );
    } finally {
      document.title = previousTitle;
    }
  }

  return (
    <>
      <div className="export-controls space-y-6">
        <Disclosure summary="Privacidad y alcance">
          <p>Los archivos se preparan en tu navegador.</p>
          <p>
            Los archivos y el informe contienen información personal. Guardalos
            en un lugar seguro y elegí con quién compartirlos.
          </p>
          <p>
            El CSV incluye todos los registros; el período del informe no lo
            modifica. Para el PDF, elegí «Guardar como PDF» en la ventana de
            impresión.
          </p>
        </Disclosure>
        {!records.length && (
          <div className="space-y-3">
            <p>
              No hay registros para exportar todavía. Completá un registro para
              ver el informe y habilitar las descargas.
            </p>
            <Link
              href="/registro/tipo"
              className="inline-flex min-h-touch items-center text-action underline"
            >
              Crear un registro
            </Link>
          </div>
        )}
        <section className="space-y-3" aria-labelledby="export-data-title">
          <h2 id="export-data-title" className="font-semibold">
            Descargar todos los registros
          </h2>
          <p className="text-muted">
            {records.length === 1
              ? "1 registro"
              : `${records.length} registros`}{" "}
            {preview ? "en esta pestaña" : "en tu cuenta"}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!records.length}
              className={actionClass}
              onClick={download}
            >
              <Icon name="download" />
              Descargar CSV
            </button>
          </div>
        </section>
        <section className="space-y-3" aria-labelledby="export-report-title">
          <h2 id="export-report-title" className="font-semibold">
            Informe por período
          </h2>
          <label htmlFor="report-period" className="block">
            Período del informe
          </label>
          <select
            id="report-period"
            value={choice}
            className={fieldClass}
            onChange={(event) => {
              const next = event.target.value as PeriodChoice | "custom";
              // Start the custom range from what was on screen.
              if (next === "custom" && period) setRange(period);
              setChoice(next);
              setGeneratedAt(new Date());
            }}
          >
            <option value="7">Últimos 7 días, incluido hoy</option>
            <option value="30">Últimos 30 días, incluido hoy</option>
            <option value="90">Últimos 90 días, incluido hoy</option>
            <option value="all">
              {preview
                ? "Todo el historial de esta pestaña"
                : "Todo el historial de tu cuenta"}
            </option>
            <option value="custom">Elegir fechas</option>
          </select>
          {choice === "custom" && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
              {(["start", "end"] as const).map((edge) => (
                <label key={edge} className="block space-y-1">
                  <span className="block">
                    {edge === "start" ? "Desde" : "Hasta"}
                  </span>
                  <input
                    type="date"
                    required
                    value={range[edge]}
                    min={
                      edge === "end" && range.start
                        ? range.start
                        : history.start
                    }
                    max={
                      edge === "start" && range.end ? range.end : history.end
                    }
                    aria-invalid={!rangeValid}
                    aria-describedby={
                      rangeValid ? undefined : "report-range-help"
                    }
                    className={fieldClass}
                    onChange={(event) => {
                      setRange({ ...range, [edge]: event.target.value });
                      setGeneratedAt(new Date());
                    }}
                  />
                </label>
              ))}
            </div>
          )}
          {period ? (
            <p className="text-muted">
              {formatDay(period.start)} al {formatDay(period.end)}
            </p>
          ) : (
            <p id="report-range-help">
              Elegí una fecha de inicio anterior o igual a la de fin, entre el{" "}
              {formatDay(history.start)} y el {formatDay(history.end)}.
            </p>
          )}
          <p role="status">
            {count} {count === 1 ? "registro" : "registros"} en el período.
          </p>
          {period && !count && records.length > 0 && (
            <p>
              No hay registros en este período. Elegí otro período para preparar
              el informe.
            </p>
          )}
          <button
            type="button"
            disabled={!count}
            className={actionClass}
            onClick={printReport}
          >
            <Icon name="printer" />
            Imprimir / guardar PDF
          </button>
        </section>
        {problem && <p role="alert">{problem}</p>}
      </div>
      {period && !!count && (
        <Report records={records} period={period} generatedAt={generatedAt} />
      )}
    </>
  );
}
