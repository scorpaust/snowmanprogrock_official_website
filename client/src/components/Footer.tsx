import { Facebook, Instagram, Youtube } from "lucide-react";
import { SiSpotify, SiApplemusic, SiBandcamp, SiX } from "react-icons/si";
import logoSnowman from "@assets/logo_snowman_transp_GRANDE_White_1760995391367.png";

interface FooterProps {
  language: string;
}

export default function Footer({ language }: FooterProps) {
  const t = {
    followUs: { pt: "Siga-nos", en: "Follow Us", fr: "Suivez-nous", es: "Síguenos", de: "Folgen Sie uns" },
    listenOn: { pt: "Ouça em", en: "Listen On", fr: "Écoutez sur", es: "Escuchar en", de: "Hören Sie auf" },
    allRights: { pt: "Todos os direitos reservados", en: "All rights reserved", fr: "Tous droits réservés", es: "Todos los derechos reservados", de: "Alle Rechte vorbehalten" },
    tagline: { pt: "Rock Progressivo de Portugal", en: "Progressive Rock from Portugal", fr: "Rock Progressif du Portugal", es: "Rock Progresivo de Portugal", de: "Progressive Rock aus Portugal" },
  };

  const translate = (key: keyof typeof t) => t[key][language as keyof typeof t[keyof typeof t]] || t[key].pt;

  return (
    <footer className="bg-black border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img 
              src={logoSnowman} 
              alt="Snowman" 
              className="h-16 md:h-20 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm">{translate("tagline")}</p>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-gray-300 mb-4">
              {translate("followUs")}
            </h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/snowmanprogrock"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/snowmanprogrock"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@snowmanprogressiverock4833"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-youtube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/snowman50028425"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-twitter"
              >
                <SiX className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Streaming Platforms */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-gray-300 mb-4">
              {translate("listenOn")}
            </h4>
            <div className="flex gap-4">
              <a
                href="https://open.spotify.com/intl-pt/artist/7CrlODwdYEezWlZ2unZaY2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-spotify"
              >
                <SiSpotify className="h-5 w-5" />
              </a>
              <a
                href="https://music.apple.com/us/artist/snowman/1457004194"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-apple-music"
              >
                <SiApplemusic className="h-5 w-5" />
              </a>
              <a
                href="https://snowmanprogrock.bandcamp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-bandcamp"
              >
                <SiBandcamp className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Snowman. {translate("allRights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
