// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Invitaciones que se «envían» desde la vista previa. No salen del navegador:
 * viven en sessionStorage para que aparezcan en la lista mientras dure la
 * pestaña. No se manda ningún email.
 */
import { useMemo, useSyncExternalStore } from "react";
import type { Invitation } from "./panel.ts";

const KEY = "eudila-panel-demo-invitaciones";
const CHANGE = "eudila-panel-demo-invitaciones";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE, callback);
  };
}

function readRaw() {
  try {
    return sessionStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parse(raw: string): Invitation[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is Invitation =>
        !!item &&
        typeof item.name === "string" &&
        typeof item.email === "string" &&
        typeof item.sentDay === "string",
    );
  } catch {
    return [];
  }
}

export function useDemoInvitations(): Invitation[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  return useMemo(() => parse(raw), [raw]);
}

export function saveDemoInvitation(invitation: Invitation) {
  try {
    const list = [...parse(readRaw()), invitation].slice(-20);
    sessionStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGE));
  } catch {
    // Sin almacenamiento (modo privado): la invitación solo se confirma.
  }
}
