// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "../../ui";
import { loadCatalogRows } from "@/lib/catalog.js";
import {
  emotionAllowed,
  emotionOptions,
  emotionPath,
} from "@eudila/domain/catalog/rueda.ts";
import {
  previewEnabled,
  previewEmotions,
  previewFactors,
} from "../../frontend-preview";

type Emotion = { id: string; nombre: string; sugerida?: boolean };
const config = {
  url: process.env.NEXT_PUBLIC_CATALOG_URL || "",
  anonKey: process.env.NEXT_PUBLIC_CATALOG_ANON_KEY || "",
};

function searchable(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es-AR");
}

export function useCatalog(table: "emociones" | "factores_vida") {
  const [rows, setRows] = useState<Emotion[]>(
    previewEnabled
      ? table === "emociones"
        ? previewEmotions
        : previewFactors
      : [],
  );
  const [status, setStatus] = useState(
    previewEnabled
      ? "ready"
      : config.url && config.anonKey
        ? "loading"
        : "unavailable",
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (previewEnabled || !config.url || !config.anonKey) return;
    const controller = new AbortController();
    loadCatalogRows(table, config, controller.signal).then(
      (items) => {
        if (controller.signal.aborted) return;
        setRows(items);
        setStatus(items.length ? "ready" : "empty");
      },
      () => {
        if (!controller.signal.aborted) setStatus("error");
      },
    );
    return () => controller.abort();
  }, [attempt, table]);

  function retry() {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }
  return { rows, status, retry };
}

