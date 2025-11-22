import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginDialogProps {
  title?: string;
  logo?: string;
  open?: boolean;
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

type AuthMode = "login" | "register";

export function LoginDialog({
  title = APP_TITLE,
  logo = APP_LOGO,
  open = false,
  onSuccess,
  onOpenChange,
  onClose,
}: LoginDialogProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(nextOpen);
    }

    if (!nextOpen) {
      setError(null);
      setEmail("");
      setPassword("");
      setName("");
      onClose?.();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email, password }
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      // Success - refresh the page or call callback
      onSuccess?.();
      window.location.reload();
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="py-5 bg-[#f8f8f7] rounded-[20px] w-[400px] shadow-[0px_4px_11px_0px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl p-0 gap-0 text-center">
        <div className="flex flex-col items-center gap-2 p-5 pt-8">
          <div className="w-16 h-16 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] flex items-center justify-center">
            <img src={logo} alt="App icon" className="w-10 h-10 rounded-md" />
          </div>

          <DialogTitle className="text-xl font-semibold text-[#34322d] leading-[26px] tracking-[-0.44px]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#858481] leading-5 tracking-[-0.154px]">
            {mode === "login"
              ? "Connectez-vous pour continuer"
              : "Créez votre compte"}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="px-5 space-y-4">
          {mode === "register" && (
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                required={mode === "register"}
              />
            </div>
          )}

          <div className="space-y-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean@example.com"
              required
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Min. 8 caractères" : "••••••••"}
              required
              minLength={mode === "register" ? 8 : undefined}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-left">{error}</div>
          )}

          <DialogFooter className="pt-2 pb-5 flex-col gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#1a1a19] hover:bg-[#1a1a19]/90 text-white rounded-[10px] text-sm font-medium leading-5 tracking-[-0.154px]"
            >
              {loading
                ? "Chargement..."
                : mode === "login"
                ? "Se connecter"
                : "Créer un compte"}
            </Button>

            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-[#858481] hover:text-[#34322d] transition-colors"
            >
              {mode === "login"
                ? "Pas de compte ? Inscrivez-vous"
                : "Déjà un compte ? Connectez-vous"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
