import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
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
import NewsDetail from "./pages/NewsDetail";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import SpotifySettings from "./pages/admin/SpotifySettings";
import NewsManagement from "./pages/admin/NewsManagement";
import EventsManagement from "./pages/admin/EventsManagement";
import GalleryManagement from "./pages/admin/GalleryManagement";
import BiographyEditor from "./pages/admin/BiographyEditor";
import UsersManagement from "./pages/admin/UsersManagement";
import ProductsManagement from "./pages/admin/ProductsManagement";
import CommentsModeration from "./pages/admin/CommentsModeration";
import ContactsManagement from "./pages/admin/ContactsManagement";
import BandMembersManagement from "./pages/admin/BandMembersManagement";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Store from "./pages/Store";
import ProductDetail from "./pages/ProductDetail";
import CustomerAuth from "./pages/CustomerAuth";
import CustomerArea from "./pages/CustomerArea";
import NotFound from "@/pages/not-found";

function Router({ language, setLanguage }: { language: string; setLanguage: (lang: string) => void }) {
  useAnalytics();
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  
  return (
    <>
      {!isAdminRoute && <Navigation language={language} setLanguage={setLanguage} />}
      <Switch>
        <Route path="/" component={() => <Home language={language} />} />
        <Route path="/banda" component={() => <Band language={language} />} />
        <Route path="/noticias" component={() => <News language={language} />} />
        <Route path="/noticias/:id" component={() => <NewsDetail language={language} />} />
        <Route path="/eventos" component={() => <Events language={language} />} />
        <Route path="/galeria" component={() => <Gallery language={language} />} />
        <Route path="/contactos" component={() => <Contact language={language} />} />
        <Route path="/loja" component={() => <Store language={language} />} />
        <Route path="/loja/produto/:id" component={() => <ProductDetail language={language} />} />
        <Route path="/loja/checkout" component={() => <Checkout language={language} />} />
        <Route path="/loja/pedido/:orderId" component={OrderConfirmation} />
        <Route path="/auth" component={() => <CustomerAuth language={language} />} />
        <Route path="/cliente" component={() => <CustomerArea language={language} />} />
        <Route path="/admin/login" component={Login} />
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/spotify" component={SpotifySettings} />
        <Route path="/admin/noticias" component={NewsManagement} />
        <Route path="/admin/eventos" component={EventsManagement} />
        <Route path="/admin/galeria" component={GalleryManagement} />
        <Route path="/admin/biografia" component={BiographyEditor} />
        <Route path="/admin/produtos" component={ProductsManagement} />
        <Route path="/admin/comentarios" component={CommentsModeration} />
        <Route path="/admin/contactos" component={ContactsManagement} />
        <Route path="/admin/membros" component={BandMembersManagement} />
        <Route path="/admin/utilizadores" component={UsersManagement} />
        <Route component={NotFound} />
      </Switch>
      {!isAdminRoute && <Footer language={language} />}
    </>
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
          <main className="flex-1">
            <Router language={language} setLanguage={setLanguage} />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
