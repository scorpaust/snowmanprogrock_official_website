import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Settings, ShoppingBag, Star, LogOut, Download, CreditCard, Music, Upload } from "lucide-react";
import type { Order, OrderItem, Product } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";
import { AlertCircle } from "lucide-react";

interface CustomerAreaProps {
  language: string;
}

type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  biography: string | null;
  musicalTastes: string | null;
  preferredPaymentMethod: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  totalComments: number;
};

export default function CustomerArea({ language }: CustomerAreaProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['/api/customer/me'],
  });
  
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/customer/orders'],
    enabled: !!profile,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  type DigitalPurchase = {
    orderItemId: string;
    productId: string;
    productName: string;
    productImage: string | null;
    orderNumber: string;
    purchaseDate: string;
    totalDownloadsUsed: number;
    maxDownloads: number;
    hasDigitalFile: boolean;
  };

  const { data: digitalPurchases = [], isLoading: downloadsLoading } = useQuery<DigitalPurchase[]>({
    queryKey: ['/api/customer/digital-purchases'],
    enabled: !!profile,
  });

  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    biography: "",
    musicalTastes: "",
    preferredPaymentMethod: "card",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Portugal",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        avatar: profile.avatar || "",
        biography: profile.biography || "",
        musicalTastes: profile.musicalTastes || "",
        preferredPaymentMethod: profile.preferredPaymentMethod || "card",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        postalCode: profile.postalCode || "",
        country: profile.country || "Portugal",
      });
    }
  }, [profile]);

  const t = {
    title: { pt: "Área de Cliente", en: "Customer Area", fr: "Espace Client", es: "Área de Cliente", de: "Kundenbereich" },
    profile: { pt: "Perfil", en: "Profile", fr: "Profil", es: "Perfil", de: "Profil" },
    orders: { pt: "Encomendas", en: "Orders", fr: "Commandes", es: "Pedidos", de: "Bestellungen" },
    downloads: { pt: "Downloads", en: "Downloads", fr: "Téléchargements", es: "Descargas", de: "Downloads" },
    name: { pt: "Nome", en: "Name", fr: "Nom", es: "Nombre", de: "Name" },
    email: { pt: "Email", en: "Email", fr: "Email", es: "Email", de: "E-Mail" },
    avatar: { pt: "Foto de Perfil", en: "Profile Picture", fr: "Photo de Profil", es: "Foto de Perfil", de: "Profilbild" },
    uploadAvatar: { pt: "Carregar Foto", en: "Upload Photo", fr: "Télécharger Photo", es: "Subir Foto", de: "Foto hochladen" },
    avatarUploaded: { pt: "Foto carregada com sucesso", en: "Photo uploaded successfully", fr: "Photo téléchargée", es: "Foto subida", de: "Foto hochgeladen" },
    uploaderTitle: { pt: "Carregar Foto", en: "Upload Photo", fr: "Télécharger Photo", es: "Subir Foto", de: "Foto hochladen" },
    uploaderDescription: { pt: "Arraste a foto para aqui ou clique para selecionar", en: "Drag photo here or click to select", fr: "Glissez la photo ici ou cliquez pour sélectionner", es: "Arrastra la foto aquí o haz clic para seleccionar", de: "Foto hierher ziehen oder klicken zum Auswählen" },
    uploaderDrop: { pt: "Arraste a foto aqui ou %{browseFiles}", en: "Drag photo here or %{browseFiles}", fr: "Glissez la photo ici ou %{browseFiles}", es: "Arrastra la foto aquí o %{browseFiles}", de: "Foto hierher ziehen oder %{browseFiles}" },
    uploaderBrowse: { pt: "procure no computador", en: "browse files", fr: "parcourir les fichiers", es: "buscar archivos", de: "Dateien durchsuchen" },
    uploaderComplete: { pt: "Upload completo", en: "Upload complete", fr: "Téléchargement terminé", es: "Subida completada", de: "Upload abgeschlossen" },
    uploaderDone: { pt: "Concluído", en: "Done", fr: "Terminé", es: "Hecho", de: "Fertig" },
    uploaderRemove: { pt: "Remover ficheiro", en: "Remove file", fr: "Supprimer le fichier", es: "Eliminar archivo", de: "Datei entfernen" },
    uploaderDevice: { pt: "O meu dispositivo", en: "My Device", fr: "Mon appareil", es: "Mi dispositivo", de: "Mein Gerät" },
    uploaderHint: { pt: "Largue a foto aqui", en: "Drop photo here", fr: "Déposez la photo ici", es: "Suelta la foto aquí", de: "Foto hier ablegen" },
    biography: { pt: "Biografia", en: "Biography", fr: "Biographie", es: "Biografía", de: "Biografie" },
    musicalTastes: { pt: "Gostos Musicais", en: "Musical Tastes", fr: "Goûts Musicaux", es: "Gustos Musicales", de: "Musikgeschmack" },
    musicalTastesPlaceholder: { pt: "Ex: Rock Progressivo, Jazz, Metal...", en: "E.g.: Progressive Rock, Jazz, Metal...", fr: "Ex: Rock Progressif, Jazz, Metal...", es: "Ej: Rock Progresivo, Jazz, Metal...", de: "Z.B.: Progressive Rock, Jazz, Metal..." },
    preferredPayment: { pt: "Método de Pagamento Preferido", en: "Preferred Payment Method", fr: "Méthode de Paiement Préférée", es: "Método de Pago Preferido", de: "Bevorzugte Zahlungsmethode" },
    card: { pt: "Cartão", en: "Card", fr: "Carte", es: "Tarjeta", de: "Karte" },
    multibanco: { pt: "Multibanco", en: "Multibanco", fr: "Multibanco", es: "Multibanco", de: "Multibanco" },
    mbway: { pt: "MB WAY", en: "MB WAY", fr: "MB WAY", es: "MB WAY", de: "MB WAY" },
    paypal: { pt: "PayPal", en: "PayPal", fr: "PayPal", es: "PayPal", de: "PayPal" },
    phone: { pt: "Telefone", en: "Phone", fr: "Téléphone", es: "Teléfono", de: "Telefon" },
    address: { pt: "Morada", en: "Address", fr: "Adresse", es: "Dirección", de: "Adresse" },
    city: { pt: "Cidade", en: "City", fr: "Ville", es: "Ciudad", de: "Stadt" },
    postalCode: { pt: "Código Postal", en: "Postal Code", fr: "Code Postal", es: "Código Postal", de: "Postleitzahl" },
    country: { pt: "País", en: "Country", fr: "Pays", es: "País", de: "Land" },
    save: { pt: "Guardar Alterações", en: "Save Changes", fr: "Enregistrer", es: "Guardar Cambios", de: "Änderungen Speichern" },
    saving: { pt: "A guardar...", en: "Saving...", fr: "Enregistrement...", es: "Guardando...", de: "Speichern..." },
    saved: { pt: "Perfil atualizado com sucesso!", en: "Profile updated successfully!", fr: "Profil mis à jour!", es: "¡Perfil actualizado!", de: "Profil erfolgreich aktualisiert!" },
    logout: { pt: "Terminar Sessão", en: "Logout", fr: "Déconnexion", es: "Cerrar Sesión", de: "Abmelden" },
    noOrders: { pt: "Ainda não tens encomendas", en: "You have no orders yet", fr: "Vous n'avez pas encore de commandes", es: "Aún no tienes pedidos", de: "Sie haben noch keine Bestellungen" },
    noDownloads: { pt: "Ainda não tens downloads disponíveis", en: "You have no downloads available yet", fr: "Vous n'avez pas encore de téléchargements", es: "Aún no tienes descargas disponibles", de: "Sie haben noch keine Downloads" },
    downloadsRemaining: { pt: "downloads restantes", en: "downloads remaining", fr: "téléchargements restants", es: "descargas restantes", de: "Downloads verbleibend" },
    downloadLimitReached: { pt: "Limite de downloads atingido", en: "Download limit reached", fr: "Limite de téléchargements atteint", es: "Límite de descargas alcanzado", de: "Download-Limit erreicht" },
    generating: { pt: "A gerar link...", en: "Generating link...", fr: "Génération du lien...", es: "Generando enlace...", de: "Link wird generiert..." },
    downloadNow: { pt: "Descarregar", en: "Download", fr: "Télécharger", es: "Descargar", de: "Herunterladen" },
    purchasedOn: { pt: "Comprado em", en: "Purchased on", fr: "Acheté le", es: "Comprado el", de: "Gekauft am" },
    orderRef: { pt: "Encomenda", en: "Order", fr: "Commande", es: "Pedido", de: "Bestellung" },
    comment: { pt: "comentário aprovado", en: "approved comment", fr: "commentaire approuvé", es: "comentario aprobado", de: "genehmigter Kommentar" },
    comments: { pt: "comentários aprovados", en: "approved comments", fr: "commentaires approuvés", es: "comentarios aprobados", de: "genehmigte Kommentare" },
    stars: { pt: "estrelas", en: "stars", fr: "étoiles", es: "estrellas", de: "Sterne" },
    orderNumber: { pt: "Encomenda", en: "Order", fr: "Commande", es: "Pedido", de: "Bestellung" },
    status: { pt: "Estado", en: "Status", fr: "Statut", es: "Estado", de: "Status" },
    total: { pt: "Total", en: "Total", fr: "Total", es: "Total", de: "Gesamt" },
    date: { pt: "Data", en: "Date", fr: "Date", es: "Fecha", de: "Datum" },
    loading: { pt: "A carregar...", en: "Loading...", fr: "Chargement...", es: "Cargando...", de: "Laden..." },
    loginRequired: { pt: "Tens de estar logado para aceder a esta área", en: "You must be logged in to access this area", fr: "Vous devez être connecté pour accéder à cette zone", es: "Debes iniciar sesión para acceder", de: "Sie müssen angemeldet sein, um auf diesen Bereich zuzugreifen" },
    goToLogin: { pt: "Iniciar Sessão", en: "Go to Login", fr: "Se Connecter", es: "Iniciar Sesión", de: "Zur Anmeldung" },
  };

  const translate = (key: Record<string, string>) => key[language] || key.pt;

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PATCH", "/api/customer/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/me'] });
      toast({ title: translate(t.saved) });
    },
    onError: () => {
      toast({ title: "Error", variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/customer/logout", {});
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['/api/customer/me'] });
      queryClient.removeQueries({ queryKey: ['/api/customer/orders'] });
      queryClient.removeQueries({ queryKey: ['/api/customer/digital-purchases'] });
      setLocation("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const getStars = (totalComments: number) => Math.min(5, Math.floor(totalComments / 100));

  const getCommentLabel = (count: number) => {
    if (count === 1) {
      return translate(t.comment);
    }
    return translate(t.comments);
  };

  const [downloadingItem, setDownloadingItem] = useState<string | null>(null);

  const handleDownload = async (orderItemId: string) => {
    try {
      setDownloadingItem(orderItemId);
      const response = await apiRequest("POST", `/api/customer/downloads/${orderItemId}/generate-token`, {});
      const data = await response.json();

      if (data.token) {
        window.open(`/api/downloads/${data.token}`, '_blank');
        queryClient.invalidateQueries({ queryKey: ['/api/customer/digital-purchases'] });
      }
    } catch (error: any) {
      toast({
        title: translate(t.downloadLimitReached),
        variant: "destructive",
      });
    } finally {
      setDownloadingItem(null);
    }
  };

  const formatDate = (dateString: string) => {
    const localeMap: Record<string, string> = {
      pt: 'pt-PT', en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE',
    };
    return new Date(dateString).toLocaleDateString(localeMap[language] || 'pt-PT');
  };

  const getStatusTranslation = (status: string) => {
    const statusMap: Record<string, Record<string, string>> = {
      pending: { pt: "Pendente", en: "Pending", fr: "En attente", es: "Pendiente", de: "Ausstehend" },
      paid: { pt: "Pago", en: "Paid", fr: "Payé", es: "Pagado", de: "Bezahlt" },
      processing: { pt: "Em processamento", en: "Processing", fr: "En cours", es: "En proceso", de: "In Bearbeitung" },
      shipped: { pt: "Enviado", en: "Shipped", fr: "Expédié", es: "Enviado", de: "Versandt" },
      completed: { pt: "Concluído", en: "Completed", fr: "Terminé", es: "Completado", de: "Abgeschlossen" },
      cancelled: { pt: "Cancelado", en: "Cancelled", fr: "Annulé", es: "Cancelado", de: "Storniert" },
    };
    return statusMap[status]?.[language] || statusMap[status]?.pt || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-muted-foreground">{translate(t.loading)}</p>
      </div>
    );
  }

  if (!profile || error) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>{translate(t.loginRequired)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/auth">
              <Button className="w-full" data-testid="button-go-login">
                {translate(t.goToLogin)}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stars = getStars(profile.totalComments);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-customer-name">{profile.name}</h1>
              <p className="text-muted-foreground text-sm">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {profile.totalComments} {getCommentLabel(profile.totalComments)}
                </span>
                {stars > 0 && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => logoutMutation.mutate()} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            {translate(t.logout)}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <Settings className="h-4 w-4 mr-2" />
              {translate(t.profile)}
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              {translate(t.orders)}
            </TabsTrigger>
            <TabsTrigger value="downloads" data-testid="tab-downloads">
              <Download className="h-4 w-4 mr-2" />
              {translate(t.downloads)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{translate(t.profile)}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{translate(t.name)}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        data-testid="input-profile-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{translate(t.avatar)}</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/30">
                          <AvatarImage src={formData.avatar || undefined} />
                          <AvatarFallback>
                            <User className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880}
                          accept={["image/jpeg", "image/png", "image/webp", "image/gif"]}
                          onGetUploadParameters={async () => {
                            const response = await apiRequest("POST", "/api/customer/upload", {});
                            if (!response.ok) {
                              throw new Error("Failed to get upload URL");
                            }
                            const data = await response.json();
                            return { method: "PUT" as const, url: data.uploadURL };
                          }}
                          onComplete={async (result) => {
                            if (result.successful && result.successful.length > 0) {
                              const uploadedFile = result.successful[0];
                              const uploadUrl = (uploadedFile as any).uploadURL;
                              if (uploadUrl) {
                                const normalizeResponse = await apiRequest("POST", "/api/customer/normalize-path", {
                                  uploadURL: uploadUrl,
                                });
                                const normalizeData = await normalizeResponse.json();
                                setFormData({ ...formData, avatar: normalizeData.objectPath });
                                toast({ title: translate(t.avatarUploaded) });
                              }
                            }
                          }}
                          variant="outline"
                          data-testid="button-upload-avatar"
                          locale={{
                            dialogTitle: translate(t.uploaderTitle),
                            dialogDescription: translate(t.uploaderDescription),
                            dropPasteFiles: translate(t.uploaderDrop),
                            browseFiles: translate(t.uploaderBrowse),
                            uploadComplete: translate(t.uploaderComplete),
                            done: translate(t.uploaderDone),
                            removeFile: translate(t.uploaderRemove),
                            myDevice: translate(t.uploaderDevice),
                            dropHint: translate(t.uploaderHint),
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {translate(t.uploadAvatar)}
                        </ObjectUploader>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biography">{translate(t.biography)}</Label>
                    <Textarea
                      id="biography"
                      value={formData.biography}
                      onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                      rows={3}
                      data-testid="input-profile-biography"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="musicalTastes">
                      <Music className="h-4 w-4 inline mr-2" />
                      {translate(t.musicalTastes)}
                    </Label>
                    <Input
                      id="musicalTastes"
                      value={formData.musicalTastes}
                      onChange={(e) => setFormData({ ...formData, musicalTastes: e.target.value })}
                      placeholder={translate(t.musicalTastesPlaceholder)}
                      data-testid="input-profile-musical-tastes"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">
                      <CreditCard className="h-4 w-4 inline mr-2" />
                      {translate(t.preferredPayment)}
                    </Label>
                    <Select
                      value={formData.preferredPaymentMethod}
                      onValueChange={(value) => setFormData({ ...formData, preferredPaymentMethod: value })}
                    >
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">{translate(t.card)}</SelectItem>
                        <SelectItem value="multibanco">{translate(t.multibanco)}</SelectItem>
                        <SelectItem value="mbway">{translate(t.mbway)}</SelectItem>
                        <SelectItem value="paypal">{translate(t.paypal)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{translate(t.phone)}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        data-testid="input-profile-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{translate(t.country)}</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        data-testid="input-profile-country"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{translate(t.address)}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      data-testid="input-profile-address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{translate(t.city)}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        data-testid="input-profile-city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">{translate(t.postalCode)}</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        data-testid="input-profile-postal-code"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-profile">
                    {updateMutation.isPending ? translate(t.saving) : translate(t.save)}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{translate(t.orders)}</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-orders">
                    {translate(t.noOrders)}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="hover-elevate" data-testid={`order-${order.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{translate(t.orderNumber)} #{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(order.createdAt.toString())}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={order.status === 'completed' || order.status === 'paid' ? 'default' : 'secondary'}>
                                {getStatusTranslation(order.status)}
                              </Badge>
                              <p className="font-bold mt-2">{(order.totalAmount / 100).toFixed(2)}€</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle>{translate(t.downloads)}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {language === 'pt' ? 'Os downloads são exclusivos para ti. Cada compra permite até 5 downloads.' :
                   language === 'en' ? 'Downloads are exclusive to you. Each purchase allows up to 5 downloads.' :
                   language === 'fr' ? 'Les téléchargements sont exclusifs. Chaque achat permet jusqu\'à 5 téléchargements.' :
                   language === 'es' ? 'Las descargas son exclusivas para ti. Cada compra permite hasta 5 descargas.' :
                   'Downloads sind exklusiv für Sie. Jeder Kauf erlaubt bis zu 5 Downloads.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {downloadsLoading ? (
                  <p className="text-center text-muted-foreground py-8">{translate(t.loading)}</p>
                ) : digitalPurchases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-downloads">
                    {translate(t.noDownloads)}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {digitalPurchases.map((purchase) => {
                      const remainingDownloads = purchase.maxDownloads - purchase.totalDownloadsUsed;
                      const isLimitReached = remainingDownloads <= 0;
                      const isDownloading = downloadingItem === purchase.orderItemId;

                      return (
                        <Card key={purchase.orderItemId} className="hover-elevate" data-testid={`download-${purchase.orderItemId}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <div className="flex items-center gap-4">
                                {purchase.productImage && (
                                  <img
                                    src={purchase.productImage}
                                    alt={purchase.productName}
                                    className="h-16 w-16 rounded object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium" data-testid={`text-download-name-${purchase.orderItemId}`}>{purchase.productName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {translate(t.orderRef)} #{purchase.orderNumber}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {translate(t.purchasedOn)} {formatDate(purchase.purchaseDate)}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={isLimitReached ? "destructive" : "secondary"}>
                                      {isLimitReached
                                        ? translate(t.downloadLimitReached)
                                        : `${remainingDownloads}/${purchase.maxDownloads} ${translate(t.downloadsRemaining)}`
                                      }
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div>
                                {isLimitReached ? (
                                  <Button disabled variant="secondary" data-testid={`button-download-disabled-${purchase.orderItemId}`}>
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {translate(t.downloadLimitReached)}
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleDownload(purchase.orderItemId)}
                                    disabled={isDownloading}
                                    data-testid={`button-download-${purchase.orderItemId}`}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    {isDownloading ? translate(t.generating) : translate(t.downloadNow)}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
