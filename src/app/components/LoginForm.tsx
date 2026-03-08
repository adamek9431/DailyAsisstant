import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { GOOGLE_CLIENT_ID } from "../config/google";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  onDemoLogin: () => void;
  onGoogleLogin: (credential: string) => Promise<void>;
}

// Deklaracja typu dla Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function LoginForm({ onLogin, onRegister, onDemoLogin, onGoogleLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleSdkLoaded, setGoogleSdkLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Ukryj standardowe logowanie (comment for future use)
  const showStandardLogin = false;

  useEffect(() => {
    // Inicjalizuj Google Sign-In
    const initializeGoogleSignIn = () => {
      if (window.google && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
          });

          // Renderuj przycisk Google
          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(
              googleButtonRef.current,
              {
                theme: "outline",
                size: "large",
                width: googleButtonRef.current.offsetWidth,
                text: "continue_with",
                locale: "pl",
              }
            );
          }
          setGoogleSdkLoaded(true);
        } catch (error) {
          console.error("Failed to initialize Google Sign-In:", error);
        }
      }
    };

    // Sprawdź czy Google SDK jest załadowany
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Poczekaj na załadowanie SDK
      let attempts = 0;
      const maxAttempts = 30; // 3 sekundy
      const checkGoogleLoaded = setInterval(() => {
        attempts++;
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogleLoaded);
          console.log("Google SDK not loaded");
        }
      }, 100);

      return () => clearInterval(checkGoogleLoaded);
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    if (response.credential) {
      setIsGoogleLoading(true);
      try {
        await onGoogleLogin(response.credential);
      } finally {
        setIsGoogleLoading(false);
      }
    }
  };

  const handleGoogleClick = () => {
    if (window.google && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
      window.google.accounts.id.prompt();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsSubmitting(true);
      try {
        if (isRegistering) {
          await onRegister(email, password);
        } else {
          await onLogin(email, password);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-600 rounded-full p-3">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Zadania na dziś</CardTitle>
          <CardDescription>
            {isRegistering
              ? "Utwórz nowe konto"
              : "Zaloguj się, aby zarządzać swoimi zadaniami"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Przycisk Google na górze */}
          <div className="space-y-4">
            {/* Google native button (renderowany przez SDK) */}
            <div ref={googleButtonRef} className="w-full" style={{ minHeight: googleSdkLoaded ? '40px' : '0' }}></div>
            
            {/* Custom fallback button (widoczny zawsze lub gdy SDK nie załaduje się) */}
            {!googleSdkLoaded && (
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"}
                className="w-full h-10 border-gray-300 hover:bg-gray-50"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span className="text-gray-700 font-medium">
                  {GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" 
                    ? "Google Login (wymaga konfiguracji)" 
                    : "Kontynuuj z Google"}
                </span>
              </Button>
            )}
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Lub</span>
              </div>
            </div>
          </div>

          {showStandardLogin && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isRegistering ? "Rejestracja..." : "Logowanie..."}
                  </>
                ) : (
                  <>{isRegistering ? "Zarejestruj się" : "Zaloguj się"}</>
                )}
              </Button>
            </form>
          )}
          {showStandardLogin && (
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsRegistering(!isRegistering)}
                disabled={isSubmitting}
                className="text-sm"
              >
                {isRegistering
                  ? "Masz już konto? Zaloguj się"
                  : "Nie masz konta? Zarejestruj się"}
              </Button>
            </div>
          )}
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onDemoLogin}
              disabled={isSubmitting}
              className="w-full"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Tryb Demo (bez API)
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Testuj aplikację z przykładowymi danymi
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}