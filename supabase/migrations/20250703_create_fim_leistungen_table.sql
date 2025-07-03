create table fim_leistungen (
  fim_id text primary key,
  titel text not null,
  beschreibung text,
  daten jsonb,
  last_updated timestamp not null default current_timestamp
);

-- Indizes für häufig abgefragte Spalten hinzufügen
create index idx_fim_leistungen_titel on fim_leistungen(titel);
create index idx_fim_leistungen_last_updated on fim_leistungen(last_updated);

-- Optional: Index für Textsuche im Titel
create index idx_fim_leistungen_titel_search on fim_leistungen using gin(to_tsvector('german', titel));
