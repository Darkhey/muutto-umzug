INSERT INTO public.checklist_templates (
    title,
    description,
    phase,
    priority,
    category,
    days_before_move,
    conditions,
    required_documents,
    online_form_link,
    zuständige_stelle,
    opening_hours,
    source_reference
) VALUES
(
    'Wohnsitz ummelden',
    'Melde deinen neuen Wohnsitz beim Einwohnermeldeamt an.',
    'umzugstag',
    'kritisch',
    'Behördengang',
    0,
    '{}'::jsonb, -- No specific conditions for basic registration
    '["Personalausweis", "Mietvertrag"]'::jsonb,
    'https://www.wohnsitzanmeldung.de/',
    'Einwohnermeldeamt',
    'Mo-Fr 08:00-12:00',
    'FIM-ID-Wohnsitzanmeldung'
),
(
    'Hund anmelden (Hundesteuer)',
    'Melde deinen Hund bei der Gemeinde an und entrichte die Hundesteuer.',
    'nach_umzug',
    'hoch',
    'Haustiere',
    7,
    '{"has_pets": true}'::jsonb, -- Condition: user has pets
    '["Hundeimpfpass", "Kaufvertrag Hund"]'::jsonb,
    'https://www.hunderegister.berlin.de/login',
    'Ordnungsamt / Steueramt',
    'Mo-Do 09:00-16:00',
    'FIM-ID-Hundesteuer'
),
(
    'Fahrzeug ummelden',
    'Melde dein Fahrzeug bei der Zulassungsstelle um.',
    'nach_umzug',
    'hoch',
    'Fahrzeug',
    14,
    '{"owns_car": true}'::jsonb, -- Condition: user owns a car
    '["Fahrzeugschein", "Fahrzeugbrief", "Personalausweis", "eVB-Nummer"]'::jsonb,
    'https://service.berlin.de/dienstleistung/120918/',
    'Zulassungsstelle',
    'Di-Fr 07:30-12:00',
    'FIM-ID-KFZ-Ummeldung'
);
