// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  emotionAllowed,
  emotionComplete,
  emotionOptions,
  emotionPath,
} from "./rueda.ts";
import { restoreDraft, newDraft } from "../flow-state.js";
import { restoreRecords } from "../records.ts";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const catalog = JSON.parse(read("./catalogo-v1.json")).emociones;
const paths = JSON.parse(read("./rueda-emociones.json"));
const row = (id) => catalog.find((item) => item.id === id);
const id = (name) => catalog.find((item) => item.nombre === name).id;

test("36 radios completos de la imagen, sin sentimientos ambiguos", () => {
  const expected = {
    Tristeza:
      "Arrepentido/Culpable,Vulnerable/Frágil,Solitario/Aislado,Deprimido/Miserable,Indiferente/Aburrido,Decaído/Avergonzado",
    Enfado:
      "Hostil/Egoísta,Irritado/Celoso,Herido/Furioso,Estresado/Resentido,Crítico/Escéptico,Molesto/Frustrado",
    Miedo:
      "Débil/Invisible,Inseguro/Inferior,Confundido/Perplejo,Amenazado/Nervioso,Ansioso/Rechazado,Preocupado/Excluido",
    Calma:
      "Conectado/Arropado,Confiado/Sensible,Agradecido/Cariñoso,Tranquilo/Sereno,Considerado/Relajado,Aliviado/Recogido",
    Felicidad:
      "Optimista/Esperanzado,Entusiasmado/Energético,Juguetón/Excitado,Alegre/Sorprendido,Aceptado/Valorado,Interesado/Curioso",
    Fuerza:
      "Empoderado/Enfocado,Fiel/Leal,Reconocido/Respetado,Valiente/Creativo,Fuerte/Exitoso,Orgulloso/Seguro",
  };
  assert.equal(paths.length, 36);
  assert.equal(new Set(paths.flat()).size, 78);
  assert.deepEqual(
    paths.map((path) => path.map((key) => row(key).nombre)),
    Object.entries(expected).flatMap(([family, branches]) =>
      branches.split(",").map((branch) => [family, ...branch.split("/")]),
    ),
  );
  for (const path of paths) {
    for (let depth = 1; depth <= 3; depth++) {
      assert.deepEqual(emotionPath(path[depth - 1]), path.slice(0, depth));
    }
    assert.ok(emotionOptions(path[0], 4).includes(path[1]));
    assert.deepEqual(
      emotionOptions(path[1], 4),
      paths.filter((route) => route[0] === path[0]).map((route) => route[2]),
    );
    assert.deepEqual(emotionOptions(path[2], 4), [path[2]]);
  }
});

test("Felicidad, Calma y Fuerza comparten la segunda capa y abren la tercera de su color", () => {
  const pleasant = paths.slice(18);
  for (const family of ["Felicidad", "Calma", "Fuerza"]) {
    assert.deepEqual(
      emotionOptions(id(family), 6),
      pleasant.map((route) => route[1]),
    );
    assert.equal(emotionOptions(id(family), 6).length, 18);
  }
  assert.deepEqual(
    emotionOptions(id("Optimista"), 6).map((key) => row(key).nombre),
    [
      "Esperanzado",
      "Energético",
      "Excitado",
      "Sorprendido",
      "Valorado",
      "Curioso",
    ],
  );
  assert.deepEqual(
    emotionOptions(id("Tranquilo"), 6).map((key) => row(key).nombre),
    ["Arropado", "Sensible", "Cariñoso", "Sereno", "Relajado", "Recogido"],
  );
});

test("el ánimo filtra familias y sentimientos, incluidos búsqueda y borradores", () => {
  for (let mood = 1; mood <= 7; mood++) {
    const families = emotionOptions(null, mood).map((key) => row(key).nombre);
    assert.equal(families.length, mood === 4 ? 6 : 3);
    if (mood < 4)
      assert.deepEqual(families.slice(0, 3), ["Tristeza", "Enfado", "Miedo"]);
    if (mood > 4)
      assert.deepEqual(families.slice(0, 3), ["Calma", "Felicidad", "Fuerza"]);
  }
  assert.equal(emotionAllowed(id("Excluido"), 1), true);
  assert.equal(emotionAllowed(id("Alegre"), 1), false);
  assert.equal(emotionAllowed(id("Alegría"), 1), false);
  assert.equal(emotionAllowed(id("Excluido"), 7), false);
  assert.equal(emotionAllowed(id("Sereno"), 7), true);
  assert.equal(emotionAllowed(id("No sé cómo nombrarlo"), 1), true);
  for (const legacy of [
    null,
    "desconocido",
    id("No sé cómo nombrarlo"),
    id("Alegría"),
  ]) {
    assert.deepEqual(emotionPath(legacy), []);
    assert.equal(emotionOptions(legacy, 4).length, 6);
  }
});

test("el sentimiento exterior sobrevive borrador e historial sin cambiar el contrato", () => {
  for (const path of paths) {
    const draft = { ...newDraft(), type: "libre", emotionId: path[2] };
    assert.deepEqual(restoreDraft(JSON.stringify(draft)), draft);
    const record = {
      id: "test",
      recordedAt: "2026-10-27T12:00:00.000Z",
      type: "libre",
      mood: 4,
      emotion: { id: path[2], nombre: row(path[2]).nombre },
      factors: [],
      source: "account",
    };
    assert.deepEqual(restoreRecords(JSON.stringify([record])), [record]);
  }
});

test("la migración agrega todas las etiquetas nuevas sin tocar el catálogo histórico", () => {
  const migration = read(
    "../../../app/supabase/migrations/20261028000000_rueda_emociones.sql",
  );
  assert.match(
    migration,
    /begin;[\s\S]*on conflict \(id\) do nothing;\s*commit;/,
  );
  assert.doesNotMatch(migration, /\b(delete|truncate|update|drop)\b/i);
  for (const item of catalog.slice(21)) {
    assert.ok(migration.includes(`('${item.id}', '${item.nombre}', false)`));
  }
  for (const item of catalog.slice(0, 21))
    assert.ok(!migration.includes(item.id));
});

test("solo sentimientos finales y alternativas completan el recorrido", () => {
  for (const path of paths) {
    assert.equal(emotionComplete(path[0], 4), false);
    assert.equal(emotionComplete(path[1], 4), false);
    assert.equal(emotionComplete(path[2], 4), true);
  }
  assert.equal(emotionComplete(null, 4), false);
  assert.equal(emotionComplete(id("Alegría"), 4), false);
  assert.equal(emotionComplete(id("Sereno"), 1), false);
  assert.equal(emotionComplete(id("No sé cómo nombrarlo"), 1), true);
});
