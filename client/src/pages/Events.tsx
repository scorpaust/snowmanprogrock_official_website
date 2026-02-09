import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, ExternalLink, Music } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Event } from "@shared/schema";

interface EventsProps {
  language: string;
}

export default function Events({ language }: EventsProps) {
  const { data: events, isLoading } = useQuery<Event[]>({ queryKey: ["/api/events"] });

  const t = {
    title: { pt: "EVENTOS", en: "EVENTS", fr: "ÉVÉNEMENTS", es: "EVENTOS", de: "VERANSTALTUNGEN" },
    upcoming: { pt: "Próximos Eventos", en: "Upcoming Events", fr: "Événements à Venir", es: "Próximos Eventos", de: "Kommende Veranstaltungen" },
    past: { pt: "Eventos Passados", en: "Past Events", fr: "Événements Passés", es: "Eventos Pasados", de: "Vergangene Veranstaltungen" },
    tickets: { pt: "Bilhetes", en: "Tickets", fr: "Billets", es: "Entradas", de: "Tickets" },
    noUpcoming: { pt: "Sem eventos agendados de momento. Fiquem atentos!", en: "No upcoming events scheduled. Stay tuned!", fr: "Aucun événement prévu pour le moment. Restez à l'écoute !", es: "No hay eventos programados por el momento. ¡Estén atentos!", de: "Derzeit keine Veranstaltungen geplant. Bleibt dran!" },
    noPast: { pt: "Nenhum evento passado", en: "No past events", fr: "Aucun événement passé", es: "No hay eventos pasados", de: "Keine vergangenen Veranstaltungen" },
    loading: { pt: "Carregando...", en: "Loading...", fr: "Chargement...", es: "Cargando...", de: "Laden..." },
    subtitle: { pt: "Concertos e aparições ao vivo", en: "Concerts and live appearances", fr: "Concerts et apparitions en direct", es: "Conciertos y apariciones en vivo", de: "Konzerte und Live-Auftritte" },
  };

  const getLocale = (lang: string) => {
    const localeMap: Record<string, string> = {
      pt: 'pt-PT', en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE',
    };
    return localeMap[lang] || 'pt-PT';
  };

  const translate = (key: any) => key[language as keyof typeof key] || key.pt;

  const getEventTitle = (event: Event) =>
    ({en: event.titleEn, fr: event.titleFr, es: event.titleEs, de: event.titleDe}[language]) || event.title;

  const getEventDescription = (event: Event) =>
    ({en: event.descriptionEn, fr: event.descriptionFr, es: event.descriptionEs, de: event.descriptionDe}[language]) || event.description;

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString(getLocale(language), {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString(getLocale(language), { hour: '2-digit', minute: '2-digit' });
  };

  const formatMonthShort = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleString(getLocale(language), { month: 'short' }).toUpperCase();
  };

  const now = new Date();
  const upcomingEvents = events?.filter(e => new Date(e.eventDate) >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()) || [];
  const pastEvents = events?.filter(e => new Date(e.eventDate) < now)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-muted-foreground" data-testid="text-loading">{translate(t.loading)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase mb-3" data-testid="text-events-title">
            {translate(t.title)}
          </h1>
          <p className="text-lg text-muted-foreground">{translate(t.subtitle)}</p>
        </div>

        <section className="mb-16 md:mb-20" data-testid="section-upcoming-events">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-primary/30" />
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-primary uppercase whitespace-nowrap" data-testid="text-upcoming-events">
              {translate(t.upcoming)}
            </h2>
            <div className="h-px flex-1 bg-primary/30" />
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-6">
              {upcomingEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className={`overflow-visible hover-elevate transition-all duration-300 ${index === 0 ? 'border-primary/40' : ''}`}
                  data-testid={`card-event-${event.id}`}
                >
                  <div className="p-5 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 md:gap-8">
                      <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 sm:min-w-[90px]">
                        <div className={`flex sm:flex-col items-center gap-2 sm:gap-0 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <span className="text-sm font-medium uppercase tracking-wider">
                            {formatMonthShort(event.eventDate)}
                          </span>
                          <span className="text-3xl sm:text-4xl font-bold leading-none">
                            {new Date(event.eventDate).getDate()}
                          </span>
                          <span className="text-sm opacity-70">
                            {new Date(event.eventDate).getFullYear()}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:block w-px bg-border self-stretch" />

                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${index === 0 ? '' : ''}`} data-testid={`text-event-title-${event.id}`}>
                          {getEventTitle(event)}
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                            <span>{event.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                            <span className="capitalize">{formatDate(event.eventDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 shrink-0 text-primary/70" />
                            <span>{formatTime(event.eventDate)}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-1">
                          {event.city}, {event.country}
                        </p>

                        {getEventDescription(event) && (
                          <p className="text-muted-foreground mt-3 leading-relaxed">
                            {getEventDescription(event)}
                          </p>
                        )}

                        {event.ticketLink && (
                          <div className="mt-5">
                            <Button variant="default" asChild data-testid={`button-tickets-${event.id}`}>
                              <a href={event.ticketLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                {translate(t.tickets)}
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-md border border-dashed border-border" data-testid="text-no-upcoming-events">
              <Music className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground text-lg">
                {translate(t.noUpcoming)}
              </p>
            </div>
          )}
        </section>

        {pastEvents.length > 0 && (
          <section data-testid="section-past-events">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-muted-foreground/20" />
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-muted-foreground uppercase whitespace-nowrap" data-testid="text-past-events">
                {translate(t.past)}
              </h2>
              <div className="h-px flex-1 bg-muted-foreground/20" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEvents.map((event) => (
                <Card key={event.id} className="bg-card/60 border-border/50" data-testid={`card-past-event-${event.id}`}>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-center min-w-[48px]">
                        <span className="text-2xl font-bold text-muted-foreground/70 leading-none block">
                          {new Date(event.eventDate).getDate()}
                        </span>
                        <span className="text-xs text-muted-foreground/50 uppercase">
                          {formatMonthShort(event.eventDate)}
                        </span>
                        <span className="text-xs text-muted-foreground/40 block">
                          {new Date(event.eventDate).getFullYear()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-muted-foreground/80 mb-1 truncate" data-testid={`text-past-event-title-${event.id}`}>
                          {getEventTitle(event)}
                        </h3>
                        <p className="text-sm text-muted-foreground/60 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{event.venue}, {event.city}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
