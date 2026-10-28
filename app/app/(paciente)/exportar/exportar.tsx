// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useState } from "react";
import Link from "next/link";
import { useHistory } from "../historial/state";
import type { RecordEntry } from "@eudila/domain/records.ts";
import {
  exportFilename,
  formatDay,
  recordsCsv,
  recordsJson,
  reportPeriod,
  summarize,
  type PeriodChoice,
} from "@eudila/domain/export.ts";
import Report from "./report";
import { Disclosure, Icon } from "../../ui";
import "./exportar.css";

const actionClass = "action action-secondary";

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
  const [choice, setChoice] = useState<PeriodChoice>("7");
  const [generatedAt, setGeneratedAt] = useState(() => new Date());
  const [problem, setProblem] = useState<string | null>(null);
  const period = reportPeriod(records, choice, generatedAt);
  const summary = summarize(records, period);

  function download(format: "csv" | "json") {
    if (!records.length) return;
    let url: string | null = null;
    let anchor: HTMLAnchorElement | null = null;
    try {
      const content =
        format === "csv" ? recordsCsv(records) : recordsJson(records);
      url = URL.createObjectURL(
        new Blob([content], {
          type:
            format === "csv"
              ? "text/csv;charset=utf-8"
              : "application/json;charset=utf-8",
        }),
      );
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = exportFilename(generatedAt, format, preview);
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
    if (!summary.chronology.length) return;
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
            CSV y JSON incluyen todos los registros; el período del informe no
            modifica esas descargas. Para el PDF, elegí «Guardar como PDF» en la
            ventana de impresión.
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
              onClick={() => download("csv")}
            >
              <Icon name="download" />
              Descargar CSV
            </button>
            <button
              type="button"
              disabled={!records.length}
              className={actionClass}
              onClick={() => download("json")}
            >
              <Icon name="download" />
              Descargar JSON
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
            className="min-h-touch w-full rounded-field border border-line bg-surface px-3 py-3"
            onChange={(event) => {
              setChoice(event.target.value as PeriodChoice);
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
          </select>
          <p className="text-muted">
            {formatDay(period.start)} al {formatDay(period.end)}
          </p>
          <p role="status">
            {summary.chronology.length}{" "}
            {summary.chronology.length === 1 ? "registro" : "registros"} en el
            período.
          </p>
          {!summary.chronology.length && records.length > 0 && (
            <p>
              No hay registros en este período. Elegí otro período para preparar
              el informe.
            </p>
          )}
          <button
            type="button"
            disabled={!summary.chronology.length}
            className={actionClass}
            onClick={printReport}
          >
            <Icon name="printer" />
            Imprimir / guardar PDF
          </button>
        </section>
        {problem && <p role="alert">{problem}</p>}
      </div>
      {!!summary.chronology.length && (
        <Report records={records} period={period} generatedAt={generatedAt} />
      )}
    </>
  );
}
