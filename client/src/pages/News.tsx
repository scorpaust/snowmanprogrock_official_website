import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { News } from "@shared/schema";

interface NewsProps {
  language: string;
}

export default function NewsPage({ language }: NewsProps) {
  const { data: news, isLoading } = useQuery<News[]>({ queryKey: ["/api/news"] });

  const t = {
    title: { pt: "NOTÍCIAS", en: "NEWS" },
    readMore: { pt: "Ler Mais", en: "Read More" },
    noNews: { pt: "Nenhuma notícia disponível", en: "No news available" },
    loading: { pt: "Carregando...", en: "Loading..." },
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
                {item.images[0] && (
                  <div className="aspect-video bg-gray-900">
                    <img
                      src={item.images[0]}
                      alt={language === 'en' && item.titleEn ? item.titleEn : item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {item.featured === 1 && <Badge>Featured</Badge>}
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US')}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'en' && item.titleEn ? item.titleEn : item.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 line-clamp-3 flex-1">
                    {language === 'en' && item.contentEn ? item.contentEn : item.content}
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
