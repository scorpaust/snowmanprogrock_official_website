import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoSnowman from "@assets/logo_snowman_transp_GRANDE_White_1760995391367.png";

interface NavigationProps {
  language: string;
  setLanguage: (lang: string) => void;
}

export default function Navigation({ language, setLanguage }: NavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/", label: { pt: "Início", en: "Home" } },
    { path: "/banda", label: { pt: "Banda", en: "Band" } },
    { path: "/noticias", label: { pt: "Notícias", en: "News" } },
    { path: "/eventos", label: { pt: "Eventos", en: "Events" } },
    { path: "/galeria", label: { pt: "Galeria", en: "Gallery" } },
    { path: "/contactos", label: { pt: "Contactos", en: "Contact" } },
  ];

  const t = (key: { pt: string; en: string }) => key[language as keyof typeof key] || key.pt;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" data-testid="link-logo">
              <img 
                src={logoSnowman} 
                alt="Snowman" 
                className="h-10 w-auto hover-elevate active-elevate-2 transition-all"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <Link key={item.path} href={item.path} data-testid={`link-${item.label.en.toLowerCase()}`}>
                  <span
                    className={`text-sm font-medium tracking-wide uppercase transition-colors relative group ${
                      location === item.path
                        ? "text-primary"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {t(item.label)}
                    {location === item.path && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"></span>
                    )}
                  </span>
                </Link>
              ))}
            </div>

            {/* Language Switcher & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
                data-testid="button-language-toggle"
                className="text-gray-300 hover:text-white"
              >
                <Globe className="h-5 w-5" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-lg md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`link-mobile-${item.label.en.toLowerCase()}`}
              >
                <span
                  className={`text-2xl font-semibold tracking-wide uppercase transition-colors ${
                    location === item.path
                      ? "text-primary"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {t(item.label)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
