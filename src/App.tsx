import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Timeline from "./pages/Timeline";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import Kontakt from "./pages/Kontakt";
import Premium from "./pages/Premium";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  console.log('App: Rendering...')
  
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ErrorBoundary>
              <AuthProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ErrorBoundary>
                    <AppShell>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/timeline" element={<Timeline />} />
                        <Route path="/premium" element={<Premium />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/impressum" element={<Impressum />} />
                        <Route path="/datenschutz" element={<Datenschutz />} />
                        <Route path="/agb" element={<AGB />} />
                        <Route path="/kontakt" element={<Kontakt />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppShell>
                  </ErrorBoundary>
                </BrowserRouter>
              </AuthProvider>
            </ErrorBoundary>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App;