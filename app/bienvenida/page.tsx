// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import MoodOrb from "../mood/orb";
import Mascota from "../mood/mascota";
import { brandMood } from "../mood/critter";
import { previewEnabled } from "../frontend-preview";
import "../auth/auth.css";

export default function Bienvenida() {
  return (
    <section
      className="auth-screen auth-welcome"
      aria-labelledby="welcome-title"
    >
      <Mascota
        mood={brandMood}
        moment="hola"
        once="session:eudila-saludo"
        className="auth-orb"
        fallback={<MoodOrb level={brandMood} />}
      />
      <div className="auth-intro">
        <h1
          id="welcome-title"
          className="font-display text-question leading-question font-bold tracking-brand text-balance"
        >
          Un momento para vos.
        </h1>
        <p className="text-muted">
          Poné en palabras cómo te sentís. Sin respuestas correctas, sin un
          ritmo que cumplir.
        </p>
      </div>
      <p>
        Registrá tu ánimo, reconocé tus emociones y observá qué influye en tu
        día.
      </p>
      <div className="auth-form">
        <Link href="/crear-cuenta" className="action action-primary">
          Crear mi cuenta
        </Link>
        <Link href="/ingresar" className="action action-secondary">
          Ya tengo cuenta
        </Link>
      </div>
      {previewEnabled && (
        <Link href="/" className="auth-back">
          Explorar la vista previa
        </Link>
      )}
      <p className="text-muted text-sm">
        A tu ritmo. Si necesitás apoyo, Ayuda ahora está siempre disponible.
      </p>
    </section>
  );
}
