create table fim_leistungen (
  fim_id text primary key not null,
  titel text not null,
  beschreibung text not null,
  daten jsonb not null,
  last_updated timestamp not null default CURRENT_TIMESTAMP
);

create index fim_leistungen_titel_idx on fim_leistungen (titel);
create index fim_leistungen_last_updated_idx on fim_leistungen (last_updated);
