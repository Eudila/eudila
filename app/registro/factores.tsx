// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { useDraft } from "./registro";
import { useCatalog } from "./emociones";

export default function Factores() {
  const { draft, update } = useDraft();
  const { rows, status, retry } = useCatalog("factores_vida");
  const unavailableSelections = draft.factors.filter(
    (id) => !rows.some((row) => row.id === id),
  );
  const canContinue =
    draft.type &&
    draft.emotionId &&
    (status === "ready" || status === "empty") &&
    !unavailableSelections.length;

  return (
    <>
      <p className="text-muted">
        Podés elegir varios factores o continuar sin elegir ninguno.
      </p>
      {status === "ready" && (
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">
            Factores de vida, selección opcional
          </legend>
          {rows.map((row) => (
            <label
              key={row.id}
              className="control-choice flex items-center gap-3"
            >
              <input
                type="checkbox"
                checked={draft.factors.includes(row.id)}
                className="size-5 shrink-0 accent-action"
                onChange={(event) =>
                  update({
                    ...draft,
                    factors: event.target.checked
                      ? [...draft.factors, row.id]
                      : draft.factors.filter((id) => id !== row.id),
                  })
                }
              />
              {row.nombre}
            </label>
          ))}
        </fieldset>
      )}
      {status !== "ready" && (
        <p role="status" className="text-muted">
          {status === "loading"
            ? "Cargando factores…"
            : status === "empty"
              ? "Todavía no hay factores disponibles. Podés continuar sin elegir ninguno."
              : status === "error"
                ? "No pudimos cargar los factores. Tu borrador se conserva."
                : "El catálogo de factores todavía no está disponible. Tu borrador se conserva."}
        </p>
      )}
      {(status === "error" || status === "empty") && (
        <button
          type="button"
          onClick={retry}
          className="min-h-touch text-action underline"
        >
          Volver a intentar
        </button>
      )}
      {(status === "ready" || status === "empty") &&
        unavailableSelections.length > 0 && (
          <div role="status">
            <p>
              Algunos factores elegidos ya no están disponibles. Quitalos para
              continuar.
            </p>
            <button
              type="button"
              className="min-h-touch text-action underline"
              onClick={() =>
                update({
                  ...draft,
                  factors: draft.factors.filter((id) =>
                    rows.some((row) => row.id === id),
                  ),
                })
              }
            >
              Quitar factores no disponibles
            </button>
          </div>
        )}
      {!draft.type || !draft.emotionId ? (
        <Link
          href={!draft.type ? "/registro/tipo" : "/registro/emocion"}
          className="min-h-touch text-action underline"
        >
          Completá los pasos anteriores
        </Link>
      ) : null}
      {canContinue && (
        <Link
          href="/registro/confirmacion"
          className="action action-primary mt-auto"
        >
          Revisar registro
        </Link>
      )}
    </>
  );
}
