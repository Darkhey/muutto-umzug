create table fim_leistungen (
  fim_id text primary key,
  titel text,
  beschreibung text,
  daten jsonb,
  last_updated timestamp
);
