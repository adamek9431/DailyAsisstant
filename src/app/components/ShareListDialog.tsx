import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Trash2, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api, ListShare } from "../services/api";
import { mockApi, MockListShare } from "../services/mockApi";

interface ShareListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: number;
  isDemoMode?: boolean;
}

export function ShareListDialog({
  open,
  onOpenChange,
  listId,
  isDemoMode = false,
}: ShareListDialogProps) {
  const [userId, setUserId] = useState("");
  const [shares, setShares] = useState<(ListShare | MockListShare)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShares, setIsLoadingShares] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadShares = useCallback(async () => {
    setIsLoadingShares(true);
    try {
      if (isDemoMode) {
        const demoShares = mockApi.getListShares();
        setShares(demoShares);
      } else {
        const fetchedShares = await api.getListShares(listId);
        setShares(fetchedShares);
      }
    } catch (error) {
      console.error("Błąd pobierania udostępnień:", error);
      toast.error("Nie udało się pobrać listy udostępnień");
    } finally {
      setIsLoadingShares(false);
    }
  }, [listId, isDemoMode]);

  useEffect(() => {
    if (open) {
      loadShares();
      setErrorMessage("");
      setUserId("");
    }
  }, [open, loadShares]);

  const handleShare = async () => {
    const userIdNumber = parseInt(userId.trim());
    
    if (isNaN(userIdNumber) || userIdNumber <= 0) {
      setErrorMessage("Proszę wpisać prawidłowy numer ID użytkownika");
      toast.error("Nieprawidłowy numer ID");
      return;
    }

    // Sprawdź czy użytkownik już jest na liście
    const alreadyShared = shares.some((s) => s.user_id === userIdNumber);
    if (alreadyShared) {
      setErrorMessage("Lista jest już udostępniona temu użytkownikowi");
      toast.error("Lista już udostępniona");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    
    try {
      if (isDemoMode) {
        // W trybie demo generuj mock email
        const mockEmail = `user${userIdNumber}@example.com`;
        mockApi.createListShare(userIdNumber, mockEmail, `User ${userIdNumber}`);
        toast.success(`Lista udostępniona użytkownikowi ID: ${userIdNumber}`);
      } else {
        const response = await api.shareList(listId, userIdNumber);
        toast.success(response.message);
      }

      setUserId("");
      await loadShares();
    } catch (error: any) {
      const message = error.message || "Nie udało się udostępnić listy";
      setErrorMessage(message);
      toast.error(message, { duration: 5000 });
      console.error("Share error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (shareUserId: number) => {
    try {
      if (isDemoMode) {
        mockApi.deleteListShare(shareUserId);
        toast.success("Udostępnienie zostało usunięte");
      } else {
        await api.removeListShare(listId, shareUserId);
        toast.success("Udostępnienie zostało usunięte");
      }

      await loadShares();
    } catch (error: any) {
      toast.error(error.message || "Nie udało się usunąć udostępnienia");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Udostępnij listę zakupów</DialogTitle>
          <DialogDescription>
            Wpisz ID użytkownika, któremu chcesz udostępnić listę zakupów.
            {isDemoMode && (
              <span className="block mt-2 text-amber-600">
                Tryb demo: użyj dowolnego numeru (np. 2, 3, 4)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Komunikat błędu */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Formularz dodawania użytkownika */}
          <div className="grid gap-2">
            <Label htmlFor="userId">ID użytkownika</Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                type="number"
                placeholder="np. 123"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleShare();
                  }
                }}
                disabled={isLoading}
                min="1"
                step="1"
              />
              <Button
                onClick={handleShare}
                disabled={isLoading || !userId.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              💡 Wskazówka: Poproś drugą osobę o zalogowanie się do aplikacji i podanie swojego ID z zakładki "Profil"
            </p>
          </div>

          {/* Lista udostępnionych użytkowników */}
          <div className="grid gap-2">
            <Label>Udostępniono dla:</Label>
            {isLoadingShares ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : shares.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">
                Lista nie jest jeszcze nikomu udostępniona
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.user_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 font-mono">
                          ID: {share.user_id.toString().padStart(5, '0')}
                        </p>
                        {share.name && (
                          <span className="text-xs text-gray-500">
                            • {share.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {share.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveShare(share.user_id)}
                      className="ml-2 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}