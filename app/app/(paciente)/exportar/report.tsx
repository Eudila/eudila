// SPDX-License-Identifier: AGPL-3.0-only
import { localDayKey, type RecordEntry } from "@eudila/domain/records.ts";
import { moods } from "@eudila/mood/moods.js";
import MoodOrb from "@eudila/mood/orb.tsx";
import {
  formatDay,
  formatTime,
  summarize,
  type Period,
} from "@eudila/domain/export.ts";

// Plain <img>, not next/image: lazy loading could leave the logo blank in print.
function Logo({ size }: { size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/logo-mascota.svg" width={size} height={size} alt="" />
  );
}

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
  const days = Map.groupBy(summary.chronology, (record) =>
    localDayKey(record.recordedAt),
  );
  const maxMood = Math.max(1, ...summary.distribution.map((d) => d.count));
  return (
    <article className="history-report" aria-labelledby="report-title">
      <header className="report-header">
        <p className="report-brand font-display font-bold tracking-wordmark">
          <Logo size={56} />
          <span>eudila</span>
        </p>
        <h2
          id="report-title"
          className="font-display text-question leading-question font-bold tracking-brand"
        >
          Resumen de registros
        </h2>
        <p className="report-period font-display font-semibold">
          {formatDay(period.start)} al {formatDay(period.end)} · Ambas fechas
          incluidas.
        </p>
        <p className="text-muted">
          {records.some((record) => record.source === "account")
            ? "Historial de tu cuenta."
            : "Vista previa. No representa el historial de una cuenta."}{" "}
          Generado el {formatDay(localDayKey(generatedAt))} a las{" "}
          {formatTime(generatedAt.toISOString())} (
          {Intl.DateTimeFormat().resolvedOptions().timeZone}).
        </p>
      </header>
      <section aria-labelledby="report-summary">
        <h3 id="report-summary">Cantidad de registros</h3>
        <ul className="report-stats">
          <li>
            <strong>{summary.chronology.length}</strong>{" "}
            {summary.chronology.length === 1 ? "registro" : "registros"}
          </li>
          <li>
            <strong>{summary.recordedDays}</strong>{" "}
            {summary.recordedDays === 1 ? "día" : "días"} con al menos un
            registro
          </li>
          <li>
            <strong>{summary.missingDays.length}</strong>{" "}
            {summary.missingDays.length === 1 ? "día" : "días"} sin registro
          </li>
        </ul>
        <p className="report-note">
          Las fechas y horas corresponden a la zona horaria local indicada
          arriba. Los conteos describen los datos seleccionados y no contienen
          una interpretación clínica.
        </p>
      </section>
      <section aria-labelledby="report-distribution">
        <h3 id="report-distribution">Distribución de la escala</h3>
        <div
          className="report-scroll"
          role="region"
          aria-labelledby="report-distribution"
          tabIndex={0}
        >
          <table className="report-scale">
            <thead>
              <tr>
                <th scope="col">Valor y etiqueta</th>
                <th scope="col">
                  <span className="sr-only">Proporción</span>
                </th>
                <th scope="col">Registros</th>
              </tr>
            </thead>
            <tbody>
              {summary.distribution.map((item) => (
                <tr key={item.value}>
                  <th scope="row">
                    <span className="report-orb-label">
                      <MoodOrb level={item.value} compact className="size-7" />
                      {item.value} de 7 · {item.label}
                    </span>
                  </th>
                  <td aria-hidden="true">
                    <span
                      className="report-bar"
                      style={{
                        width: `${(item.count / maxMood) * 100}%`,
                        background: `var(--color-mood-${item.value})`,
                      }}
                    />
                  </td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="report-chronology">
        <h3 id="report-chronology">Cronología</h3>
        <ol className="report-days">
          {[...days].map(([day, entries]) => (
            <li key={day}>
              <h4>{formatDay(day)}</h4>
              <ol className="report-records">
                {entries.map((record) => (
                  <li
                    key={record.id}
                    style={{
                      borderColor: `var(--color-mood-${record.mood})`,
                    }}
                  >
                    <MoodOrb
                      level={record.mood}
                      compact
                      className="size-10 shrink-0"
                    />
                    <div>
                      <p>
                        <strong>{formatTime(record.recordedAt)}</strong> ·
                        Registro {record.type}
                      </p>
                      <p>
                        <span
                          className="report-mood"
                          style={{
                            background: `var(--color-mood-${record.mood}-ambient)`,
                          }}
                        >
                          {record.mood} de 7 · {moods[record.mood - 1].label}
                        </span>
                      </p>
                      <p>Emoción: {record.emotion.nombre}</p>
                      <p>
                        Factores:{" "}
                        {record.factors.length
                          ? record.factors
                              .map((factor) => factor.nombre)
                              .join(" · ")
                          : "Sin factores seleccionados"}
                      </p>
                      <p className="text-muted">
                        Origen:{" "}
                        {record.source === "example"
                          ? "Ejemplo"
                          : record.source === "account"
                            ? "Registro de tu cuenta"
                            : "Registro de vista previa"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="report-emotions">
        <h3 id="report-emotions">Emociones seleccionadas</h3>
        {summary.emotions.length ? (
          <CountTable items={summary.emotions} label="Emoción" />
        ) : (
          <p>No hay emociones específicas seleccionadas.</p>
        )}
        <h3>Alternativas para nombrar la emoción</h3>
        <p className="report-note">
          Se cuentan por separado y se conservan en la cronología.
        </p>
        {summary.alternatives.length ? (
          <CountTable items={summary.alternatives} label="Alternativa" />
        ) : (
          <p>No se seleccionaron estas alternativas.</p>
        )}
      </section>
      <section aria-labelledby="report-factors">
        <h3 id="report-factors">Factores seleccionados</h3>
        <p className="report-note">
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
      <footer className="report-footer">
        <Logo size={28} />
        <p>
          Este informe describe selecciones registradas; no ofrece diagnósticos
          ni recomendaciones de salud.
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
