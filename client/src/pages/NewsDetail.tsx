import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play } from "lucide-react";
import type { News } from "@shared/schema";
import { CommentSection } from "@/components/CommentSection";

const extractYoutubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

interface NewsDetailProps {
  language: string;
}

export default function NewsDetail({ language }: NewsDetailProps) {
  const { id } = useParams<{ id: string }>();
  
  const { data: allNews, isLoading } = useQuery<News[]>({ 
    queryKey: ["/api/news"] 
  });

  const news = allNews?.find(n => n.id === id);

  const t = {
    backToNews: { pt: "Voltar às Notícias", en: "Back to News", fr: "Retour aux Actualités", es: "Volver a Noticias", de: "Zurück zu Nachrichten" },
    featured: { pt: "Destaque", en: "Featured", fr: "À la une", es: "Destacado", de: "Hervorgehoben" },
    notFound: { pt: "Notícia não encontrada", en: "News not found", fr: "Actualité non trouvée", es: "Noticia no encontrada", de: "Nachricht nicht gefunden" },
    loading: { pt: "A carregar...", en: "Loading...", fr: "Chargement...", es: "Cargando...", de: "Laden..." },
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

  const translate = (key: Record<string, string>) => key[language] || key.pt;

  const getTitle = () => {
    if (!news) return '';
    return ({en: news.titleEn, fr: news.titleFr, es: news.titleEs, de: news.titleDe}[language]) || news.title;
  };

  const getContent = () => {
    if (!news) return '';
    return ({en: news.contentEn, fr: news.contentFr, es: news.contentEs, de: news.contentDe}[language]) || news.content;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-muted-foreground" data-testid="text-loading">{translate(t.loading)}</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/noticias">
            <Button variant="ghost" className="mb-8" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {translate(t.backToNews)}
            </Button>
          </Link>
          <p className="text-center text-muted-foreground py-12" data-testid="text-not-found">
            {translate(t.notFound)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/noticias">
          <Button variant="ghost" className="mb-8" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {translate(t.backToNews)}
          </Button>
        </Link>

        <article data-testid={`article-news-${news.id}`}>
          {news.images && news.images.length > 0 && (
            <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden mb-8">
              <img
                src={news.images[0]}
                alt={getTitle()}
                className="w-full h-full object-cover"
                data-testid="img-news-main"
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            {news.featured === 1 && (
              <Badge data-testid="badge-featured">{translate(t.featured)}</Badge>
            )}
            <span className="text-muted-foreground" data-testid="text-date">
              {new Date(news.publishedAt).toLocaleDateString(getLocale(language), {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-8" data-testid="text-title">
            {getTitle()}
          </h1>

          <div className="prose prose-lg prose-invert max-w-none" data-testid="text-content">
            {getContent().split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {news.videoUrls && news.videoUrls.length > 0 && (
            <div className="mt-12" data-testid="section-videos">
              <div className="flex items-center gap-3 mb-6">
                <Play className="h-5 w-5 text-red-500" />
                <h2 className="text-2xl font-bold">
                  {translate({
                    pt: "Vídeos",
                    en: "Videos",
                    fr: "Vidéos",
                    es: "Vídeos",
                    de: "Videos",
                  })}
                </h2>
              </div>
              <div className={`grid gap-6 ${news.videoUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {news.videoUrls.map((url, index) => {
                  const videoId = extractYoutubeId(url);
                  if (!videoId) return null;
                  return (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden bg-black/50 shadow-lg"
                      data-testid={`video-embed-${index}`}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title={`${getTitle()} - Video ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {news.images && news.images.length > 1 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Galeria</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {news.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square bg-muted/30 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${getTitle()} - ${index + 2}`}
                      className="w-full h-full object-cover"
                      data-testid={`img-gallery-${index}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        <CommentSection 
          contentType="news" 
          contentId={news.id} 
          language={language} 
        />
      </div>
    </div>
  );
}
