create table fim_leistungen (
  fim_id text primary key not null,
  titel text not null,
  beschreibung text not null,
  daten jsonb not null,
  last_updated timestamp not null default CURRENT_TIMESTAMP
);

-- Add table and column documentation
comment on table fim_leistungen is 'Stores FIM (Financial Information Management) services data for household move-related services';
comment on column fim_leistungen.fim_id is 'Unique identifier for FIM service';
comment on column fim_leistungen.titel is 'German title of the service';
comment on column fim_leistungen.beschreibung is 'German description of the service';
comment on column fim_leistungen.daten is 'JSON data containing service-specific information and configuration';
comment on column fim_leistungen.last_updated is 'Timestamp of last update to the service data';

-- Add JSON structure validation
alter table fim_leistungen add constraint daten_structure_check 
check (jsonb_typeof(daten) = 'object');

create index fim_leistungen_titel_idx on fim_leistungen (titel);
create index fim_leistungen_last_updated_idx on fim_leistungen (last_updated);
