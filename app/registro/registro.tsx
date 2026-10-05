// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  newDraft,
  restoreDraft,
  nextSteps as steps,
  types,
} from "@/prototype/flow-state.js";
import { moods } from "@/prototype/moods.js";
import MoodOrb from "../mood/orb";
import Emociones from "./emociones";
import Factores from "./factores";
import Confirmacion from "./confirmacion";
import type { Draft } from "../historial/records";
import { moodActionStyle } from "../actions";
export type { Draft } from "../historial/records";

const draftKey = "eudila-draft-v1";
const DraftContext = createContext<{
  draft: Draft;
  ready: boolean;
  persistent: boolean;
  moodInput: { position: number; animate: boolean };
  changeMood: (position: number, animate?: boolean) => void;
  update: (draft: Draft) => void;
  discard: () => void;
} | null>(null);

export function RegistroProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [moodInput, setMoodInput] = useState({ position: 4, animate: false });

  useEffect(() => {
    let restored = null;
    try {
      restored = restoreDraft(sessionStorage.getItem(draftKey));
    } catch {
      // Sincronizar almacenamiento externo tras la hidratación del servidor.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPersistent(false);
    }
    const initial = restored ?? newDraft();
    setDraft(initial);
    setMoodInput({ position: initial.mood, animate: false });
    setReady(true);
  }, []);

  function persist(next: Draft) {
    setDraft(next);
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(next));
    } catch {
      setPersistent(false);
    }
  }

  function update(next: Draft) {
    persist(next);
    if (next.mood !== draft.mood)
      setMoodInput({ position: next.mood, animate: false });
  }

  function changeMood(value: number, animate = false) {
    if (!Number.isFinite(value)) return;
    const position = Math.max(1, Math.min(7, value));
    setMoodInput({ position, animate });
    const mood = Math.round(position);
    if (mood !== draft.mood) persist({ ...draft, mood });
  }

  function discard() {
    setDraft(newDraft());
    setMoodInput({ position: 4, animate: false });
    try {
      sessionStorage.removeItem(draftKey);
    } catch {
      setPersistent(false);
    }
  }

  return (
    <DraftContext
      value={{
        draft,
        ready,
        persistent,
        moodInput,
        changeMood,
        update,
        discard,
      }}
    >
      {children}
    </DraftContext>
  );
}

export function useDraft() {
  const state = useContext(DraftContext);
  if (!state) throw new Error("useDraft necesita RegistroProvider");
  return state;
}

