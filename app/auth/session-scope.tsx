// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { authConfigured } from "./config";
import { authClient } from "./client";
import { HistoryProvider } from "../historial/state";
import { RegistroProvider } from "../registro/registro";

export default function SessionScope({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState("initial");
  useEffect(() => {
    if (!authConfigured) return;
    const {
      data: { subscription },
    } = authClient().auth.onAuthStateChange((event, session) => {
      const id = session?.user.id ?? "guest";
      try {
        const previous = sessionStorage.getItem("eudila-draft-owner");
        if (previous !== id && (previous !== null || id !== "guest")) {
          sessionStorage.removeItem("eudila-draft-v1");
          sessionStorage.removeItem("eudila-preview-records-v1");
        }
        sessionStorage.setItem("eudila-draft-owner", id);
      } catch {
        // Los providers conservan su aviso cuando el navegador bloquea storage.
      }
      setIdentity(id);
      if (
        event === "SIGNED_OUT" &&
        ["/cuenta", "/empezar", "/actualizar-clave", "/"].includes(
          window.location.pathname,
        )
      ) {
        window.location.replace("/bienvenida");
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  return (
    <HistoryProvider key={identity}>
      <RegistroProvider>{children}</RegistroProvider>
    </HistoryProvider>
  );
}
