import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { LoginForm } from "./components/LoginForm";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { api, User } from "./services/api";
import { mockApi } from "./services/mockApi";
import { createAppRouter } from "./routes";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Sprawdź tryb demo
    if (mockApi.isDemoMode()) {
      const demoUser = mockApi.getStoredUser();
      if (demoUser) {
        setUser(demoUser);
        setIsDemoMode(true);
      }
    } else {
      // Sprawdź czy użytkownik jest już zalogowany przez API
      const storedUser = api.getStoredUser();
      if (storedUser && api.isAuthenticated()) {
        setUser(storedUser);
      }
    }
    setIsLoading(false);
  }, []);

  const handleDemoLogin = () => {
    const demoUser = mockApi.loginDemo();
    setUser(demoUser);
    setIsDemoMode(true);
    toast.success("Witaj w trybie demo! Testuj aplikację z przykładowymi danymi.");
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      setUser(response.user);
      toast.success(`Witaj! Zalogowano jako ${response.user.email}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd logowania");
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      await api.register(email, password);
      toast.success("Konto utworzone! Teraz możesz się zalogować.");
      // Automatyczne logowanie po rejestracji
      await handleLogin(email, password);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd rejestracji");
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    try {
      const response = await api.loginWithGoogle(credential);
      setUser(response.user);
      toast.success(`Witaj ${response.user.name || response.user.email}! Zalogowano przez Google.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd logowania przez Google");
    }
  };

  const handleLogout = () => {
    if (isDemoMode) {
      mockApi.logout();
      setIsDemoMode(false);
    } else {
      api.logout();
    }
    setUser(null);
    toast.info("Wylogowano pomyślnie");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <RouterProvider router={createAppRouter(user, handleLogout, isDemoMode)} />
      ) : (
        <LoginForm 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
          onDemoLogin={handleDemoLogin}
          onGoogleLogin={handleGoogleLogin}
        />
      )}
      <Toaster position="top-center" />
    </>
  );
}