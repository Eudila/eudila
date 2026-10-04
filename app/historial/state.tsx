// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { previewEnabled } from "../frontend-preview";
import { createExamples, restoreRecords, type RecordEntry } from "./records";

const storageKey = "eudila-preview-records-v1";
const HistoryContext = createContext<{
  records: RecordEntry[];
  ready: boolean;
  problem: string | null;
  preview: boolean;
  saveRecord: (entry: RecordEntry) => void;
  loadExamples: () => void;
  retry: () => void;
} | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const current = useRef<RecordEntry[]>([]);
  const blocked = useRef(true);

  function retry() {
    try {
      const restored = previewEnabled
        ? restoreRecords(sessionStorage.getItem(storageKey))
        : [];
      current.current = restored;
      blocked.current = false;
      setRecords(restored);
      setProblem(null);
    } catch {
      blocked.current = true;
      setProblem(
        "No pudimos leer el historial de esta pestaña. Conservamos los datos originales. Podés volver a intentar.",
      );
    }
    setReady(true);
  }

  useEffect(() => {
    // Restaurar almacenamiento externo solo después de hidratar el navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    retry();
  }, []);

  function persist(next: RecordEntry[]) {
    if (!previewEnabled)
      throw new Error("El guardado en tu cuenta todavía no está habilitado.");
    if (blocked.current)
      throw new Error(
        "Primero necesitamos recuperar el historial. Tu borrador se conserva.",
      );
    const validated = restoreRecords(JSON.stringify(next));
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(validated));
    } catch {
      const message =
        "No pudimos guardar en esta pestaña. Tu borrador se conserva; volvé a intentar.";
      setProblem(message);
      throw new Error(message);
    }
    current.current = validated;
    setRecords(validated);
    setProblem(null);
  }

  function saveRecord(entry: RecordEntry) {
    if (blocked.current)
      throw new Error(
        "Primero necesitamos recuperar el historial. Tu borrador se conserva.",
      );
    if (current.current.some((record) => record.id === entry.id)) return;
    persist([...current.current, entry]);
  }

  function loadExamples() {
    if (!current.current.length) persist(createExamples());
  }

  return (
    <HistoryContext
      value={{
        records,
        ready,
        problem,
        preview: previewEnabled,
        saveRecord,
        loadExamples,
        retry,
      }}
    >
      {children}
    </HistoryContext>
  );
}

export function useHistory() {
  const state = useContext(HistoryContext);
  if (!state) throw new Error("useHistory necesita HistoryProvider");
  return state;
}
