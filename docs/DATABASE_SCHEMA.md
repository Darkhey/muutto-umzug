
# muutto - Datenbankschema

## 🗄️ Übersicht

Das muutto-Datenbankschema basiert auf PostgreSQL mit Supabase und implementiert strikte Row Level Security (RLS) für sichere Multi-Tenant-Architektur.

## 📊 Aktuelle Tabellen

### auth.users (Supabase Managed)
```sql
-- Verwaltet von Supabase Auth
-- Enthält: id, email, encrypted_password, email_confirmed_at, etc.
-- Nicht direkt referenziert von anderen Tabellen
```

### public.profiles
```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies:
-- ✅ Users can view all profiles (authenticated)
-- ✅ Users can update their own profile
```

### public.households
```sql
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  move_date DATE NOT NULL,
  household_size INTEGER NOT NULL DEFAULT 1,
  children_count INTEGER NOT NULL DEFAULT 0,
  pets_count INTEGER NOT NULL DEFAULT 0,
  property_type property_type NOT NULL,
  postal_code TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies:
-- ✅ Users can view households they are members of
-- ✅ Users can create households
-- ✅ Household owners can update their households
```

### public.household_members
```sql
CREATE TABLE public.household_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role household_role,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies:
-- ✅ Users can view members of their households
-- ✅ Household owners can manage members
-- ✅ Users can update their own member record
```

## 🔧 Enums

### household_role
```sql
CREATE TYPE public.household_role AS ENUM (
  'vertragsmanager',
  'packbeauftragte', 
  'finanzperson',
  'renovierer',
  'haustierverantwortliche'
);
```

### property_type
```sql
CREATE TYPE public.property_type AS ENUM (
  'miete', 
  'eigentum'
);
```

## 📋 Geplante Tabellen

### public.tasks (Checklisten-Modul)
```sql
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  phase task_phase NOT NULL,
  assigned_to UUID REFERENCES public.household_members,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users,
  priority task_priority NOT NULL DEFAULT 'mittel',
  category TEXT,
  template_id TEXT, -- Referenz zu Task-Templates
  dependencies UUID[], -- Array von Task-IDs
  estimated_duration INTEGER, -- Minuten
  actual_duration INTEGER, -- Minuten
  notes TEXT,
  attachments JSONB, -- File URLs, Links, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Zusätzliche Enums
CREATE TYPE public.task_phase AS ENUM (
  'vor_umzug',
  'umzugstag', 
  'nach_umzug',
  'langzeit'
);

CREATE TYPE public.task_priority AS ENUM (
  'niedrig',
  'mittel',
  'hoch',
  'kritisch'
);

-- RLS Policies:
-- ✅ Users can view tasks of their households
-- ✅ Assigned users can update their tasks
-- ✅ Household owners can manage all tasks
```

### public.contracts (Vertragsmanagement)
```sql
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT,
  contract_type contract_type NOT NULL,
  start_date DATE,
  end_date DATE,
  cancellation_deadline DATE,
  notice_period_months INTEGER,
  monthly_cost DECIMAL(10,2),
  account_number TEXT,
  customer_number TEXT,
  status contract_status NOT NULL DEFAULT 'aktiv',
  cancellation_sent BOOLEAN NOT NULL DEFAULT false,
  cancellation_confirmed BOOLEAN NOT NULL DEFAULT false,
  new_provider TEXT,
  notes TEXT,
  documents JSONB, -- File URLs
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enums
CREATE TYPE public.contract_type AS ENUM (
  'strom',
  'gas',
  'wasser',
  'internet',
  'telefon',
  'versicherung',
  'abo',
  'streaming',
  'fitness',
  'sonstiges'
);

CREATE TYPE public.contract_status AS ENUM (
  'aktiv',
  'gekuendigt',
  'beendet',
  'pausiert'
);
```

### public.reminders (Erinnerungssystem)
```sql
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks,
  contract_id UUID REFERENCES public.contracts,
  title TEXT NOT NULL,
  message TEXT,
  reminder_type reminder_type NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users,
  channels TEXT[] NOT NULL DEFAULT '{app}', -- app, email, push, sms
  priority INTEGER NOT NULL DEFAULT 1,
  recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_pattern JSONB, -- Cron-like pattern
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enum
CREATE TYPE public.reminder_type AS ENUM (
  'deadline',
  'task_due',
  'contract_cancellation',
  'weekly_summary',
  'milestone',
  'custom'
);
```

### public.chat_sessions (KI-Assistent)
```sql
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT,
  context JSONB, -- Household context, preferences
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions ON DELETE CASCADE NOT NULL,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB, -- Usage stats, model info, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enum
CREATE TYPE public.message_role AS ENUM (
  'user',
  'assistant',
  'system'
);
```

### public.inventories (Inventar & Packing)
```sql
CREATE TABLE public.inventories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  room TEXT,
  category TEXT,
  value DECIMAL(10,2),
  quantity INTEGER NOT NULL DEFAULT 1,
  weight_kg DECIMAL(5,2),
  fragile BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 1,
  photos TEXT[], -- URLs to photos
  qr_code TEXT UNIQUE,
  box_id UUID REFERENCES public.boxes,
  status inventory_status NOT NULL DEFAULT 'inventur',
  notes TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households ON DELETE CASCADE NOT NULL,
  number INTEGER NOT NULL,
  name TEXT,
  room_from TEXT,
  room_to TEXT,
  weight_kg DECIMAL(5,2),
  priority INTEGER NOT NULL DEFAULT 1,
  qr_code TEXT UNIQUE,
  packed_by UUID REFERENCES auth.users,
  packed_at TIMESTAMP WITH TIME ZONE,
  status box_status NOT NULL DEFAULT 'leer',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enums
CREATE TYPE public.inventory_status AS ENUM (
  'inventur',
  'verpackt',
  'transportiert',
  'ausgepackt'
);

CREATE TYPE public.box_status AS ENUM (
  'leer',
  'gepackt',
  'versiegelt',
  'transportiert',
  'ausgepackt'
);
```

