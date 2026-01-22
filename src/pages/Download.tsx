import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download as DownloadIcon, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const Download = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const canInstall = useMemo(() => Boolean(installPrompt), [installPrompt]);

  useEffect(() => {
    const handler = (e: Event) => {
      // Chrome/Android
      e.preventDefault?.();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
            </Button>
          </Link>
          <h1 className="font-display text-3xl text-primary">Download</h1>
          <div className="w-24" />
        </header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="overflow-hidden card-glow">
            <div className="relative">
              {/* NOTE: Cover image will be wired once the upload is accessible in repo */}
              <div className="aspect-[16/9] w-full bg-muted flex items-center justify-center">
                <div className="text-center px-6">
                  <p className="font-display text-2xl text-primary">GitLife</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Cover wird hier angezeigt (falls es im Projekt verfügbar ist)
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground">
                  Du kannst GitLife als installierbare Web-App herunterladen (wie eine echte App auf dem Homescreen).
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 card-glow">
            <h2 className="font-display text-xl text-foreground">Installieren (empfohlen)</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Android/Chrome zeigt hier einen echten Install-Button. Auf iPhone/iPad:
              <span className="text-foreground"> Teilen → „Zum Home-Bildschirm“</span>.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleInstall}
                disabled={!canInstall || isInstalling}
                className="game-btn"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                {canInstall ? (isInstalling ? "Installiere…" : "Jetzt installieren") : "Install (öffnet sich am Handy)"}
              </Button>

              <a href="/" className="inline-flex">
                <Button variant="outline" className="w-full">
                  App öffnen <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            <Separator className="my-6" />

            <h3 className="font-display text-lg text-foreground">Direkt-Link</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Diese Seite ist dein „purer Download“-Link:
              <span className="text-foreground"> /download</span>
            </p>
          </Card>
        </motion.section>
      </div>
    </main>
  );
};

export default Download;
