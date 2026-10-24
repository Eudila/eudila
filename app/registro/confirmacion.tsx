// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDraft } from "./registro";
import { useCatalog } from "./emociones";
import { useHistory } from "../historial/state";
import type { RecordEntry } from "../historial/records";
import { moods } from "../../prototype/moods.js";
import MoodOrb from "../mood/orb";

// Hoy reads this once, on the client navigation after saving, for Guardado.
let justSaved: number | null = null;
const markSaved = (mood: number) => {
  justSaved = mood;
};
export const savedMood = () => justSaved;
export const clearSaved = () => {
  justSaved = null;
};

export default function Confirmacion() {
  const { draft, discard } = useDraft();
  const history = useHistory();
  const emotions = useCatalog("emociones");
  const factors = useCatalog("factores_vida");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<{ fingerprint: string; entry: RecordEntry } | null>(
    null,
  );
  const inFlight = useRef(false);
  const router = useRouter();
  const emotion = emotions.rows.find((row) => row.id === draft.emotionId);
  const selectedFactors = factors.rows.filter((row) =>
    draft.factors.includes(row.id),
  );
  const complete =
    !!draft.type &&
    !!emotion &&
    selectedFactors.length === draft.factors.length;
  const loading = emotions.status === "loading" || factors.status === "loading";

  async function save() {
    if (!complete || !history.ready || !history.preview || inFlight.current)
      return;
    inFlight.current = true;
    setSaving(true);
    setError(null);
    try {
      const fingerprint = JSON.stringify(draft);
      if (pending.current?.fingerprint !== fingerprint) {
        pending.current = {
          fingerprint,
          entry: {
            id: crypto.randomUUID(),
            recordedAt: new Date().toISOString(),
            type: draft.type!,
            mood: draft.mood,
            emotion: { id: emotion!.id, nombre: emotion!.nombre },
            factors: selectedFactors.map(({ id, nombre }) => ({ id, nombre })),
            source: "preview",
          },
        };
      }
      // Dejar que la interfaz anuncie el guardado antes de escribir almacenamiento.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      history.saveRecord(pending.current.entry);
      markSaved(draft.mood);
      discard();
      router.replace("/hoy");
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "No pudimos guardar. Tu borrador se conserva.",
      );
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      <dl className="stagger divide-y divide-line surface-card px-4">
        {[
          [
            "Momento",
            !draft.type
              ? "Falta elegir"
              : draft.type === "libre"
                ? "Registro libre"
                : draft.type[0].toUpperCase() + draft.type.slice(1),
            "tipo",
          ],
          [
            "Ánimo",
            `${moods[draft.mood - 1].label} · ${draft.mood} de 7`,
            "animo",
          ],
          ["Emoción", emotion?.nombre ?? "Falta elegir o cargar", "emocion"],
          [
            "Factores",
            draft.factors.length
              ? selectedFactors.map((row) => row.nombre).join(", ") ||
                "Falta cargar"
              : "Sin factores",
            "factores",
          ],
        ].map(([label, value, step]) => (
          <div key={step} className="flex items-center gap-3 py-2">
            <div className="min-w-0 flex-1 py-1">
              <dt className="text-muted">{label}</dt>
              <dd className="flex items-center gap-2 font-semibold">
                {step === "animo" && (
                  <MoodOrb
                    level={draft.mood}
                    compact
                    className="size-6 shrink-0"
                  />
                )}
                <span className="min-w-0">{value}</span>
              </dd>
            </div>
            <dd className="shrink-0">
              <Link
                href={`/registro/${step}`}
                className="action action-text -mr-3"
                // .action breaks anywhere for reflow; one short word must not split.
                style={{ overflowWrap: "normal" }}
              >
                Cambiar
                <span className="sr-only">
                  {" "}
                  {label.toLocaleLowerCase("es-AR")}
                </span>
              </Link>
            </dd>
          </div>
        ))}
      </dl>
      {loading && <p role="status">Cargando tu selección…</p>}
      {[emotions, factors].some((catalog) => catalog.status === "error") && (
        <button
          type="button"
          onClick={() => {
            emotions.retry();
            factors.retry();
          }}
          className="min-h-touch text-action underline"
        >
          Volver a cargar los catálogos
        </button>
      )}
      {!loading && !complete && (
        <p role="status">
          Completá los pasos pendientes o corregí las opciones que ya no están
          disponibles. Tu borrador se conserva.
        </p>
      )}
      {!history.preview && (
        <p role="status" className="text-muted">
          El guardado en tu cuenta todavía no está habilitado. Tu borrador se
          conserva en esta pestaña para que puedas seguir editándolo.
        </p>
      )}
      {history.problem && (
        <div role="status">
          <p>{history.problem}</p>
          <button
            type="button"
            onClick={history.retry}
            className="min-h-touch text-action underline"
          >
            Volver a leer el historial
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {history.preview && (
        <>
          <button
            type="button"
            onClick={save}
            disabled={!complete || !history.ready || saving}
            aria-busy={saving}
            className="action action-primary mt-auto"
          >
            <span className="action-label">
              <span
                className={saving || error ? "invisible" : undefined}
                aria-hidden={saving || !!error}
              >
                Guardar en vista previa
              </span>
              <span
                className={saving || !error ? "invisible" : undefined}
                aria-hidden={saving || !error}
              >
                Reintentar guardado
              </span>
              <span
                className={saving ? undefined : "invisible"}
                aria-hidden={!saving}
              >
                Guardando…
              </span>
            </span>
          </button>
        </>
      )}
    </>
  );
}
