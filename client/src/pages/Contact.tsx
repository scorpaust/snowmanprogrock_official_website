import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Contact } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const baseContactSchema = z.object({
  type: z.enum(['geral', 'eventos', 'parc', 'loja', 'imprensa']),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  expectedAttendees: z.string().optional(),
  partnershipType: z.string().optional(),
  companyName: z.string().optional(),
  storeInquiryType: z.string().optional(),
  outletName: z.string().optional(),
  deadline: z.string().optional(),
});

type ContactForm = z.infer<typeof baseContactSchema>;

interface ContactProps {
  language: string;
}

export default function Contact({ language }: ContactProps) {
  const [contactMode, setContactMode] = useState<'geral' | 'eventos' | 'parc' | 'loja' | 'imprensa'>('geral');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const { toast } = useToast();

  const t = {
    title: { pt: "CONTACTOS", en: "CONTACT", fr: "CONTACT", es: "CONTACTO", de: "KONTAKT" },
    modes: {
      geral: { pt: "Contacto Geral", en: "General Contact", fr: "Contact Général", es: "Contacto General", de: "Allgemeiner Kontakt" },
      eventos: { pt: "Orçamento para Evento", en: "Event Booking", fr: "Réservation d'Événement", es: "Reserva de Evento", de: "Veranstaltungsbuchung" },
      parc: { pt: "Parcerias", en: "Partnerships", fr: "Partenariats", es: "Asociaciones", de: "Partnerschaften" },
      loja: { pt: "Loja", en: "Store", fr: "Boutique", es: "Tienda", de: "Geschäft" },
      imprensa: { pt: "Imprensa", en: "Press", fr: "Presse", es: "Prensa", de: "Presse" },
    },
    form: {
      name: { pt: "Nome", en: "Name", fr: "Nom", es: "Nombre", de: "Name" },
      email: { pt: "Email", en: "Email", fr: "Email", es: "Email", de: "E-Mail" },
      phone: { pt: "Telefone (opcional)", en: "Phone (optional)", fr: "Téléphone (optionnel)", es: "Teléfono (opcional)", de: "Telefon (optional)" },
      message: { pt: "Mensagem", en: "Message", fr: "Message", es: "Mensaje", de: "Nachricht" },
      submit: { pt: "Enviar", en: "Submit", fr: "Envoyer", es: "Enviar", de: "Senden" },
      eventDate: { pt: "Data do Evento", en: "Event Date", fr: "Date de l'Événement", es: "Fecha del Evento", de: "Veranstaltungsdatum" },
      eventLocation: { pt: "Local do Evento", en: "Event Location", fr: "Lieu de l'Événement", es: "Ubicación del Evento", de: "Veranstaltungsort" },
      expectedAttendees: { pt: "Número Estimado de Participantes", en: "Expected Number of Attendees", fr: "Nombre Estimé de Participants", es: "Número Estimado de Asistentes", de: "Erwartete Teilnehmerzahl" },
      partnershipType: { pt: "Tipo de Parceria", en: "Partnership Type", fr: "Type de Partenariat", es: "Tipo de Asociación", de: "Art der Partnerschaft" },
      partnershipPlaceholder: { pt: "Ex: Patrocínio, Colaboração, etc.", en: "Ex: Sponsorship, Collaboration, etc.", fr: "Ex: Parrainage, Collaboration, etc.", es: "Ej: Patrocinio, Colaboración, etc.", de: "Z.B.: Sponsoring, Zusammenarbeit, usw." },
      companyName: { pt: "Nome da Empresa", en: "Company Name", fr: "Nom de l'Entreprise", es: "Nombre de la Empresa", de: "Firmenname" },
      storeInquiryType: { pt: "Tipo de Consulta", en: "Inquiry Type", fr: "Type de Demande", es: "Tipo de Consulta", de: "Art der Anfrage" },
      outletName: { pt: "Nome da Publicação/Outlet", en: "Publication/Outlet Name", fr: "Nom de la Publication/Média", es: "Nombre de la Publicación/Medio", de: "Name der Publikation/Medien" },
      deadline: { pt: "Prazo", en: "Deadline", fr: "Date Limite", es: "Fecha Límite", de: "Frist" },
    },
    success: {
      title: { pt: "Mensagem enviada!", en: "Message sent!", fr: "Message envoyé!", es: "¡Mensaje enviado!", de: "Nachricht gesendet!" },
      description: { pt: "Obrigado pelo seu contacto. Receberá uma resposta em breve.", en: "Thank you for your message. You will receive a response soon.", fr: "Merci pour votre message. Vous recevrez une réponse bientôt.", es: "Gracias por su mensaje. Recibirá una respuesta pronto.", de: "Danke für Ihre Nachricht. Sie erhalten bald eine Antwort." },
      ticketId: { pt: "ID do Ticket", en: "Ticket ID", fr: "ID du Ticket", es: "ID del Ticket", de: "Ticket-ID" },
    },
    info: {
      email: { pt: "E-mail", en: "Email", fr: "E-mail", es: "E-mail", de: "E-Mail" },
      phone: { pt: "Telefone", en: "Phone", fr: "Téléphone", es: "Teléfono", de: "Telefon" },
      location: { pt: "Localização", en: "Location", fr: "Localisation", es: "Ubicación", de: "Standort" },
    },
    social: {
      followUs: { pt: "Siga-nos", en: "Follow Us", fr: "Suivez-nous", es: "Síguenos", de: "Folgen Sie uns" },
    },
  };

  const translate = (key: any) => key[language as keyof typeof key] || key.pt;

  const form = useForm<ContactForm>({
    resolver: zodResolver(baseContactSchema),
    defaultValues: {
      type: 'geral',
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      const jsonData = await response.json();
      return jsonData as Contact;
    },
    onSuccess: (data) => {
      setTicketId(data.ticketId);
      form.reset();
      toast({
        title: translate(t.success.title),
        description: translate(t.success.description),
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactForm) => {
    const submissionData = { ...data, type: contactMode };
    contactMutation.mutate(submissionData);
  };

  const handleModeChange = (mode: typeof contactMode) => {
    setContactMode(mode);
    form.setValue('type', mode);
    setTicketId(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight uppercase mb-16" data-testid="text-contact-title">
          {translate(t.title)}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {/* Mode Selector */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Button
                  variant={contactMode === 'geral' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('geral')}
                  data-testid="button-mode-geral"
                >
                  {translate(t.modes.geral)}
                </Button>
                <Button
                  variant={contactMode === 'eventos' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('eventos')}
                  data-testid="button-mode-eventos"
                >
                  {translate(t.modes.eventos)}
                </Button>
                <Button
                  variant={contactMode === 'parc' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('parc')}
                  data-testid="button-mode-parc"
                >
                  {translate(t.modes.parc)}
                </Button>
                <Button
                  variant={contactMode === 'loja' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('loja')}
                  data-testid="button-mode-loja"
                >
                  {translate(t.modes.loja)}
                </Button>
                <Button
                  variant={contactMode === 'imprensa' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('imprensa')}
                  data-testid="button-mode-imprensa"
                >
                  {translate(t.modes.imprensa)}
                </Button>
              </div>

              {/* Success Message */}
              {ticketId && (
                <Card className="p-6 mb-8 bg-primary/10 border-primary/20" data-testid="card-success">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{translate(t.success.title)}</h3>
                      <p className="text-muted-foreground mb-2">{translate(t.success.description)}</p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">{translate(t.success.ticketId)}:</span>{" "}
                        <code className="bg-background px-2 py-1 rounded text-primary font-mono" data-testid="text-ticket-id">
                          {ticketId}
                        </code>
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate(t.form.name)}</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate(t.form.email)}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate(t.form.phone)}</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Event-specific fields */}
                  {contactMode === 'eventos' && (
                    <>
                      <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translate(t.form.eventDate)}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-event-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="eventLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translate(t.form.eventLocation)}</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-event-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expectedAttendees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translate(t.form.expectedAttendees)}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-expected-attendees" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Partnership-specific fields */}
                  {contactMode === 'parc' && (
                    <>
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translate(t.form.companyName)}</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-company-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="partnershipType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translate(t.form.partnershipType)}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={translate(t.form.partnershipPlaceholder)} data-testid="input-partnership-type" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Store-specific fields */}
                  {contactMode === 'loja' && (
                    <FormField
                      control={form.control}
                      name="storeInquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate(t.form.storeInquiryType)}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Product, Distribution, etc." data-testid="input-store-inquiry-type" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Press-specific fields */}
                  {contactMode === 'imprensa' && (
                    <>
                      <FormField
                        control={form.control}
                        name="outletName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translate(t.form.outletName)}</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-outlet-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translate(t.form.deadline)}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-deadline" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate(t.form.message)}</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={6} data-testid="textarea-message" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={contactMutation.isPending}
                    data-testid="button-submit"
                  >
                    {contactMutation.isPending ? "..." : translate(t.form.submit)}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{translate(t.info.email)}</h3>
                  <a
                    href="mailto:info@snowmanprogrock.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid="link-email"
                  >
                    info@snowmanprogrock.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{translate(t.info.phone)}</h3>
                  <a
                    href="tel:+351912345678"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid="link-phone"
                  >
                    +351 912 345 678
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{translate(t.info.location)}</h3>
                  <p className="text-muted-foreground" data-testid="text-location">
                    Lisboa, Portugal
                  </p>
                </div>
              </div>
            </Card>

            {/* Social Media Links */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">{translate(t.social.followUs)}</h3>
              <div className="space-y-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-social-facebook"
                >
                  <span>Facebook</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-social-instagram"
                >
                  <span>Instagram</span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-social-youtube"
                >
                  <span>YouTube</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
