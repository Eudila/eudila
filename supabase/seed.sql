-- SPDX-License-Identifier: AGPL-3.0-only
-- Generated from data/catalogo-v1.json by supabase/catalog-seed.mjs.
begin;

insert into public.emociones (id, nombre, sugerida)
values
  ('a0254901-1643-5db6-9c74-a1bb8931d1a1', 'Alegría', true),
  ('5cb0d4e8-4585-5167-af6f-c820ceb7a345', 'Calma', true),
  ('72d05b77-1c03-5ba7-a781-0f3418065f44', 'Entusiasmo', false),
  ('800d5071-8f2a-59d4-8e36-318e361f0f81', 'Interés', false),
  ('2fb45afd-4c59-56dc-a578-3be2248826f2', 'Cariño', false),
  ('d0dd9332-9d0a-5bed-a183-6d47cc91a7ba', 'Gratitud', false),
  ('a7cbb62d-a2b0-58b3-bfb0-010560cb04b9', 'Orgullo', false),
  ('851800a9-6633-56f1-8bb7-39acac479435', 'Alivio', false),
  ('1efda8cf-773d-53d8-a793-b5ce858e17c8', 'Tristeza', true),
  ('64f46bc5-6fd0-56ea-8282-69b2a0c61f05', 'Enojo', true),
  ('85cdf292-2bbe-5742-9618-5c1e6e8353e3', 'Miedo', true),
  ('4682cb7e-789c-5699-838a-f8381221655a', 'Preocupación', true),
  ('e37af80a-c3d8-5120-a4b0-6d2da75cbc3a', 'Frustración', false),
  ('65045b5d-4e67-5710-8236-febf8057dc9c', 'Soledad', false),
  ('680f5352-cb54-5673-91c3-a7091ed1ff3e', 'Culpa', false),
  ('311a1b34-1af0-5aa7-acc2-11b55668fe71', 'Vergüenza', false),
  ('8d49adf6-07f8-5fa0-a56d-d2096d443f80', 'Sorpresa', false),
  ('5091f3c2-23de-532a-9427-468b3d9a5020', 'Aburrimiento', false),
  ('eceefb9f-2dec-58f4-b1a6-609a7e7c36ca', 'Otra emoción', false),
  ('f0d3a478-e3fa-5503-a6e2-3b58df5a9c15', 'No sé cómo nombrarlo', false),
  ('5ef2f8bc-a656-5d50-852f-67db0486cac4', 'Prefiero no indicarlo', false)
on conflict (id) do update set nombre = excluded.nombre, sugerida = excluded.sugerida;

insert into public.factores_vida (id, nombre)
values
  ('ac26591c-acd3-5fc1-b769-a40e3bd4ec2d', 'Sueño y descanso'),
  ('909c5786-861f-556e-92cb-39c6aabde274', 'Salud y cuerpo'),
  ('3ff55654-6953-5b53-a3cc-e85441af90c3', 'Trabajo'),
  ('971b84fd-16ba-5b72-ae80-282468218d8a', 'Estudio'),
  ('35218c18-6995-58e6-9c42-b20b84979cc8', 'Familia'),
  ('c8c14e1f-6ada-56a0-912b-c45989697bb1', 'Pareja'),
  ('74fefb59-738a-5fff-aa9a-9f441853adcd', 'Amistades'),
  ('ce6de821-0df6-5504-b34e-e8ee701ea902', 'Cuidados y responsabilidades'),
  ('20308317-ecd7-53f0-a7c0-73e9a1706906', 'Dinero'),
  ('c2d881cf-fb1b-54ef-a393-7a895898571f', 'Vivienda'),
  ('a09710e0-29a5-571d-b1f7-6c165bfe0b12', 'Entorno y comunidad'),
  ('e06883ed-91eb-5f50-ac72-cfb31e4c9170', 'Tiempo libre'),
  ('38688d41-d762-5c75-97e3-eb22ffafd7e2', 'Actividad física'),
  ('5f3e6450-b4af-5803-ba22-1ebff7ebcaa7', 'Uso de pantallas'),
  ('ce5f540d-576d-5cc5-b65f-9826f021c257', 'Otro factor')
on conflict (id) do update set nombre = excluded.nombre;

commit;
