import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin } from "lucide-react";
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
    noUpcoming: { pt: "Nenhum evento agendado", en: "No upcoming events", fr: "Aucun événement à venir", es: "No hay eventos próximos", de: "Keine bevorstehenden Veranstaltungen" },
    noPast: { pt: "Nenhum evento passado", en: "No past events", fr: "Aucun événement passé", es: "No hay eventos pasados", de: "Keine vergangenen Veranstaltungen" },
    loading: { pt: "Carregando...", en: "Loading...", fr: "Chargement...", es: "Cargando...", de: "Laden..." },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight uppercase mb-16" data-testid="text-events-title">
          {translate(t.title)}
        </h1>

        {/* Upcoming Events */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 tracking-tight" data-testid="text-upcoming-events">
            {translate(t.upcoming)}
          </h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover-elevate" data-testid={`card-event-${event.id}`}>
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-6 flex-1">
                      <div className="bg-primary/10 border border-primary/20 p-4 rounded-md text-center min-w-[80px]">
                        <div className="text-2xl font-bold text-primary">
                          {new Date(event.eventDate).getDate()}
                        </div>
                        <div className="text-sm text-muted-foreground uppercase">
                          {new Date(event.eventDate).toLocaleString(getLocale(language), { month: 'short' })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.eventDate).getFullYear()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">
                          {({en: event.titleEn, fr: event.titleFr, es: event.titleEs, de: event.titleDe}[language]) || event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4" />
                          <span>{event.venue}, {event.city}, {event.country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.eventDate).toLocaleString(getLocale(language), {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-muted-foreground">
                            {({en: event.descriptionEn, fr: event.descriptionFr, es: event.descriptionEs, de: event.descriptionDe}[language]) || event.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {event.ticketLink && (
                      <Button variant="default" asChild data-testid={`button-tickets-${event.id}`}>
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
            <p className="text-center text-muted-foreground py-12 bg-card/50 rounded-md" data-testid="text-no-upcoming-events">
              {translate(t.noUpcoming)}
            </p>
          )}
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 tracking-tight opacity-60" data-testid="text-past-events">
              {translate(t.past)}
            </h2>
            <div className="space-y-4 opacity-60">
              {pastEvents.map((event) => (
                <Card key={event.id} className="bg-card/50" data-testid={`card-past-event-${event.id}`}>
                  <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-start gap-6 flex-1">
                      <div className="bg-muted/50 p-4 rounded-md text-center min-w-[80px]">
                        <div className="text-2xl font-bold">
                          {new Date(event.eventDate).getDate()}
                        </div>
                        <div className="text-sm text-muted-foreground uppercase">
                          {new Date(event.eventDate).toLocaleString(getLocale(language), { month: 'short' })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.eventDate).getFullYear()}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {({en: event.titleEn, fr: event.titleFr, es: event.titleEs, de: event.titleDe}[language]) || event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.venue}, {event.city}</span>
                        </div>
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
