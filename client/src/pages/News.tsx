import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Play } from "lucide-react";
import type { News } from "@shared/schema";

interface NewsProps {
  language: string;
}

export default function NewsPage({ language }: NewsProps) {
  const { data: news, isLoading } = useQuery<News[]>({ queryKey: ["/api/news"] });

  const t = {
    title: { pt: "NOTÍCIAS", en: "NEWS", fr: "ACTUALITÉS", es: "NOTICIAS", de: "NACHRICHTEN" },
    featured: { pt: "Destaque", en: "Featured", fr: "À la une", es: "Destacado", de: "Hervorgehoben" },
    readMore: { pt: "Ler Mais", en: "Read More", fr: "Lire Plus", es: "Leer Más", de: "Mehr Lesen" },
    noNews: { pt: "Nenhuma notícia disponível", en: "No news available", fr: "Aucune actualité disponible", es: "No hay noticias disponibles", de: "Keine Nachrichten verfügbar" },
    loading: { pt: "Carregando...", en: "Loading...", fr: "Chargement...", es: "Cargando...", de: "Laden..." },
    video: { pt: "Vídeo", en: "Video", fr: "Vidéo", es: "Vídeo", de: "Video" },
    videos: { pt: "Vídeos", en: "Videos", fr: "Vidéos", es: "Vídeos", de: "Videos" },
  };

  const getLocale = (lang: string) => {
    const localeMap: Record<string, string> = {
      pt: 'pt-PT',
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES',
      de: 'de-DE',
    };
    return localeMap[lang] || 'pt-PT';
  };

  const translate = (key: any) => key[language as keyof typeof key] || key.pt;

  const sortedNews = news?.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-muted-foreground" data-testid="text-loading">{translate(t.loading)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight uppercase mb-16" data-testid="text-news-title">
          {translate(t.title)}
        </h1>

        {sortedNews && sortedNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedNews.map((item) => (
              <Card key={item.id} className="overflow-hidden hover-elevate flex flex-col" data-testid={`card-news-${item.id}`}>
                <div className="aspect-video bg-muted/50 overflow-hidden">
                  {item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={({en: item.titleEn, fr: item.titleFr, es: item.titleEs, de: item.titleDe}[language]) || item.title}
                      className="w-full h-full object-cover"
                      data-testid={`img-news-${item.id}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {item.featured === 1 && <Badge>{translate(t.featured)}</Badge>}
                    {item.videoUrls && item.videoUrls.length > 0 && (
                      <Badge variant="outline" className="gap-1" data-testid={`badge-video-${item.id}`}>
                        <Play className="h-3 w-3 text-red-500 fill-red-500" />
                        {item.videoUrls.length === 1 ? translate(t.video) : `${item.videoUrls.length} ${translate(t.videos)}`}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleDateString(getLocale(language))}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    {({en: item.titleEn, fr: item.titleFr, es: item.titleEs, de: item.titleDe}[language]) || item.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 line-clamp-3 flex-1">
                    {({en: item.contentEn, fr: item.contentFr, es: item.contentEs, de: item.contentDe}[language]) || item.content}
                  </p>
                  <Link href={`/noticias/${item.id}`}>
                    <Button variant="outline" className="w-full" data-testid={`button-read-news-${item.id}`}>
                      {translate(t.readMore)}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12" data-testid="text-no-news">
            {translate(t.noNews)}
          </p>
        )}
      </div>
    </div>
  );
}
