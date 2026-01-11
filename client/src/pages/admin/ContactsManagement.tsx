import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Check, Clock, Trash2, Eye, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Contact = {
  id: string;
  ticketId: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  eventDate: string | null;
  eventLocation: string | null;
  companyName: string | null;
  website: string | null;
  orderNumber: string | null;
  mediaOutlet: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const typeLabels: Record<string, string> = {
  geral: "Geral",
  eventos: "Eventos",
  parc: "Parcerias",
  loja: "Loja",
  imprensa: "Imprensa",
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  read: "Lido",
  replied: "Respondido",
  closed: "Fechado",
};

export default function ContactsManagement() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/contacts/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({ title: "Estado atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar estado", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contacts/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setSelectedContact(null);
      toast({ title: "Mensagem eliminada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao eliminar mensagem", variant: "destructive" });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem a certeza que deseja eliminar esta mensagem permanentemente?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    if (contact.status === "new") {
      handleStatusChange(contact.id, "read");
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (filter === "all") return true;
    if (filter === "new") return contact.status === "new";
    if (filter === "read") return contact.status === "read";
    if (filter === "replied") return contact.status === "replied";
    if (filter === "closed") return contact.status === "closed";
    return contact.type === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-PT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default" className="bg-blue-500">{statusLabels[status]}</Badge>;
      case "read":
        return <Badge variant="secondary">{statusLabels[status]}</Badge>;
      case "replied":
        return <Badge variant="default" className="bg-green-500">{statusLabels[status]}</Badge>;
      case "closed":
        return <Badge variant="outline">{statusLabels[status]}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      geral: "bg-gray-500",
      eventos: "bg-purple-500",
      parc: "bg-orange-500",
      loja: "bg-green-500",
      imprensa: "bg-blue-500",
    };
    return (
      <Badge variant="outline" className={`${colors[type] || "bg-gray-500"} text-white border-0`}>
        {typeLabels[type] || type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">A carregar mensagens...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              Mensagens de Contacto
            </h1>
            <p className="text-muted-foreground">
              Gerir mensagens recebidas através do formulário de contacto
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Badge variant="secondary">Total: {contacts.length}</Badge>
            <Badge variant="default" className="bg-blue-500">
              Novos: {contacts.filter((c) => c.status === "new").length}
            </Badge>
          </div>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              Todos ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="new" data-testid="tab-new">
              Novos ({contacts.filter((c) => c.status === "new").length})
            </TabsTrigger>
            <TabsTrigger value="read" data-testid="tab-read">
              Lidos ({contacts.filter((c) => c.status === "read").length})
            </TabsTrigger>
            <TabsTrigger value="replied" data-testid="tab-replied">
              Respondidos ({contacts.filter((c) => c.status === "replied").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {filteredContacts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma mensagem encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      contact.status === "new" ? "border-l-4 border-l-blue-500" : ""
                    }`}
                    onClick={() => handleViewContact(contact)}
                    data-testid={`card-contact-${contact.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeBadge(contact.type)}
                            {getStatusBadge(contact.status)}
                            <span className="text-xs text-muted-foreground font-mono">
                              {contact.ticketId}
                            </span>
                          </div>
                          <h3 className="font-semibold truncate">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                          <p className="text-sm mt-2 line-clamp-2">{contact.message}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(contact.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedContact && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {getTypeBadge(selectedContact.type)}
                  <span className="text-xs font-mono text-muted-foreground">
                    {selectedContact.ticketId}
                  </span>
                </div>
                <DialogTitle className="text-xl">{selectedContact.name}</DialogTitle>
                <DialogDescription>{selectedContact.email}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>{" "}
                    {selectedContact.phone || "N/A"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data:</span>{" "}
                    {formatDate(selectedContact.createdAt)}
                  </div>
                  {selectedContact.eventDate && (
                    <div>
                      <span className="text-muted-foreground">Data do Evento:</span>{" "}
                      {selectedContact.eventDate}
                    </div>
                  )}
                  {selectedContact.eventLocation && (
                    <div>
                      <span className="text-muted-foreground">Local do Evento:</span>{" "}
                      {selectedContact.eventLocation}
                    </div>
                  )}
                  {selectedContact.companyName && (
                    <div>
                      <span className="text-muted-foreground">Empresa:</span>{" "}
                      {selectedContact.companyName}
                    </div>
                  )}
                  {selectedContact.website && (
                    <div>
                      <span className="text-muted-foreground">Website:</span>{" "}
                      <a
                        href={selectedContact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedContact.website}
                      </a>
                    </div>
                  )}
                  {selectedContact.orderNumber && (
                    <div>
                      <span className="text-muted-foreground">Nº Encomenda:</span>{" "}
                      {selectedContact.orderNumber}
                    </div>
                  )}
                  {selectedContact.mediaOutlet && (
                    <div>
                      <span className="text-muted-foreground">Meio de Comunicação:</span>{" "}
                      {selectedContact.mediaOutlet}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Mensagem:</h4>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <Select
                      value={selectedContact.status}
                      onValueChange={(value) => handleStatusChange(selectedContact.id, value)}
                    >
                      <SelectTrigger className="w-40" data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Novo</SelectItem>
                        <SelectItem value="read">Lido</SelectItem>
                        <SelectItem value="replied">Respondido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `mailto:${selectedContact.email}?subject=Re: ${selectedContact.ticketId}`;
                      }}
                      data-testid="button-reply-email"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Responder por Email
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedContact.id)}
                      data-testid="button-delete-contact"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
