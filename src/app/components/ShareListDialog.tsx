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
import { Loader2, Trash2, UserPlus } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [shares, setShares] = useState<(ListShare | MockListShare)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShares, setIsLoadingShares] = useState(false);

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
    }
  }, [open, loadShares]);

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error("Wprowadź adres email");
      return;
    }

    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Wprowadź poprawny adres email");
      return;
    }

    setIsLoading(true);
    try {
      if (isDemoMode) {
        // Sprawdź czy email już jest na liście
        const existing = shares.find((s) => s.email === email);
        if (existing) {
          toast.error("Ta lista jest już udostępniona temu użytkownikowi");
          return;
        }

        // Wyodrębnij imię z emaila dla demo
        const name = email.split("@")[0];
        mockApi.createListShare(email, name);
        toast.success(`Lista udostępniona użytkownikowi ${email}`);
      } else {
        const response = await api.shareList(listId, email);
        toast.success(response.message);
      }

      setEmail("");
      await loadShares();
    } catch (error: any) {
      toast.error(error.message || "Nie udało się udostępnić listy");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (shareEmail: string, userId?: number) => {
    try {
      if (isDemoMode) {
        mockApi.deleteListShare(shareEmail);
        toast.success("Udostępnienie zostało usunięte");
      } else {
        if (!userId) return;
        await api.removeListShare(listId, userId);
        toast.success("Udostępnienie zostało usunięte");
      }

      await loadShares();
    } catch (error: any) {
      toast.error(error.message || "Nie udało się usunąć udostępnienia");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Udostępnij listę zakupów</DialogTitle>
          <DialogDescription>
            Wprowadź adres email użytkownika, któremu chcesz udostępnić listę.
            {isDemoMode && (
              <span className="block mt-2 text-amber-600">
                Tryb demo: możesz wprowadzić dowolny email do testowania
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Formularz dodawania użytkownika */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email użytkownika</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="jan.kowalski@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleShare();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                onClick={handleShare}
                disabled={isLoading || !email.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
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
                    key={share.email}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {share.name || share.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {share.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveShare(share.email, share.user_id)
                      }
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