export default function Emociones({
  selectedId,
  mood,
  choose,
}: {
  selectedId: string | null;
  mood: number;
  choose: (id: string | null) => void;
}) {
  const { rows, status, retry } = useCatalog("emociones");
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const question = useRef<HTMLHeadingElement>(null);
  const focusQuestion = useRef(false);
  const selected = rows.find((row) => String(row.id) === selectedId);
  const path = emotionPath(selectedId);
  const optionIds = emotionOptions(selectedId, mood);
  const options = optionIds.flatMap((id) =>
    rows.filter((row) => row.id === id),
  );
  const incomplete = options.length !== optionIds.length;
  const specific = path.length === 3;
  const found = rows.filter(
    (row) =>
      emotionAllowed(row.id, mood) &&
      searchable(row.nombre).includes(searchable(query.trim())),
  );
  const button = "control-choice emotion-choice text-left";

  useEffect(() => {
    if (focusQuestion.current) {
      question.current?.focus();
      focusQuestion.current = false;
    }
  }, [selectedId]);

  function goTo(id: string | null) {
    focusQuestion.current = true;
    choose(id);
  }

  function select(row: Emotion) {
    if (dialog.current?.open) {
      choose(row.id);
      dialog.current.close();
    } else {
      goTo(row.id);
    }
  }

  return (
    <>
      {status !== "ready" ? (
        <div className="flex flex-col gap-3">
          <p role="status" className="text-muted">
            {status === "loading"
              ? "Cargando emociones…"
              : status === "error"
                ? "No se pudo cargar el catálogo. Tu borrador se conserva."
                : status === "empty"
                  ? "El catálogo está vacío. Tu borrador se conserva."
                  : "El catálogo de emociones todavía no está disponible. Tu borrador se conserva; podés volver y cambiar el ánimo."}
          </p>
          {(status === "error" || status === "empty") && (
            <button
              type="button"
              className="action action-secondary"
              onClick={retry}
            >
              Volver a intentar
            </button>
          )}
        </div>
      ) : (
        <>
          {path.length > 0 && (
            <nav aria-label="Tu recorrido emocional">
              <ol className="flex flex-wrap items-center gap-x-2">
                {path.map((id, index) => (
                  <li key={id} className="inline-flex items-center gap-2">
                    {index > 0 && <span aria-hidden="true">›</span>}
                    <button
                      type="button"
                      className="min-h-touch text-action underline"
                      aria-label={`Cambiar ${rows.find((row) => row.id === id)?.nombre ?? "emoción"}`}
                      onClick={() => goTo(index === 0 ? null : path[index - 1])}
                    >
                      {rows.find((row) => row.id === id)?.nombre ??
                        "Emoción no disponible"}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h2 ref={question} tabIndex={-1} className="text-title font-semibold">
            {path.length === 1
              ? options.length > 6
                ? "¿Qué emoción se acerca más a lo que sentís?"
                : `Dentro de ${selected?.nombre.toLocaleLowerCase("es-AR") ?? "esta familia"}, ¿qué se acerca más?`
              : path.length === 2
                ? "¿Qué sentimiento se acerca más?"
                : specific
                  ? "Así describís lo que sentís"
                  : "¿A qué se parece más?"}
          </h2>
          <div
            role="group"
            aria-label={
              path.length === 1
                ? "Emociones relacionadas"
                : path.length >= 2
                  ? "Sentimientos relacionados"
                  : "Emociones sugeridas"
            }
            className="stagger flex flex-wrap gap-2"
          >
            {options.map((row) => (
              <button
                key={row.id}
                type="button"
                className={button}
                aria-pressed={String(row.id) === selectedId}
                onClick={() => select(row)}
              >
                {row.nombre}
              </button>
            ))}
          </div>
          {incomplete && (
            <div role="status" className="text-muted">
              <p>
                Faltan opciones de esta rueda. Tu elección se conserva; podés
                reintentar o buscar otra palabra.
              </p>
              <button
                type="button"
                className="min-h-touch text-action underline"
                onClick={retry}
              >
                Volver a cargar la rueda
              </button>
            </div>
          )}
          {selected && path.length === 0 && <p>Elegiste: {selected.nombre}</p>}
          <button
            ref={origin}
            type="button"
            className="action action-text -mx-3 self-start"
            onClick={() => {
              setQuery("");
              dialog.current?.showModal();
              search.current?.focus();
            }}
          >
            <Icon name="plus" />
            Ver todas las emociones
          </button>
          <p role="status" aria-atomic="true" className="sr-only">
            {selected
              ? `Elegiste: ${selected.nombre}`
              : selectedId
                ? "La emoción que habías elegido ya no está disponible. Elegí otra para continuar."
                : "Elegí una emoción para continuar."}
          </p>
          {selected && (specific || path.length === 0) && (
            <Link
              href="/registro/factores"
              className="action action-primary mt-auto"
            >
              Siguiente
            </Link>
          )}
        </>
      )}
      <dialog
        ref={dialog}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.currentTarget.close();
          }
        }}
        onClose={() => origin.current?.focus()}
        aria-labelledby="emotion-title"
        className="m-auto max-h-full max-w-phone overflow-y-auto rounded-dialog bg-surface p-6 text-text backdrop:bg-graphite/50"
        style={{ width: "calc(100% - var(--spacing) * 12)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="emotion-title"
            className="font-display text-question font-bold"
          >
            Todas las emociones
          </h2>
          <button
            type="button"
            className="min-h-touch text-action underline"
            onClick={() => dialog.current?.close()}
          >
            Cerrar lista
          </button>
        </div>
        <label htmlFor="emotion-search" className="mt-6 block">
          Buscar emoción
        </label>
        <input
          ref={search}
          id="emotion-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-2 min-h-touch w-full rounded-field border border-line bg-surface px-3 py-2"
        />
        <p role="status" className="mt-3 text-muted">
          {found.length
            ? `${found.length} resultados`
            : "No hay resultados para esa búsqueda."}
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {found.map((row) => (
            <button
              key={row.id}
              type="button"
              className={button}
              aria-pressed={String(row.id) === selectedId}
              onClick={() => select(row)}
            >
              {row.nombre}
            </button>
          ))}
        </div>
      </dialog>
    </>
  );
}