## 🔐 Row Level Security (RLS) Patterns

### Standard Household-Based Security
```sql
-- Für alle Household-bezogenen Tabellen
CREATE POLICY "household_members_policy" 
  ON public.table_name FOR ALL 
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid() OR (user_id IS NULL AND email = auth.email())
    )
  );
```

### Owner-Only Operations
```sql
-- Für administrative Funktionen
CREATE POLICY "owner_only_policy"
  ON public.table_name FOR UPDATE/DELETE
  USING (
    household_id IN (
      SELECT id FROM public.households WHERE created_by = auth.uid()
    )
  );
```

### Self-Service Operations
```sql
-- Für eigene Daten (Profile, eigene Tasks)
CREATE POLICY "self_service_policy"
  ON public.table_name FOR ALL
  USING (user_id = auth.uid());
```

## 📈 Indizes & Performance

### Häufige Queries optimieren
```sql
-- Household Members Lookup
CREATE INDEX idx_household_members_household_user 
  ON public.household_members(household_id, user_id);

-- Tasks by Household and Assignment
CREATE INDEX idx_tasks_household_assigned 
  ON public.tasks(household_id, assigned_to);

-- Reminders by Due Date
CREATE INDEX idx_reminders_due_date 
  ON public.reminders(due_date) WHERE sent_at IS NULL;

-- Chat Messages by Session
CREATE INDEX idx_chat_messages_session 
  ON public.chat_messages(session_id, created_at);
```

### Composite Indizes für komplexe Queries
```sql
-- Tasks Dashboard Query
CREATE INDEX idx_tasks_dashboard 
  ON public.tasks(household_id, completed, due_date, priority);

-- Contract Cancellation Monitoring
CREATE INDEX idx_contracts_cancellation 
  ON public.contracts(household_id, cancellation_deadline, status) 
  WHERE status = 'aktiv';
```

## 🔄 Triggers & Functions

### Automatische Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Für alle Tabellen mit updated_at
CREATE TRIGGER update_households_updated_at 
  BEFORE UPDATE ON public.households 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### QR-Code Generation
```sql
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code = 'MUT-' || NEW.household_id || '-' || NEW.id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';
```

### Task Dependencies Validation
```sql
CREATE OR REPLACE FUNCTION validate_task_dependencies()
RETURNS TRIGGER AS $$
BEGIN
  -- Prüfe ob Dependencies im gleichen Household sind
  IF array_length(NEW.dependencies, 1) > 0 THEN
    IF EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = ANY(NEW.dependencies) 
      AND household_id != NEW.household_id
    ) THEN
      RAISE EXCEPTION 'Task dependencies must be in the same household';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';
```

## 🔄 Migration Strategy

### Versionierung
```sql
-- Jede Migration hat eine eindeutige ID
-- Format: YYYYMMDDHHMMSS-uuid.sql
-- Beispiel: 20250627064537-780b26a7-0eff-418e-9327-e22c58bc9b81.sql
```

### Rollback-Safe Migrations
```sql
-- Immer backward-compatible
-- Neue Spalten: DEFAULT Werte
-- Neue Constraints: Erst Daten bereinigen
-- Neue Tabellen: Separate Migration
-- RLS Policies: Schrittweise aktivieren
```

### Test-Daten
```sql
-- Für Development/Testing
INSERT INTO public.households (name, move_date, created_by) VALUES
('Test Haushalt', '2025-08-15', auth.uid());

INSERT INTO public.household_members (household_id, name, email, role, is_owner) VALUES
((SELECT id FROM public.households WHERE name = 'Test Haushalt'), 'Max Mustermann', 'max@example.com', 'vertragsmanager', true);
```

## 📊 Analytics & Monitoring

### Performance Monitoring
```sql
-- Slow Query Monitoring
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
WHERE query LIKE '%public.household%'
ORDER BY mean_time DESC;

-- Index Usage
SELECT indexrelname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;
```

### Business Metrics
```sql
-- Active Households
SELECT COUNT(*) FROM public.households 
WHERE move_date >= CURRENT_DATE - INTERVAL '30 days';

-- User Engagement
SELECT COUNT(DISTINCT user_id) FROM public.household_members 
WHERE joined_at >= CURRENT_DATE - INTERVAL '7 days';

-- Task Completion Rate
SELECT 
  COUNT(CASE WHEN completed THEN 1 END)::float / COUNT(*) * 100 as completion_rate
FROM public.tasks 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

## 🛡️ Backup & Recovery

### Backup Strategy
```bash
# Automatische Backups durch Supabase
# Point-in-Time Recovery verfügbar
# Manuelle Backups für kritische Zeitpunkte

# Export für Migration/Archivierung
pg_dump --host=db.vzolmlztzewveszdykwq.supabase.co \
        --port=5432 \
        --username=postgres \
        --schema=public \
        --data-only \
        --format=custom \
        muutto_backup.dump
```

### Disaster Recovery
```sql
-- Kritische Tabellen priorisieren
1. auth.users (Supabase managed)
2. public.profiles
3. public.households  
4. public.household_members
5. public.tasks
6. public.contracts
7. public.chat_sessions
8. public.inventories
```

---

Diese Dokumentation wird kontinuierlich aktualisiert, wenn neue Tabellen hinzugefügt oder bestehende modifiziert werden.
