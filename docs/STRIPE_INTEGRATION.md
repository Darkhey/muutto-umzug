# Stripe Integration für Muutto

Diese Dokumentation beschreibt die vollständige Stripe Integration für Abonnements und Einmalzahlungen in der Muutto-Anwendung.

## Übersicht

Die Integration unterstützt zwei Zahlungsmethoden:
1. **Stripe Checkout** - Gehostete Zahlungsseite von Stripe
2. **Stripe Elements** - Eingebettete Zahlungskomponenten

## Komponenten

### Frontend-Komponenten

#### 1. StripeElementsCheckout (`src/components/checkout/StripeElementsCheckout.tsx`)
- Eingebettete Zahlungskomponente mit Stripe Elements
- Unterstützt monatliche Abos und Einmalzahlungen
- Vollständig anpassbares Design
- Fehlerbehandlung und Loading-States

#### 2. UpgradeCTA (`src/components/premium/UpgradeCTA.tsx`)
- Call-to-Action Komponente für Premium-Upgrades
- Unterstützt beide Zahlungsmethoden
- Tabs für monatlich/einmalig Auswahl

#### 3. CustomerPortal (`src/components/premium/CustomerPortal.tsx`)
- Komponente zum Öffnen des Stripe Customer Portals
- Ermöglicht Nutzern die Verwaltung ihres Abos

#### 4. Premium-Seite (`src/pages/Premium.tsx`)
- Vollständige Premium-Seite mit Features-Übersicht
- Integrierte Stripe Elements Checkout
- Erfolgs-/Fehlermeldungen

### Backend-Functions

#### 1. stripe-session (`supabase/functions/stripe-session/index.ts`)
- Erstellt Stripe Checkout Sessions
- Unterstützt Abos und Einmalzahlungen
- Authentifizierung über Supabase

#### 2. stripe-elements (`supabase/functions/stripe-elements/index.ts`)
- Verarbeitet Stripe Elements Zahlungen
- Erstellt Payment Intents und Subscriptions
- Verwaltet Stripe Customers

#### 3. stripe-portal (`supabase/functions/stripe-portal/index.ts`)
- Erstellt Customer Portal Sessions
- Ermöglicht Abo-Verwaltung

#### 4. premium-webhook (`supabase/functions/premium-webhook/index.ts`)
- Verarbeitet Stripe Webhook Events
- Aktualisiert Premium-Status in der Datenbank
- Unterstützt beide Zahlungsmethoden

## Datenbank-Schema

### stripe_customers Tabelle
```sql
CREATE TABLE stripe_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### premium_status Tabelle (bereits vorhanden)
- Speichert den Premium-Status der Nutzer
- Verknüpft mit Stripe Subscriptions

## Umgebungsvariablen

### Frontend (.env)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (Supabase Secrets)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ONE_TIME=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://your-domain.com
```

## Setup-Anleitung

### 1. Stripe Account einrichten
1. Stripe Account erstellen
2. Produkt und Preise anlegen:
   - Monatliches Abo (9,99€)
   - Einmalzahlung (9,99€)
3. Webhook Endpoint konfigurieren

### 2. Supabase Functions deployen
```bash
supabase functions deploy stripe-session
supabase functions deploy stripe-elements
supabase functions deploy stripe-portal
supabase functions deploy premium-webhook
```

### 3. Datenbank-Migration ausführen
```bash
supabase db push
```

### 4. Umgebungsvariablen setzen
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_PRICE_MONTHLY=price_...
# ... weitere Variablen
```

## Verwendung

### Stripe Elements (eingebettet)
```tsx
import StripeElementsCheckout from '@/components/checkout/StripeElementsCheckout'

<StripeElementsCheckout
  mode="monthly"
  onSuccess={() => console.log('Erfolg!')}
  onCancel={() => console.log('Abgebrochen')}
/>
```

### Stripe Checkout (gehostet)
```tsx
// In UpgradeCTA.tsx bereits implementiert
const handleStripeCheckout = async () => {
  // Ruft stripe-session Function auf
  // Leitet zu Stripe Checkout weiter
}
```

### Customer Portal
```tsx
import CustomerPortal from '@/components/premium/CustomerPortal'

<CustomerPortal />
```

## Webhook Events

Die Integration verarbeitet folgende Stripe Events:

- `checkout.session.completed` - Stripe Checkout erfolgreich
- `payment_intent.succeeded` - Stripe Elements Einmalzahlung erfolgreich
- `invoice.payment_succeeded` - Abo-Zahlung erfolgreich
- `invoice.payment_failed` - Zahlung fehlgeschlagen
- `customer.subscription.deleted` - Abo gekündigt

## Sicherheit

- Alle sensiblen Daten werden über Stripe verarbeitet
- Webhook-Signaturen werden verifiziert
- Authentifizierung über Supabase JWT
- Row Level Security (RLS) aktiviert

## Fehlerbehandlung

- Umfassende Fehlerbehandlung in allen Komponenten
- Toast-Benachrichtigungen für Benutzer-Feedback
- Logging für Debugging
- Graceful Fallbacks

## Erweiterte Features

### Mögliche Erweiterungen:
- Coupons und Rabatte
- Free Trials
- Usage-based Billing
- Multiple Payment Methods
- Tax Calculation
- Invoice Management

## Troubleshooting

### Häufige Probleme:

1. **Webhook nicht empfangen**
   - Prüfe Webhook Endpoint URL
   - Verifiziere Webhook Secret
   - Teste mit Stripe CLI

2. **Payment Intent Fehler**
   - Prüfe Stripe Secret Key
   - Verifiziere Price IDs
   - Kontrolliere Customer Creation

3. **CORS Fehler**
   - Prüfe CORS Headers in Functions
   - Verifiziere Frontend URL

## Support

Bei Problemen:
1. Stripe Dashboard Logs prüfen
2. Supabase Function Logs analysieren
3. Browser Developer Tools konsultieren
4. Stripe Test Mode verwenden 