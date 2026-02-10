import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { News, Event, Gallery } from "@shared/schema";
import logoSnowman from "@assets/logo_snowman_transp_GRANDE_White_1760995391367.png";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";

interface HomeProps {
  language: string;
}

export default function Home({ language }: HomeProps) {
  const { data: news } = useQuery<News[]>({ queryKey: ["/api/news"] });
  const { data: events } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: gallery } = useQuery<Gallery[]>({ queryKey: ["/api/gallery"] });

  const t = {
    hero: {
      subtitle: { pt: "Rock Progressivo de Portugal", en: "Progressive Rock from Portugal", fr: "Rock Progressif du Portugal", es: "Rock Progresivo de Portugal", de: "Progressive Rock aus Portugal" },
      cta: { pt: "Explorar Música", en: "Explore Music", fr: "Explorer la Musique", es: "Explorar Música", de: "Musik Entdecken" },
    },
    latestNews: { pt: "ÚLTIMAS NOTÍCIAS", en: "LATEST NEWS", fr: "DERNIÈRES NOUVELLES", es: "ÚLTIMAS NOTICIAS", de: "NEUESTE NACHRICHTEN" },
    upcomingShows: { pt: "PRÓXIMOS CONCERTOS", en: "UPCOMING SHOWS", fr: "PROCHAINS CONCERTS", es: "PRÓXIMOS CONCIERTOS", de: "KOMMENDE KONZERTE" },
    gallery: { pt: "GALERIA", en: "GALLERY", fr: "GALERIE", es: "GALERÍA", de: "GALERIE" },
    viewAll: { pt: "Ver Tudo", en: "View All", fr: "Voir Tout", es: "Ver Todo", de: "Alle Anzeigen" },
    readMore: { pt: "Ler Mais", en: "Read More", fr: "Lire Plus", es: "Leer Más", de: "Mehr Lesen" },
    noNews: { pt: "Nenhuma notícia disponível", en: "No news available", fr: "Aucune actualité disponible", es: "No hay noticias disponibles", de: "Keine Nachrichten verfügbar" },
    noEvents: { pt: "Nenhum evento agendado", en: "No upcoming events", fr: "Aucun événement à venir", es: "No hay eventos próximos", de: "Keine bevorstehenden Veranstaltungen" },
    tickets: { pt: "Bilhetes", en: "Tickets", fr: "Billets", es: "Entradas", de: "Tickets" },
  };

  const translate = (key: any) => key[language as keyof typeof key] || key.pt;

  const featuredNews = news?.filter(n => n.featured === 1).slice(0, 1)[0];
  const recentNews = news?.filter(n => n.featured !== 1).slice(0, 3) || [];
  const upcomingEvents = events?.filter(e => new Date(e.eventDate) >= new Date()).slice(0, 3) || [];
  const recentPhotos = gallery?.filter(g => g.type === 'photo').slice(0, 6) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <iframe
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ width: '100vw', height: '100vh', transform: 'scale(1.5)' }}
            src="https://www.youtube.com/embed/KFLrODgIx4k?autoplay=1&mute=1&loop=1&playlist=KFLrODgIx4k&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
            title="Snowman Background Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black z-10"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <img 
            src={logoSnowman} 
            alt="Snowman" 
            className="h-48 md:h-80 lg:h-96 w-auto mx-auto mb-8"
            data-testid="img-hero-logo"
          />
          <p className="text-xl md:text-2xl text-gray-300 tracking-wide uppercase mb-12" data-testid="text-hero-subtitle">
            {translate(t.hero.subtitle)}
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-sm"
            asChild
            data-testid="button-explore-music"
          >
            <a href="#news">{translate(t.hero.cta)}</a>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-gray-400" />
        </div>
      </section>

      {/* Spotify Player Section */}
      <section className="py-12 px-4 bg-background/50">
        <div className="max-w-3xl mx-auto">
          <SpotifyPlayer />
        </div>
      </section>

      {/* Latest News Section */}
      <section id="news" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold tracking-tight uppercase" data-testid="text-latest-news">
              {translate(t.latestNews)}
            </h2>
            <Link href="/noticias">
              <Button variant="ghost" className="group" data-testid="button-view-all-news">
                {translate(t.viewAll)}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {news && news.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Featured News */}
              {featuredNews && (
                <Card className="lg:col-span-2 overflow-hidden hover-elevate" data-testid="card-featured-news">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-auto bg-gray-900">
                      {featuredNews.images[0] && (
                        <img
                          src={featuredNews.images[0]}
                          alt={({en: featuredNews.titleEn, fr: featuredNews.titleFr, es: featuredNews.titleEs, de: featuredNews.titleDe}[language]) || featuredNews.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-between">
                      <div>
                        <Badge className="mb-4">Featured</Badge>
                        <h3 className="text-3xl font-bold mb-4">
                          {({en: featuredNews.titleEn, fr: featuredNews.titleFr, es: featuredNews.titleEs, de: featuredNews.titleDe}[language]) || featuredNews.title}
                        </h3>
                        <p className="text-muted-foreground mb-6 line-clamp-3">
                          {({en: featuredNews.contentEn, fr: featuredNews.contentFr, es: featuredNews.contentEs, de: featuredNews.contentDe}[language]) || featuredNews.content}
                        </p>
                      </div>
                      <Link href={`/noticias/${featuredNews.id}`}>
                        <Button variant="outline" data-testid={`button-read-news-${featuredNews.id}`}>
                          {translate(t.readMore)}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )}

              {/* Recent News Grid */}
              {recentNews.map((item) => (
                <Card key={item.id} className="overflow-hidden hover-elevate" data-testid={`card-news-${item.id}`}>
                  {item.images[0] && (
                    <div className="aspect-video bg-gray-900">
                      <img
                        src={item.images[0]}
                        alt={({en: item.titleEn, fr: item.titleFr, es: item.titleEs, de: item.titleDe}[language]) || item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">
                      {({en: item.titleEn, fr: item.titleFr, es: item.titleEs, de: item.titleDe}[language]) || item.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {({en: item.contentEn, fr: item.contentFr, es: item.contentEs, de: item.contentDe}[language]) || item.content}
                    </p>
                    <Link href={`/noticias/${item.id}`}>
                      <Button variant="ghost" size="sm" className="p-0" data-testid={`button-read-news-${item.id}`}>
                        {translate(t.readMore)} →
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
      </section>

      {/* Upcoming Shows Section */}
      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold tracking-tight uppercase" data-testid="text-upcoming-shows">
              {translate(t.upcomingShows)}
            </h2>
            <Link href="/eventos">
              <Button variant="ghost" className="group" data-testid="button-view-all-events">
                {translate(t.viewAll)}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover-elevate" data-testid={`card-event-${event.id}`}>
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className="bg-primary/10 border border-primary/20 p-4 rounded-md text-center min-w-[80px]">
                        <div className="text-2xl font-bold text-primary">
                          {new Date(event.eventDate).getDate()}
                        </div>
                        <div className="text-sm text-muted-foreground uppercase">
                          {new Date(event.eventDate).toLocaleString({pt:'pt-PT',en:'en-US',fr:'fr-FR',es:'es-ES',de:'de-DE'}[language as string] || 'pt-PT', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {({en: event.titleEn, fr: event.titleFr, es: event.titleEs, de: event.titleDe}[language as string]) || event.title}
                        </h3>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {event.venue}, {event.city}, {event.country}
                        </p>
                      </div>
                    </div>
                    {event.ticketLink && (
                      <Button variant="outline" asChild data-testid={`button-tickets-${event.id}`}>
                        <a href={event.ticketLink} target="_blank" rel="noopener noreferrer">
                          {translate(t.tickets)}
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12" data-testid="text-no-events">
              {translate(t.noEvents)}
            </p>
          )}
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold tracking-tight uppercase" data-testid="text-gallery">
              {translate(t.gallery)}
            </h2>
            <Link href="/galeria">
              <Button variant="ghost" className="group" data-testid="button-view-all-gallery">
                {translate(t.viewAll)}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {recentPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentPhotos.map((photo) => (
                <Link key={photo.id} href="/galeria">
                  <div
                    className="aspect-square bg-gray-900 rounded-md overflow-hidden hover-elevate cursor-pointer"
                    data-testid={`img-gallery-preview-${photo.id}`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
