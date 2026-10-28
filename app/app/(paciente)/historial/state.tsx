// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { previewEnabled } from "../../frontend-preview";
import { authConfigured } from "../../auth/config";
import { authClient } from "../../auth/client";
import { loadAccountRecords, saveAccountRecord } from "./account";
import {
  createExamples,
  restoreRecords,
  type RecordEntry,
} from "@eudila/domain/records.ts";

const storageKey = "eudila-preview-records-v1";
const HistoryContext = createContext<{
  records: RecordEntry[];
  ready: boolean;
  problem: string | null;
  preview: boolean;
  available: boolean;
  saveRecord: (entry: RecordEntry) => Promise<RecordEntry>;
  loadExamples: () => void;
  retry: () => void;
} | null>(null);

export function HistoryProvider({
  children,
  identity,
}: {
  children: React.ReactNode;
  identity: string;
}) {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const current = useRef<RecordEntry[]>([]);
  const blocked = useRef(true);
  const generation = useRef(0);
  const userId =
    authConfigured && !["initial", "guest"].includes(identity)
      ? identity
      : null;
  const available = previewEnabled || !!userId;

  async function retry() {
    if (!previewEnabled && authConfigured && identity === "initial") return;
    const request = ++generation.current;
    blocked.current = true;
    setReady(false);
    try {
      const restored = previewEnabled
        ? restoreRecords(sessionStorage.getItem(storageKey))
        : userId
          ? await loadAccountRecords(authClient(), userId)
          : [];
      if (request !== generation.current) return;
      current.current = restored;
      blocked.current = false;
      setRecords(restored);
      setProblem(null);
    } catch {
      if (request !== generation.current) return;
      blocked.current = true;
      setProblem(
        previewEnabled
          ? "No pudimos leer el historial de esta pestaña. Conservamos los datos originales. Podés volver a intentar."
          : "No pudimos leer el historial de tu cuenta. Tus registros se conservan. Podés volver a intentar.",
      );
    }
    setReady(true);
  }

  useEffect(() => {
    // Restaurar almacenamiento externo solo después de hidratar el navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    retry();
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
    };
    // SessionScope remonta este provider cuando cambia la identidad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next: RecordEntry[]) {
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

  async function saveRecord(entry: RecordEntry): Promise<RecordEntry> {
    if (blocked.current)
      throw new Error(
        "Primero necesitamos recuperar el historial. Tu borrador se conserva.",
      );
    const existing = current.current.find((record) => record.id === entry.id);
    if (existing) return existing;
    if (previewEnabled) {
      persist([...current.current, entry]);
      return entry;
    }
    if (!userId)
      throw new Error("Ingresá a tu cuenta para guardar el registro.");
    const request = generation.current;
    try {
      const saved = await saveAccountRecord(authClient(), userId, entry);
      if (request !== generation.current)
        throw new Error("La sesión cambió durante el guardado.");
      current.current = [
        ...current.current.filter((record) => record.id !== saved.id),
        saved,
      ];
      setRecords(current.current);
      return saved;
    } catch {
      throw new Error(
        "No pudimos guardar en tu cuenta. Tu borrador se conserva; volvé a intentar.",
      );
    }
  }

  function loadExamples() {
    if (previewEnabled && !current.current.length) persist(createExamples());
  }

  return (
    <HistoryContext
      value={{
        records,
        ready,
        problem,
        preview: previewEnabled,
        available,
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