export default function Registro({ paso }: { paso: string }) {
  const state = useDraft();
  const { draft, ready, persistent, moodInput, changeMood, update, discard } =
    state;
  const scrubbing = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const title = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const index = steps.indexOf(paso);
  const mood = moods[draft.mood - 1];
  const action = "action action-primary";
  const textAction = "action action-text";
  const emotional = paso === "animo";
  const navigationAction = emotional ? "mood-navigation-control" : textAction;

  useEffect(() => {
    const finish = () => {
      scrubbing.current = false;
    };
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, []);

  function navigationIcon(direction: "back" | "close") {
    return (
      <span className="mood-navigation-symbol" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d={direction === "back" ? "M14 5l-7 7 7 7" : "M6 6l12 12M18 6L6 18"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  useEffect(() => {
    if (ready) title.current?.focus();
  }, [pathname, ready]);

  function close() {
    dialog.current?.showModal();
  }

  return (
    <section
      className={
        emotional
          ? "mood-screen relative flex flex-1 flex-col"
          : "relative flex flex-1 flex-col gap-6 px-6 py-6"
      }
    >
      <div
        className={
          emotional
            ? "mood-navigation"
            : "flex flex-wrap items-center justify-between gap-3"
        }
      >
        {index > 0 ? (
          <Link
            href={`/registro/${steps[index - 1]}`}
            className={navigationAction}
            aria-label={emotional ? "Volver" : undefined}
          >
            {emotional ? navigationIcon("back") : "Volver"}
          </Link>
        ) : (
          <button type="button" onClick={close} className={textAction}>
            Volver
          </button>
        )}
        <p className={emotional ? "mood-secondary" : "text-muted"}>
          Registro · {index + 1} de {steps.length}
        </p>
        <button
          type="button"
          onClick={close}
          className={navigationAction}
          aria-label="Cerrar registro"
        >
          {emotional ? navigationIcon("close") : "Cerrar"}
        </button>
      </div>
      <h1
        ref={title}
        tabIndex={-1}
        className={`font-display text-question leading-question font-bold tracking-brand text-balance ${emotional ? "mood-question" : ""}`}
      >
        {paso === "tipo"
          ? "¿A qué momento corresponde este registro?"
          : paso === "animo"
            ? "¿Cómo te sentís ahora?"
            : paso === "emocion"
              ? "¿Qué emoción describe mejor lo que sentís?"
              : paso === "factores"
                ? "¿Qué factores influyeron hoy?"
                : "Revisá tu registro"}
      </h1>
      {!ready ? (
        <p role="status">Preparando tu registro…</p>
      ) : (
        <>
          {!persistent && (
            <p
              role="status"
              className={emotional ? "mood-secondary" : "text-muted"}
            >
              El borrador sigue en esta pantalla, pero no podemos conservarlo si
              recargás o cerrás la pestaña.
            </p>
          )}
          {paso === "tipo" && (
            <>
              <p className="text-muted">
                Elegí el momento que querés registrar. Puede ser distinto de la
                hora actual.
              </p>
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">Momento del registro</legend>
                {types.map((type) => (
                  <label
                    key={type}
                    className="control-choice flex items-center gap-3"
                  >
                    <input
                      type="radio"
                      name="record-type"
                      value={type}
                      checked={draft.type === type}
                      onChange={() => update({ ...draft, type })}
                      className="size-5 shrink-0 accent-action"
                    />
                    {type === "libre"
                      ? "Registro libre"
                      : type[0].toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </fieldset>
              <p className="text-muted">
                Registro libre sirve para cualquier momento.
              </p>
              <button
                type="button"
                disabled={!draft.type}
                className={`${action} mt-auto`}
                onClick={() => router.push("/registro/animo")}
              >
                Siguiente
              </button>
            </>
          )}
          {paso === "animo" && (
            <>
              <MoodOrb
                level={draft.mood}
                animated
                className="mood-orb mx-auto h-auto max-w-full shrink-0"
              />
              <p
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="mood-state font-display text-center text-state font-bold"
              >
                {mood.label}
              </p>
              <div>
                <label htmlFor="mood-range" className="sr-only">
                  Estado de ánimo
                </label>
                <input
                  id="mood-range"
                  type="range"
                  min="1"
                  max="7"
                  step="any"
                  value={moodInput.position}
                  aria-valuetext={`${mood.label}, ${draft.mood} de 7`}
                  onPointerDown={() => {
                    scrubbing.current = true;
                  }}
                  onChange={(event) =>
                    changeMood(Number(event.target.value), !scrubbing.current)
                  }
                  onKeyDown={(event) => {
                    const position =
                      Math.abs(
                        moodInput.position - Math.round(moodInput.position),
                      ) < 1e-6
                        ? Math.round(moodInput.position)
                        : moodInput.position;
                    const choices: Record<string, number> = {
                      ArrowLeft: Math.ceil(position) - 1,
                      ArrowDown: Math.ceil(position) - 1,
                      ArrowRight: Math.floor(position) + 1,
                      ArrowUp: Math.floor(position) + 1,
                      PageDown: Math.ceil(position) - 1,
                      PageUp: Math.floor(position) + 1,
                      Home: 1,
                      End: 7,
                    };
                    if (choices[event.key] === undefined) return;
                    event.preventDefault();
                    scrubbing.current = false;
                    changeMood(choices[event.key], true);
                  }}
                  className="mood-range min-h-touch w-full cursor-pointer"
                />
                <div className="mood-secondary flex justify-between gap-6">
                  <span>Muy desagradable</span>
                  <span className="text-right">Muy agradable</span>
                </div>
              </div>
              <p className="mood-secondary text-center">
                {draft.mood} de 7 · No hay una respuesta correcta.
              </p>
              <Link
                href="/registro/emocion"
                className={`${action} mt-auto`}
                style={moodActionStyle(draft.mood)}
              >
                Siguiente
              </Link>
            </>
          )}
          {paso === "emocion" && (
            <>
              <p>Ánimo: {mood.label}</p>
              <Emociones
                selectedId={draft.emotionId}
                choose={(emotionId) => update({ ...draft, emotionId })}
              />
              <Link href="/registro/animo" className={`${textAction} mt-auto`}>
                Cambiar ánimo
              </Link>
            </>
          )}
          {paso === "factores" && <Factores />}
          {paso === "confirmacion" && <Confirmacion />}
        </>
      )}
      <dialog
        ref={dialog}
        aria-labelledby="close-title"
        aria-describedby="close-description"
        className="m-auto max-h-full max-w-copy overflow-y-auto rounded-dialog bg-surface p-6 text-text backdrop:bg-graphite/50"
        style={{ width: "calc(100% - var(--spacing) * 12)" }}
      >
        <h2 id="close-title" className="text-question font-bold">
          ¿Cerrar este registro?
        </h2>
        <p id="close-description" className="mt-3">
          Si cerrás, se descarta lo que elegiste.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            autoFocus
            className={action}
            onClick={() => dialog.current?.close()}
          >
            Seguir registrando
          </button>
          <button
            type="button"
            className={textAction}
            onClick={() => {
              discard();
              dialog.current?.close();
              router.replace("/");
            }}
          >
            Descartar registro
          </button>
        </div>
      </dialog>
    </section>
  );
}
