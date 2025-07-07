# Stripe-Konfiguration für muutto

## Übersicht

muutto verwendet Stripe für Premium-Zahlungen. Um die Premium-Funktionen zu aktivieren, müssen Sie Stripe konfigurieren.

## Erforderliche Umgebungsvariablen

Erstellen Sie eine `.env`-Datei im Root-Verzeichnis des Projekts mit folgenden Variablen:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_ONE_TIME_PRODUCT_ID=prod_your_one_time_product_id_here
VITE_MONTHLY_PRODUCT_ID=prod_your_monthly_product_id_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Stripe-Produkte erstellen

### 1. Stripe Dashboard öffnen
- Gehen Sie zu [dashboard.stripe.com](https://dashboard.stripe.com)
- Melden Sie sich in Ihrem Stripe-Konto an

### 2. Einmalzahlungs-Produkt erstellen
1. Gehen Sie zu **Produkte** → **Neues Produkt**
2. Name: `muutto Premium - Einmalzahlung`
3. Beschreibung: `Premium-Features für einen Monat`
4. Preis: `9.99 EUR` (oder gewünschter Preis)
5. Billing: `Einmalzahlung`
6. Produkt-ID kopieren (beginnt mit `prod_`)

### 3. Monatliches Abo-Produkt erstellen
1. Gehen Sie zu **Produkte** → **Neues Produkt**
2. Name: `muutto Premium - Monatlich`
3. Beschreibung: `Premium-Features monatlich`
4. Preis: `4.99 EUR` (oder gewünschter Preis)
5. Billing: `Wiederkehrend` → `Monatlich`
6. Produkt-ID kopieren (beginnt mit `prod_`)

### 4. Preise konfigurieren
Für jedes Produkt:
1. Gehen Sie zu **Preise**
2. Erstellen Sie einen Standardpreis
3. Preis-ID kopieren (beginnt mit `price_`)

## Supabase Edge Functions konfigurieren

### 1. Stripe Webhook einrichten
1. Gehen Sie zu **Webhooks** in Ihrem Stripe Dashboard
2. **Webhook hinzufügen**
3. Endpoint: `https://your-project.supabase.co/functions/v1/premium-webhook`
4. Events auswählen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 2. Stripe Secret Key in Supabase
1. Gehen Sie zu Ihrem Supabase Dashboard
2. **Settings** → **Secrets**
3. Fügen Sie hinzu:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   ```

## Testen der Konfiguration

### 1. Entwicklungsumgebung
```bash
npm run dev
```

### 2. Premium-Seite testen
- Gehen Sie zu `/premium`
- Überprüfen Sie, ob die Produkte geladen werden
- Testen Sie den Checkout-Prozess

### 3. Test-Kreditkarten
Verwenden Sie diese Test-Karten:
- Erfolgreich: `4242 4242 4242 4242`
- Abgelehnt: `4000 0000 0000 0002`

## Fehlerbehebung

### "Missing required Stripe product ID environment variables"
- Überprüfen Sie, ob die `.env`-Datei existiert
- Stellen Sie sicher, dass alle Variablen korrekt gesetzt sind
- Starten Sie den Entwicklungsserver neu

### "HTTP 500" beim Laden der Produkte
- Überprüfen Sie die Supabase Edge Functions
- Stellen Sie sicher, dass der Stripe Secret Key korrekt gesetzt ist
- Überprüfen Sie die Logs in Supabase

### Checkout funktioniert nicht
- Überprüfen Sie die Stripe Publishable Key
- Stellen Sie sicher, dass die Webhooks korrekt konfiguriert sind
- Überprüfen Sie die Browser-Konsole auf Fehler

## Produktionsumgebung

### 1. Live-Keys verwenden
Ersetzen Sie alle `pk_test_` und `sk_test_` durch `pk_live_` und `sk_live_`

### 2. Webhook-Endpoint aktualisieren
Verwenden Sie Ihre Produktions-URL für Webhooks

### 3. SSL-Zertifikat
Stellen Sie sicher, dass Ihre Domain über HTTPS verfügbar ist

## Sicherheit

- Teilen Sie niemals Ihren Stripe Secret Key
- Verwenden Sie immer HTTPS in der Produktion
- Überprüfen Sie regelmäßig die Webhook-Logs
- Implementieren Sie Rate Limiting für die API-Endpunkte 