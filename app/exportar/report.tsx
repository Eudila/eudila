// SPDX-License-Identifier: AGPL-3.0-only
import { localDayKey, type RecordEntry } from "../historial/records";
import { moods } from "../../prototype/moods.js";
import { formatDay, formatTime, summarize, type Period } from "./export";

export default function Report({
  records,
  period,
  generatedAt,
}: {
  records: RecordEntry[];
  period: Period;
  generatedAt: Date;
}) {
  const summary = summarize(records, period);
  return (
    <article className="history-report" aria-labelledby="report-title">
      <header>
        <p className="font-semibold">eudila · Vista previa</p>
        <h2 id="report-title" className="font-display text-question font-bold">
          Resumen de registros
        </h2>
        <p>
          {formatDay(period.start)} al {formatDay(period.end)} · Ambas fechas
          incluidas.
        </p>
        <p>
          Generado el {formatDay(localDayKey(generatedAt))} a las{" "}
          {formatTime(generatedAt.toISOString())} (
          {Intl.DateTimeFormat().resolvedOptions().timeZone}).
        </p>
      </header>
      <section aria-labelledby="report-summary">
        <h3 id="report-summary">Cantidad de registros</h3>
        <p>
          {summary.chronology.length}{" "}
          {summary.chronology.length === 1 ? "registro" : "registros"} ·{" "}
          {summary.recordedDays} {summary.recordedDays === 1 ? "día" : "días"}{" "}
          con al menos un registro · {summary.missingDays.length}{" "}
          {summary.missingDays.length === 1 ? "día" : "días"} sin registro.
        </p>
        <p>
          Las fechas y horas corresponden a la zona horaria local indicada
          arriba. Los conteos describen los datos seleccionados y no contienen
          una interpretación clínica.
        </p>
      </section>
      <section aria-labelledby="report-chronology">
        <h3 id="report-chronology">Cronología</h3>
        <ol className="report-records">
          {summary.chronology.map((record) => (
            <li key={record.id}>
              <p>
                <strong>
                  {formatDay(localDayKey(record.recordedAt))} ·{" "}
                  {formatTime(record.recordedAt)}
                </strong>{" "}
                · Registro {record.type}
              </p>
              <p>
                Ánimo: {record.mood} de 7 · {moods[record.mood - 1].label}
              </p>
              <p>Emoción: {record.emotion.nombre}</p>
              <p>
                Factores:{" "}
                {record.factors.length
                  ? record.factors.map((factor) => factor.nombre).join(" · ")
                  : "Sin factores seleccionados"}
              </p>
              <p>
                Origen:{" "}
                {record.source === "example"
                  ? "Ejemplo"
                  : "Registro de vista previa"}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="report-distribution">
        <h3 id="report-distribution">Distribución de la escala</h3>
        <table>
          <thead>
            <tr>
              <th scope="col">Valor y etiqueta</th>
              <th scope="col">Registros</th>
            </tr>
          </thead>
          <tbody>
            {summary.distribution.map((item) => (
              <tr key={item.value}>
                <th scope="row">
                  {item.value} de 7 · {item.label}
                </th>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section aria-labelledby="report-emotions">
        <h3 id="report-emotions">Emociones seleccionadas</h3>
        {summary.emotions.length ? (
          <CountTable items={summary.emotions} label="Emoción" />
        ) : (
          <p>No hay emociones específicas seleccionadas.</p>
        )}
        <h3>Alternativas para nombrar la emoción</h3>
        <p>Se cuentan por separado y se conservan en la cronología.</p>
        {summary.alternatives.length ? (
          <CountTable items={summary.alternatives} label="Alternativa" />
        ) : (
          <p>No se seleccionaron estas alternativas.</p>
        )}
      </section>
      <section aria-labelledby="report-factors">
        <h3 id="report-factors">Factores seleccionados</h3>
        <p>
          Un registro puede incluir varios factores; la suma puede superar la
          cantidad de registros.
        </p>
        {summary.factors.length ? (
          <CountTable items={summary.factors} label="Factor" />
        ) : (
          <p>No hay factores seleccionados.</p>
        )}
      </section>
      <section aria-labelledby="report-missing">
        <h3 id="report-missing">
          Días sin registro ({summary.missingDays.length})
        </h3>
        {summary.missingDays.length ? (
          <ul className="report-missing-days">
            {summary.missingDays.map((day) => (
              <li key={day}>{formatDay(day)}</li>
            ))}
          </ul>
        ) : (
          <p>Todos los días del período tienen al menos un registro.</p>
        )}
      </section>
      <footer>
        <p>
          Vista previa del frontend: incluye únicamente los registros y ejemplos
          de esta pestaña. No representa el historial de una cuenta. Este
          informe describe selecciones registradas; no ofrece diagnósticos ni
          recomendaciones de salud.
        </p>
      </footer>
    </article>
  );
}

function CountTable({
  items,
  label,
}: {
  items: { id: string; nombre: string; count: number }[];
  label: string;
}) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">{label}</th>
          <th scope="col">Registros</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <th scope="row">{item.nombre}</th>
            <td>{item.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
