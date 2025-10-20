import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initGA } from "../lib/analytics";
import { useAnalytics } from "../hooks/use-analytics";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Band from "./pages/Band";
import News from "./pages/News";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/admin/Login";
import SpotifySettings from "./pages/admin/SpotifySettings";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Store from "./pages/Store";
import NotFound from "@/pages/not-found";

function Router({ language }: { language: string }) {
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={() => <Home language={language} />} />
      <Route path="/banda" component={() => <Band language={language} />} />
      <Route path="/noticias" component={() => <News language={language} />} />
      <Route path="/eventos" component={() => <Events language={language} />} />
      <Route path="/galeria" component={() => <Gallery language={language} />} />
      <Route path="/contactos" component={() => <Contact language={language} />} />
      <Route path="/loja" component={() => <Store language={language} />} />
      <Route path="/loja/checkout" component={() => <Checkout language={language} />} />
      <Route path="/loja/pedido/:orderId" component={OrderConfirmation} />
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/spotify" component={SpotifySettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [language, setLanguage] = useState<string>('pt');

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      setLanguage('en');
    } else if (browserLang.startsWith('pt')) {
      setLanguage('pt');
    } else if (browserLang.startsWith('fr')) {
      setLanguage('fr');
    } else if (browserLang.startsWith('es')) {
      setLanguage('es');
    } else if (browserLang.startsWith('de')) {
      setLanguage('de');
    }
  }, []);

  useEffect(() => {
    initGA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation language={language} setLanguage={setLanguage} />
          <main className="flex-1">
            <Router language={language} />
          </main>
          <Footer language={language} />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
