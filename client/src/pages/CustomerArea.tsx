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
import { User, Settings, ShoppingBag, Star, LogOut, Download, CreditCard, Music } from "lucide-react";
import type { Order, OrderItem, Product } from "@shared/schema";

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
    avatar: { pt: "URL do Avatar", en: "Avatar URL", fr: "URL de l'avatar", es: "URL del Avatar", de: "Avatar-URL" },
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
    comments: { pt: "comentários", en: "comments", fr: "commentaires", es: "comentarios", de: "Kommentare" },
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
      queryClient.invalidateQueries({ queryKey: ['/api/customer/me'] });
      setLocation("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const getStars = (totalComments: number) => Math.min(5, Math.floor(totalComments / 100));

  const getDigitalProducts = () => {
    const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed');
    const digitalProductIds = new Set<string>();
    
    return products.filter(p => p.type === 'digital' && p.downloadUrl);
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
                  {profile.totalComments} {translate(t.comments)}
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
                      <Label htmlFor="avatar">{translate(t.avatar)}</Label>
                      <Input
                        id="avatar"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        placeholder="https://..."
                        data-testid="input-profile-avatar"
                      />
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
              </CardHeader>
              <CardContent>
                {getDigitalProducts().length === 0 ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-downloads">
                    {translate(t.noDownloads)}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {getDigitalProducts().map((product) => (
                      <Card key={product.id} className="hover-elevate" data-testid={`download-${product.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {product.images && product.images.length > 0 && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-16 w-16 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                              </div>
                            </div>
                            {product.downloadUrl && (
                              <Button asChild>
                                <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer" data-testid={`button-download-${product.id}`}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
