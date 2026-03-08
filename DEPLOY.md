# 🚀 Jak wdrożyć na Cloudflare Pages

## Krok 1: Pobierz projekt z Figma Make
Kliknij **Download** w prawym górnym rogu Figma Make.

## Krok 2: Wypakuj i wrzuć na GitHub

```bash
# Rozpakuj ZIP
unzip daily-assistant.zip
cd daily-assistant

# Zainicjuj git repo (jeśli nowe)
git init
git add .
git commit -m "Initial commit from Figma Make"

# Dodaj remote i push (zamień na swoje repo)
git remote add origin https://github.com/twój-username/twoje-repo.git
git push -u origin main
```

## Krok 3: Połącz z Cloudflare Pages

1. Idź do https://dash.cloudflare.com
2. Wybierz **Pages** z bocznego menu
3. Kliknij **"Create a project"**
4. Kliknij **"Connect to Git"**
5. Autoryzuj GitHub i wybierz swoje repo
6. Ustaw build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
7. Kliknij **"Save and Deploy"**

## ✅ Gotowe!

Cloudflare automatycznie zbuduje i wdroży projekt. 
Routing SPA będzie działał dzięki `/functions/_middleware.ts` - **żadnych dodatkowych kroków nie potrzebujesz!**

---

## 🔧 (Opcjonalnie) Google OAuth

Jeśli chcesz logowanie przez Google:

1. W Cloudflare Pages → Twój projekt → **Settings** → **Environment variables**
2. Dodaj:
   - `VITE_GOOGLE_CLIENT_ID` = twój Google Client ID
3. Redeploy projekt

---

## ❓ Problemy?

- **404 na podstronach?** Sprawdź czy folder `/functions/` został wgrany na Cloudflare
- **Build się nie udaje?** Upewnij się że `package.json` istnieje w głównym folderze
- **Google OAuth nie działa?** Sprawdź czy dodałeś `VITE_GOOGLE_CLIENT_ID` w environment variables
