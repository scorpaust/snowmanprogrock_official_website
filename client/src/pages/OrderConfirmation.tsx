import { useQuery } from "@tanstack/react-query";
import { useRoute, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Loader2, Package } from "lucide-react";
import { Link } from "wouter";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentIntentId: string | null;
  createdAt: string;
};

type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productNameEn: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export default function OrderConfirmation() {
  const [, params] = useRoute("/loja/pedido/:orderId");
  const searchString = useSearch();
  const orderId = params?.orderId;
  
  const searchParams = new URLSearchParams(searchString);
  const lang = searchParams.get('lang') || 'pt';

  const { data: order, isLoading: orderLoading } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
    refetchInterval: (data) => {
      if (!data) return false;
      return data.status === "pending" ? 3000 : false;
    },
  });

  const { data: orderItems, isLoading: itemsLoading } = useQuery<OrderItem[]>({
    queryKey: ["/api/orders", orderId, "items"],
    enabled: !!orderId,
  });

  if (orderLoading || itemsLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-order" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="pt-6">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2" data-testid="text-order-not-found">
              {lang === "pt" ? "Pedido não encontrado" : 
               lang === "en" ? "Order not found" :
               lang === "es" ? "Pedido no encontrado" :
               lang === "fr" ? "Commande introuvable" :
               "Bestellung nicht gefunden"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {lang === "pt" ? "Não foi possível encontrar este pedido." :
               lang === "en" ? "Could not find this order." :
               lang === "es" ? "No se pudo encontrar este pedido." :
               lang === "fr" ? "Impossible de trouver cette commande." :
               "Diese Bestellung konnte nicht gefunden werden."}
            </p>
            <Button asChild data-testid="button-back-to-store">
              <Link href="/loja">
                {lang === "pt" ? "Voltar à Loja" :
                 lang === "en" ? "Back to Store" :
                 lang === "es" ? "Volver a la Tienda" :
                 lang === "fr" ? "Retour à la Boutique" :
                 "Zurück zum Shop"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = order.status === "paid" || order.status === "completed";
  const isPending = order.status === "pending";
  const isFailed = order.status === "failed" || order.status === "cancelled";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader className="text-center">
          {isPaid && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" data-testid="icon-success" />
              <CardTitle className="text-3xl" data-testid="text-order-success">
                {lang === "pt" ? "Pedido Confirmado!" :
                 lang === "en" ? "Order Confirmed!" :
                 lang === "es" ? "¡Pedido Confirmado!" :
                 lang === "fr" ? "Commande Confirmée!" :
                 "Bestellung Bestätigt!"}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {lang === "pt" ? "Obrigado pela sua compra! Receberá um email de confirmação em breve." :
                 lang === "en" ? "Thank you for your purchase! You will receive a confirmation email shortly." :
                 lang === "es" ? "¡Gracias por su compra! Recibirá un correo de confirmación en breve." :
                 lang === "fr" ? "Merci pour votre achat! Vous recevrez un email de confirmation sous peu." :
                 "Vielen Dank für Ihren Einkauf! Sie erhalten in Kürze eine Bestätigungs-E-Mail."}
              </p>
            </>
          )}
          
          {isPending && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" data-testid="icon-pending" />
              <CardTitle className="text-3xl" data-testid="text-order-pending">
                {lang === "pt" ? "Pagamento Pendente" :
                 lang === "en" ? "Payment Pending" :
                 lang === "es" ? "Pago Pendiente" :
                 lang === "fr" ? "Paiement en Attente" :
                 "Zahlung Ausstehend"}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {lang === "pt" ? "O seu pagamento está a ser processado. Isto pode demorar alguns minutos." :
                 lang === "en" ? "Your payment is being processed. This may take a few minutes." :
                 lang === "es" ? "Su pago está siendo procesado. Esto puede tardar unos minutos." :
                 lang === "fr" ? "Votre paiement est en cours de traitement. Cela peut prendre quelques minutes." :
                 "Ihre Zahlung wird bearbeitet. Dies kann einige Minuten dauern."}
              </p>
            </>
          )}
          
          {isFailed && (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" data-testid="icon-failed" />
              <CardTitle className="text-3xl" data-testid="text-order-failed">
                {lang === "pt" ? "Pagamento Falhado" :
                 lang === "en" ? "Payment Failed" :
                 lang === "es" ? "Pago Fallido" :
                 lang === "fr" ? "Paiement Échoué" :
                 "Zahlung Fehlgeschlagen"}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {lang === "pt" ? "Houve um problema com o seu pagamento. Por favor, tente novamente." :
                 lang === "en" ? "There was a problem with your payment. Please try again." :
                 lang === "es" ? "Hubo un problema con su pago. Por favor, inténtelo de nuevo." :
                 lang === "fr" ? "Il y a eu un problème avec votre paiement. Veuillez réessayer." :
                 "Es gab ein Problem mit Ihrer Zahlung. Bitte versuchen Sie es erneut."}
              </p>
            </>
          )}
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "pt" ? "Detalhes do Pedido" :
               lang === "en" ? "Order Details" :
               lang === "es" ? "Detalles del Pedido" :
               lang === "fr" ? "Détails de la Commande" :
               "Bestelldetails"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {lang === "pt" ? "Número do Pedido" :
                 lang === "en" ? "Order Number" :
                 lang === "es" ? "Número de Pedido" :
                 lang === "fr" ? "Numéro de Commande" :
                 "Bestellnummer"}
              </p>
              <p className="font-medium" data-testid="text-order-number">{order.orderNumber}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">
                {lang === "pt" ? "Estado" :
                 lang === "en" ? "Status" :
                 lang === "es" ? "Estado" :
                 lang === "fr" ? "Statut" :
                 "Status"}
              </p>
              <p className="font-medium capitalize" data-testid="text-order-status">
                {order.status === "pending" && (lang === "pt" ? "Pendente" : lang === "en" ? "Pending" : lang === "es" ? "Pendiente" : lang === "fr" ? "En Attente" : "Ausstehend")}
                {order.status === "paid" && (lang === "pt" ? "Pago" : lang === "en" ? "Paid" : lang === "es" ? "Pagado" : lang === "fr" ? "Payé" : "Bezahlt")}
                {order.status === "completed" && (lang === "pt" ? "Completo" : lang === "en" ? "Completed" : lang === "es" ? "Completado" : lang === "fr" ? "Terminé" : "Abgeschlossen")}
                {order.status === "failed" && (lang === "pt" ? "Falhado" : lang === "en" ? "Failed" : lang === "es" ? "Fallido" : lang === "fr" ? "Échoué" : "Fehlgeschlagen")}
                {order.status === "cancelled" && (lang === "pt" ? "Cancelado" : lang === "en" ? "Cancelled" : lang === "es" ? "Cancelado" : lang === "fr" ? "Annulé" : "Storniert")}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">
                {lang === "pt" ? "Total" :
                 lang === "en" ? "Total" :
                 lang === "es" ? "Total" :
                 lang === "fr" ? "Total" :
                 "Gesamt"}
              </p>
              <p className="font-bold text-lg" data-testid="text-order-total">
                €{(order.totalAmount / 100).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "pt" ? "Informação do Cliente" :
               lang === "en" ? "Customer Information" :
               lang === "es" ? "Información del Cliente" :
               lang === "fr" ? "Informations Client" :
               "Kundeninformationen"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {lang === "pt" ? "Nome" : lang === "en" ? "Name" : lang === "es" ? "Nombre" : lang === "fr" ? "Nom" : "Name"}
              </p>
              <p className="font-medium" data-testid="text-customer-name">{order.customerName}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium" data-testid="text-customer-email">{order.customerEmail}</p>
            </div>
            {order.customerPhone && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {lang === "pt" ? "Telefone" : lang === "en" ? "Phone" : lang === "es" ? "Teléfono" : lang === "fr" ? "Téléphone" : "Telefon"}
                  </p>
                  <p className="font-medium" data-testid="text-customer-phone">{order.customerPhone}</p>
                </div>
              </>
            )}
            {order.shippingAddress && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {lang === "pt" ? "Morada de Envio" :
                     lang === "en" ? "Shipping Address" :
                     lang === "es" ? "Dirección de Envío" :
                     lang === "fr" ? "Adresse de Livraison" :
                     "Lieferadresse"}
                  </p>
                  <p className="font-medium whitespace-pre-line" data-testid="text-shipping-address">
                    {order.shippingAddress}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {orderItems && orderItems.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {lang === "pt" ? "Itens do Pedido" :
               lang === "en" ? "Order Items" :
               lang === "es" ? "Artículos del Pedido" :
               lang === "fr" ? "Articles de la Commande" :
               "Bestellte Artikel"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex justify-between items-start" data-testid={`item-${item.productId}`}>
                    <div className="flex-1">
                      <p className="font-medium" data-testid={`text-product-name-${item.productId}`}>
                        {lang === "en" && item.productNameEn ? item.productNameEn : item.productName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "pt" ? "Quantidade" : lang === "en" ? "Quantity" : lang === "es" ? "Cantidad" : lang === "fr" ? "Quantité" : "Menge"}: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "pt" ? "Preço unitário" :
                         lang === "en" ? "Unit price" :
                         lang === "es" ? "Precio unitario" :
                         lang === "fr" ? "Prix unitaire" :
                         "Stückpreis"}: €{(item.unitPrice / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" data-testid={`text-item-total-${item.productId}`}>
                        €{(item.totalPrice / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex gap-4 justify-center">
        <Button asChild variant="outline" data-testid="button-continue-shopping">
          <Link href="/loja">
            {lang === "pt" ? "Continuar a Comprar" :
             lang === "en" ? "Continue Shopping" :
             lang === "es" ? "Seguir Comprando" :
             lang === "fr" ? "Continuer les Achats" :
             "Weiter Einkaufen"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
