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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  type: z.enum(['geral', 'eventos', 'parc', 'loja', 'imprensa']),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

interface ContactProps {
  language: string;
}

export default function Contact({ language }: ContactProps) {
  const [contactMode, setContactMode] = useState<'geral' | 'eventos' | 'parc'>('geral');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const { toast } = useToast();

  const t = {
    title: { pt: "CONTACTOS", en: "CONTACT" },
    modes: {
      geral: { pt: "Contacto Geral", en: "General Contact" },
      eventos: { pt: "Pedido de Orçamento para Evento", en: "Event Booking Request" },
      parc: { pt: "Parcerias / Loja / Imprensa", en: "Partnerships / Store / Press" },
    },
    form: {
      name: { pt: "Nome", en: "Name" },
      email: { pt: "Email", en: "Email" },
      phone: { pt: "Telefone (opcional)", en: "Phone (optional)" },
      message: { pt: "Mensagem", en: "Message" },
      submit: { pt: "Enviar", en: "Submit" },
    },
    success: {
      title: { pt: "Mensagem enviada!", en: "Message sent!" },
      description: { pt: "Obrigado pelo seu contacto. Receberá uma resposta em breve.", en: "Thank you for your message. You will receive a response soon." },
      ticketId: { pt: "ID do Ticket", en: "Ticket ID" },
    },
    info: {
      email: { pt: "E-mail", en: "Email" },
      phone: { pt: "Telefone", en: "Phone" },
      location: { pt: "Localização", en: "Location" },
    },
  };

  const translate = (key: any) => key[language as keyof typeof key] || key.pt;

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
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
      return response;
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
              <h3 className="font-semibold mb-4">Follow Us</h3>
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
