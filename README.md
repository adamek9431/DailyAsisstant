# Daily Assistant - PWA do zarządzania zadaniami

Aplikacja PWA z:
- Logowaniem przez Google
- Widokiem "Zadania na dziś"
- Listą zakupów z search i sugestiami
- Trybem demo (offline z localStorage)

## 🚀 Deploy na Cloudflare Pages

### Opcja 1: Przez GitHub (zalecane)

1. **Wrzuć na GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Połącz z Cloudflare Pages:**
   - Idź do [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
   - Kliknij "Create a project" → "Connect to Git"
   - Wybierz swoje repo GitHub
   - **Build settings:**
     - Framework preset: `None` lub `Vite`
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Kliknij "Save and Deploy"

3. **Gotowe!** Cloudflare automatycznie wykryje folder `/functions/` i będzie obsługiwać routing SPA.

### Opcja 2: Przez Wrangler CLI

```bash
npm install -g wrangler
wrangler pages deploy dist
```

## 🔧 Rozwój lokalny

```bash
# Instalacja
npm install

# Uruchomienie dev server
npm run dev

# Build produkcyjny
npm run build

# Preview buildu
npm run preview
```

## 📁 Struktura

```
/functions/          ← Cloudflare Pages Functions (obsługa routingu SPA)
/src/
  /app/
    /components/     ← Komponenty React
    /services/       ← API i mock data
    /config/         ← Konfiguracja Google OAuth
  /styles/           ← CSS i Tailwind
/public/             ← Statyczne pliki (manifest, service-worker)
```

## 🔐 Google OAuth

Dodaj w Cloudflare Pages → Settings → Environment variables:
- `VITE_GOOGLE_CLIENT_ID` - Twój Google Client ID

## 📦 Backend

Backend FastAPI z JWT bearer token (adres ngrok).
Tryb demo działa offline bez backendu.
