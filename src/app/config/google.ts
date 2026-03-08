// Konfiguracja Google OAuth
// 
// INSTRUKCJE KROK PO KROKU:
// 
// 1. Przejdź do: https://console.cloud.google.com/
// 
// 2. Utwórz nowy projekt:
//    - Kliknij projekt w górnym menu → "New Project"
//    - Podaj nazwę (np. "Zadania App")
//    - Kliknij "Create"
// 
// 3. Skonfiguruj OAuth consent screen (WAŻNE - zrób to najpierw):
//    - W menu bocznym: "APIs & Services" → "OAuth consent screen"
//    - Wybierz "External" (jeśli nie masz Google Workspace)
//    - Kliknij "Create"
//    - Wypełnij podstawowe info:
//      * App name: "Zadania na dziś"
//      * User support email: twój email
//      * Developer contact: twój email
//    - Kliknij "Save and Continue"
//    - Scopes: możesz pominąć (kliknij "Save and Continue")
//    - Test users: dodaj swój email do testowania
//    - Kliknij "Save and Continue"
// 
// 4. Utwórz OAuth 2.0 Client ID:
//    - W menu bocznym: "APIs & Services" → "Credentials"
//    - Kliknij "+ CREATE CREDENTIALS" → "OAuth client ID"
//    - Application type: "Web application"
//    - Name: "Web client" (lub dowolna nazwa)
//    
// 5. Dodaj Authorized JavaScript origins:
//    Kliknij "+ ADD URI" i dodaj te adresy:
//    - http://localhost:5173
//    - https://www.figma.com
//    - Twoja domena Figma Make (np. https://xxx.figma.app)
//    
//    NIE musisz dodawać "Authorized redirect URIs" - Google Sign-In używa popup!
// 
// 6. Kliknij "Create"
// 
// 7. Skopiuj "Client ID" (format: xxxxx.apps.googleusercontent.com)
//    i wklej poniżej:

export const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// ✅ NIE MUSISZ włączać żadnego API (Google+, Identity itp.)
// ✅ Google Sign-In działa od razu po skonfigurowaniu OAuth Client ID
// ✅ Client ID jest publiczny - bezpieczne jest trzymanie go w kodzie frontend