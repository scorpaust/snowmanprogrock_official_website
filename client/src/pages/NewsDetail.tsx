import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { News } from "@shared/schema";
import { CommentSection } from "@/components/CommentSection";

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
    if (language === 'en' && news?.titleEn) return news.titleEn;
    return news?.title || '';
  };

  const getContent = () => {
    if (language === 'en' && news?.contentEn) return news.contentEn;
    return news?.content || '';
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
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-8">
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

          {news.images && news.images.length > 1 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Galeria</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {news.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
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
