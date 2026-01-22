import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Casino from "./pages/Casino";
import Settings from "./pages/Settings";
import Download from "./pages/Download";
import NotFound from "./pages/NotFound";
import { lockLandscapeOnNative } from "@/lib/screenOrientation";
import { seedEventsToDatabase } from "@/lib/seedDatabase";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Only affects the installed native app; does nothing in the browser.
    void lockLandscapeOnNative();

    // Ensure seed events (incl. "Wie viel ist dein Auto wert") exist in the backend.
    // Safe to call multiple times because we only insert missing titles.
    void seedEventsToDatabase();
  }, []);

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        mass: 0.9,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/casino" element={<Casino />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/download" element={<Download />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
};

export default App;
