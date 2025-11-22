import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import type { Event } from "@shared/schema";
import { insertEventSchema } from "@shared/schema";
import { format } from "date-fns";

type EventForm = z.infer<typeof insertEventSchema>;

export default function EventsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: eventsList, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const form = useForm<EventForm>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      titleEn: "",
      venue: "",
      city: "",
      country: "Portugal",
      eventDate: new Date(),
      description: "",
      descriptionEn: "",
      ticketLink: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      const payload = {
        ...data,
        titleEn: data.titleEn || undefined,
        description: data.description || undefined,
        descriptionEn: data.descriptionEn || undefined,
        ticketLink: data.ticketLink || undefined,
      };
      const response = await apiRequest("POST", "/api/events", payload);
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar evento.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventForm> }) => {
      const payload = {
        ...data,
        titleEn: data.titleEn || undefined,
        description: data.description || undefined,
        descriptionEn: data.descriptionEn || undefined,
        ticketLink: data.ticketLink || undefined,
      };
      const response = await apiRequest("PATCH", `/api/events/${id}`, payload);
      if (!response.ok) throw new Error("Failed to update event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso.",
      });
      setIsDialogOpen(false);
      setSelectedEvent(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar evento.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/events/${id}`, undefined);
      if (!response.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Evento eliminado",
        description: "O evento foi eliminado com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao eliminar evento.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setSelectedEvent(null);
    form.reset({
      title: "",
      titleEn: "",
      venue: "",
      city: "",
      country: "Portugal",
      eventDate: new Date(),
      description: "",
      descriptionEn: "",
      ticketLink: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    form.reset({
      title: event.title,
      titleEn: event.titleEn || "",
      venue: event.venue,
      city: event.city,
      country: event.country,
      eventDate: new Date(event.eventDate),
      description: event.description || "",
      descriptionEn: event.descriptionEn || "",
      ticketLink: event.ticketLink || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: EventForm) => {
    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">A carregar eventos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
              <p className="text-muted-foreground">
                Gerir concertos e eventos da banda
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} data-testid="button-create-event">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos os Eventos</CardTitle>
            <CardDescription>
              {eventsList?.length || 0} eventos programados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cidade/País</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsList && eventsList.length > 0 ? (
                  eventsList.map((event) => (
                    <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {event.venue}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(event.eventDate), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {event.city}, {event.country}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(event)}
                            data-testid={`button-edit-${event.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(event.id)}
                            data-testid={`button-delete-${event.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum evento encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent ? "Editar Evento" : "Novo Evento"}
              </DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo. Os campos em inglês são opcionais.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título (PT) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nome do evento"
                            data-testid="input-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="titleEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título (EN)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Event title"
                            data-testid="input-title-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Casa da Música"
                            data-testid="input-venue"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Porto"
                            data-testid="input-city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Portugal"
                            data-testid="input-country"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora do Evento *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().slice(0, 16)
                              : field.value
                          }
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          data-testid="input-event-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (PT)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Descrição do evento em português"
                          rows={3}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (EN)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Event description in English"
                          rows={3}
                          data-testid="input-description-en"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ticketLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link para Bilhetes</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          type="url"
                          placeholder="https://..."
                          data-testid="input-ticket-link"
                        />
                      </FormControl>
                      <FormDescription>
                        URL completo para compra de bilhetes (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "A guardar..."
                      : selectedEvent
                      ? "Atualizar"
                      : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser revertida. O evento será permanentemente
                eliminado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
