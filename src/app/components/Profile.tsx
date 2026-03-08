import { useEffect, useState } from "react";
import { User as LucideUser, Copy, Check, LogOut, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { api, User } from "../services/api";
import { mockApi } from "../services/mockApi";

interface ProfileProps {
  isDemoMode: boolean;
  onLogout: () => void;
}

export function Profile({ isDemoMode, onLogout }: ProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [idCopied, setIdCopied] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        const demoUser = mockApi.getStoredUser();
        setUser(demoUser);
      } else {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Błąd pobierania profilu:", error);
      toast.error("Nie udało się pobrać danych profilu");
      
      // Fallback do localStorage
      const storedUser = api.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id.toString());
      setIdCopied(true);
      toast.success("ID skopiowane do schowka");
      setTimeout(() => setIdCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    if (confirm("Czy na pewno chcesz się wylogować?")) {
      onLogout();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500 mt-2">Ładowanie profilu...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500">Nie udało się załadować profilu</p>
        <Button onClick={loadUser} variant="outline" className="mt-4">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white">
        <h1 className="text-xl font-semibold text-gray-900">Profil</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Avatar i podstawowe info */}
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <LucideUser className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.name || user.email.split("@")[0]}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>

          {/* User ID Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                Twój unikalny kod użytkownika
              </p>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-5xl font-bold text-blue-900 tracking-wider font-mono">
                  {user.id.toString().padStart(5, '0')}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Podaj ten kod osobie, której chcesz udostępnić listę zakupów
                </p>
              </div>
              
              <Button
                onClick={handleCopyId}
                size="lg"
                variant="outline"
                className="flex-shrink-0 h-14 w-14 rounded-full border-2 border-blue-300 bg-white hover:bg-blue-50"
              >
                {idCopied ? (
                  <Check className="h-6 w-6 text-green-500" />
                ) : (
                  <Copy className="h-6 w-6 text-blue-500" />
                )}
              </Button>
            </div>
          </div>

          {/* Instrukcja */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">
              💡 Jak udostępnić listę zakupów?
            </h3>
            <ol className="text-xs text-amber-800 space-y-1.5 list-decimal list-inside">
              <li>Poproś drugą osobę o zalogowanie się do aplikacji</li>
              <li>Poproś ją o podanie swojego ID z tego widoku</li>
              <li>Wejdź w zakładkę "Lista zakupów"</li>
              <li>Kliknij przycisk "Udostępnij" (ikona ludzi)</li>
              <li>Wpisz ID użytkownika i kliknij "Udostępnij"</li>
            </ol>
          </div>

          {/* Demo mode banner */}
          {isDemoMode && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-xs font-medium text-purple-900 mb-1">
                🎭 Tryb Demo
              </p>
              <p className="text-xs text-purple-700">
                Działasz w trybie offline. Dane są przechowywane tylko lokalnie w przeglądarce.
              </p>
            </div>
          )}

          {/* Wyloguj */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Wyloguj się
          </Button>
        </div>
      </div>
    </div>
  );
}