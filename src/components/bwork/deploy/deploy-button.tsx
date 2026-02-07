"use client";

import { useState, useTransition } from "react";
import { Rocket, Copy, Loader2, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deployTool, getDeployLink } from "@/actions/deploy-actions";
import { TOAST_DURATION_MS } from "@/lib/constants";

type DeployButtonProps = {
  toolId: string;
  deployedUrl: string | null;
  accessType: "public" | "restricted";
};

export function DeployButton({
  toolId,
  deployedUrl,
  accessType,
}: DeployButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const isDeployed = !!deployedUrl;

  async function copyLink() {
    startTransition(async () => {
      const result = await getDeployLink(toolId);
      if (result?.link) {
        const fullUrl = `${window.location.origin}${result.link}`;
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Lien copie !", { duration: TOAST_DURATION_MS });
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  async function handleDeploy(type: "public" | "restricted") {
    if (type === "restricted") {
      setShowCodeDialog(true);
      return;
    }

    startTransition(async () => {
      const result = await deployTool(toolId, "public");
      if (result?.link) {
        const fullUrl = `${window.location.origin}${result.link}`;
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Lien copie !", { duration: TOAST_DURATION_MS });
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  async function handleRestrictedDeploy() {
    if (accessCode.length < 4) {
      setCodeError("Le code doit contenir au moins 4 caracteres.");
      return;
    }
    setCodeError("");

    startTransition(async () => {
      const result = await deployTool(toolId, "restricted", accessCode);
      if (result?.link) {
        const fullUrl = `${window.location.origin}${result.link}`;
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Lien copie !", { duration: TOAST_DURATION_MS });
        setShowCodeDialog(false);
        setAccessCode("");
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  // Already deployed → show "Copy link" button
  if (isDeployed) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          copyLink();
        }}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        Copier le lien
      </Button>
    );
  }

  // Not deployed → show Deploy dropdown
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Deployer
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem onClick={() => handleDeploy("public")}>
            <Globe className="h-4 w-4" />
            Public
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDeploy("restricted")}>
            <Lock className="h-4 w-4" />
            Restreint (code d'acces)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Code d'acces</DialogTitle>
            <DialogDescription>
              Choisissez un code que vos utilisateurs devront saisir pour acceder a l'outil.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Code d'acces (min 4 caracteres)"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              minLength={4}
              maxLength={100}
            />
            {codeError && (
              <p className="text-sm text-destructive">{codeError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCodeDialog(false);
                setAccessCode("");
                setCodeError("");
              }}
            >
              Annuler
            </Button>
            <Button
              disabled={isPending}
              onClick={handleRestrictedDeploy}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Deployer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
