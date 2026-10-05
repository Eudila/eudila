// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadCatalogRows } from "@/prototype/catalog.js";
import {
  previewEnabled,
  previewEmotions,
  previewFactors,
} from "../frontend-preview";

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
  choose,
}: {
  selectedId: string | null;
  choose: (id: string) => void;
}) {
  const { rows, status, retry } = useCatalog("emociones");
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const selected = rows.find((row) => String(row.id) === selectedId);
  const found = rows.filter((row) =>
    searchable(row.nombre).includes(searchable(query.trim())),
  );
  const button = "control-choice text-left";

  function select(row: Emotion) {
    choose(String(row.id));
    dialog.current?.close();
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
          <div
            role="group"
            aria-label="Emociones sugeridas"
            className="flex flex-wrap gap-3"
          >
            {rows
              .filter((row) => row.sugerida)
              .map((row) => (
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
          <button
            ref={origin}
            type="button"
            className="min-h-touch text-left text-action underline"
            onClick={() => {
              setQuery("");
              dialog.current?.showModal();
              search.current?.focus();
            }}
          >
            Ver todas las emociones
          </button>
          <p role="status" aria-atomic="true">
            {selected
              ? `Elegiste: ${selected.nombre}`
              : selectedId
                ? "La emoción que habías elegido ya no está disponible. Elegí otra para continuar."
                : "Elegí una emoción para continuar."}
          </p>
          {selected && (
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
          <h2 id="emotion-title" className="text-question font-bold">
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
