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

type ApkRelease = {
  version: string; // e.g. 1.2.3
  file: string; // e.g. gitlife-v1.2.3.apk (stored under public/downloads)
  publishedAt?: string;
  notes?: string;
};

type ReleasesManifest = {
  releases: ApkRelease[];
};

const parseSemver = (v: string) => {
  const cleaned = v.trim().replace(/^v/i, "");
  const [maj, min, pat] = cleaned.split(".").map((n) => Number(n));
  return {
    raw: v,
    major: Number.isFinite(maj) ? maj : 0,
    minor: Number.isFinite(min) ? min : 0,
    patch: Number.isFinite(pat) ? pat : 0,
  };
};

const compareSemverDesc = (a: string, b: string) => {
  const A = parseSemver(a);
  const B = parseSemver(b);
  if (A.major !== B.major) return B.major - A.major;
  if (A.minor !== B.minor) return B.minor - A.minor;
  return B.patch - A.patch;
};

const Download = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [apkReleases, setApkReleases] = useState<ApkRelease[] | null>(null);
  const [apkManifestError, setApkManifestError] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/downloads/releases.json", { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ReleasesManifest;
        const releases = Array.isArray(json?.releases) ? json.releases : [];
        const sorted = [...releases]
          .filter((r) => r?.version && r?.file)
          .sort((a, b) => compareSemverDesc(a.version, b.version));
        if (!cancelled) setApkReleases(sorted);
      } catch (e) {
        if (!cancelled) {
          setApkReleases([]);
          setApkManifestError(
            "Kein releases.json gefunden – ich zeige den Fallback-Link (/downloads/gitlife.apk)."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
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

          <Card className="p-6 card-glow">
            <h2 className="font-display text-xl text-foreground">Android APK (Capacitor)</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Eine echte APK kann hier im Editor nicht gebaut werden – aber Capacitor ist jetzt vorbereitet.
              Lege deine versionierten APKs als
              <span className="text-foreground"> public/downloads/gitlife-vX.Y.Z.apk</span> ab und pflege
              <span className="text-foreground"> public/downloads/releases.json</span>. Diese Seite nimmt automatisch die neueste Version.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href={apkReleases?.[0]?.file ? `/downloads/${apkReleases[0].file}` : "/downloads/gitlife.apk"}
                className="inline-flex"
              >
                <Button className="game-btn w-full">
                  <DownloadIcon className="mr-2 h-4 w-4" /> APK herunterladen
                </Button>
              </a>
              <a
                href="https://developer.android.com/studio"
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" className="w-full">
                  Android Studio <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            {apkManifestError && (
              <p className="text-xs text-muted-foreground mt-3">{apkManifestError}</p>
            )}

            {apkReleases && apkReleases.length > 0 && (
              <div className="mt-6">
                <Separator className="my-4" />
                <h3 className="font-display text-lg text-foreground">Releases</h3>
                <div className="mt-3 space-y-3">
                  {apkReleases.map((r) => (
                    <div
                      key={r.version}
                      className="rounded-lg bg-card/50 border border-border p-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          v{r.version}{" "}
                          {r === apkReleases[0] ? (
                            <span className="text-xs text-primary ml-2">(neueste)</span>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {r.publishedAt ? `Datum: ${r.publishedAt}` : ""}
                        </p>
                        {r.notes ? (
                          <p className="text-sm text-muted-foreground mt-2">{r.notes}</p>
                        ) : null}
                      </div>
                      <a href={`/downloads/${r.file}`} className="shrink-0">
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.section>
      </div>
    </main>
  );
};

export default Download;
