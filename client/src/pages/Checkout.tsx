import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/hooks/use-cart";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, CreditCard, Loader2, Trash2, LogIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface CheckoutFormProps {
  orderId: string;
  onSuccess: () => void;
}

function CheckoutForm({ orderId, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/loja/pedido/${orderId}`,
        },
      });

      if (error) {
        toast({
          title: "Pagamento Falhado",
          description: error.message || "Ocorreu um erro ao processar o pagamento",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pagamento Bem-Sucedido",
          description: "Obrigado pela sua compra!",
        });
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Métodos de pagamento disponíveis: Cartão de Crédito/Débito, Multibanco, MB WAY
        </p>
        <div className="bg-muted/50 p-6 rounded-md">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            A processar...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Concluir Pagamento
          </>
        )}
      </Button>
    </form>
  );
}

type UserProfile = {
  id: string;
  email: string;
  name: string;
};

export default function Checkout({ language = 'pt' }: { language?: string }) {
  const [, navigate] = useLocation();
  const { cart, items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const hasCreatedOrder = useRef(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Portugal",
  });

  const { data: currentUser, isLoading: isLoadingUser } = useQuery<UserProfile>({
    queryKey: ['/api/customer/me'],
    retry: false,
  });

  const translations = {
    pt: {
      title: "Finalizar Compra",
      cart: "Carrinho",
      empty: "O seu carrinho está vazio",
      goToShop: "Ir para a Loja",
      customerInfo: "Informações do Cliente",
      name: "Nome Completo",
      email: "Email",
      phone: "Telefone",
      address: "Morada",
      city: "Cidade",
      postalCode: "Código Postal",
      country: "País",
      paymentInfo: "Informações de Pagamento",
      subtotal: "Subtotal",
      total: "Total",
      processing: "A processar...",
      clearCart: "Limpar Carrinho",
      loginRequired: "Inicie sessão para finalizar a compra",
      login: "Iniciar Sessão",
      register: "ou crie uma conta",
      quantity: "Quantidade",
      continueToPayment: "Continuar para Pagamento",
      creatingOrder: "A criar pedido...",
      orderCreated: "Pedido criado",
      selectPaymentMethod: "Por favor, selecione o seu método de pagamento.",
      errorFillFields: "Por favor, preencha o nome e email.",
      error: "Erro",
      errorCreateOrder: "Não foi possível criar o pedido. Por favor, tente novamente.",
      paymentMethods: "Métodos de pagamento disponíveis: Cartão de Crédito/Débito, Multibanco, MB WAY",
      completePayment: "Concluir Pagamento",
      processingPayment: "A processar...",
      paymentFailed: "Pagamento Falhado",
      paymentError: "Ocorreu um erro ao processar o pagamento",
      paymentSuccess: "Pagamento Bem-Sucedido",
      thankYou: "Obrigado pela sua compra!",
    },
    en: {
      title: "Checkout",
      cart: "Cart",
      empty: "Your cart is empty",
      goToShop: "Go to Shop",
      customerInfo: "Customer Information",
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      city: "City",
      postalCode: "Postal Code",
      country: "Country",
      paymentInfo: "Payment Information",
      subtotal: "Subtotal",
      total: "Total",
      processing: "Processing...",
      clearCart: "Clear Cart",
      loginRequired: "Login to complete your purchase",
      login: "Login",
      register: "or create an account",
      quantity: "Quantity",
      continueToPayment: "Continue to Payment",
      creatingOrder: "Creating order...",
      orderCreated: "Order created",
      selectPaymentMethod: "Please select your preferred payment method.",
      errorFillFields: "Please fill in name and email.",
      error: "Error",
      errorCreateOrder: "Could not create order. Please try again.",
      paymentMethods: "Available payment methods: Credit/Debit Card, Multibanco, MB WAY",
      completePayment: "Complete Payment",
      processingPayment: "Processing...",
      paymentFailed: "Payment Failed",
      paymentError: "An error occurred while processing the payment",
      paymentSuccess: "Payment Successful",
      thankYou: "Thank you for your purchase!",
    },
    fr: {
      title: "Finaliser l'achat",
      cart: "Panier",
      empty: "Votre panier est vide",
      goToShop: "Aller à la boutique",
      customerInfo: "Informations client",
      name: "Nom complet",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse",
      city: "Ville",
      postalCode: "Code postal",
      country: "Pays",
      paymentInfo: "Informations de paiement",
      subtotal: "Sous-total",
      total: "Total",
      processing: "Traitement...",
      clearCart: "Vider le panier",
      loginRequired: "Connectez-vous pour finaliser votre achat",
      login: "Se connecter",
      register: "ou créez un compte",
      quantity: "Quantité",
      continueToPayment: "Continuer vers le paiement",
      creatingOrder: "Création de la commande...",
      orderCreated: "Commande créée",
      selectPaymentMethod: "Veuillez sélectionner votre mode de paiement.",
      errorFillFields: "Veuillez remplir le nom et l'email.",
      error: "Erreur",
      errorCreateOrder: "Impossible de créer la commande. Veuillez réessayer.",
      paymentMethods: "Modes de paiement disponibles: Carte de crédit/débit, Multibanco, MB WAY",
      completePayment: "Finaliser le paiement",
      processingPayment: "Traitement...",
      paymentFailed: "Paiement échoué",
      paymentError: "Une erreur s'est produite lors du traitement du paiement",
      paymentSuccess: "Paiement réussi",
      thankYou: "Merci pour votre achat!",
    },
    es: {
      title: "Finalizar Compra",
      cart: "Carrito",
      empty: "Tu carrito está vacío",
      goToShop: "Ir a la Tienda",
      customerInfo: "Información del Cliente",
      name: "Nombre Completo",
      email: "Email",
      phone: "Teléfono",
      address: "Dirección",
      city: "Ciudad",
      postalCode: "Código Postal",
      country: "País",
      paymentInfo: "Información de Pago",
      subtotal: "Subtotal",
      total: "Total",
      processing: "Procesando...",
      clearCart: "Vaciar Carrito",
      loginRequired: "Inicia sesión para completar tu compra",
      login: "Iniciar Sesión",
      register: "o crea una cuenta",
      quantity: "Cantidad",
      continueToPayment: "Continuar al Pago",
      creatingOrder: "Creando pedido...",
      orderCreated: "Pedido creado",
      selectPaymentMethod: "Por favor, selecciona tu método de pago.",
      errorFillFields: "Por favor, rellena el nombre y email.",
      error: "Error",
      errorCreateOrder: "No se pudo crear el pedido. Por favor, inténtalo de nuevo.",
      paymentMethods: "Métodos de pago disponibles: Tarjeta de Crédito/Débito, Multibanco, MB WAY",
      completePayment: "Completar Pago",
      processingPayment: "Procesando...",
      paymentFailed: "Pago Fallido",
      paymentError: "Ocurrió un error al procesar el pago",
      paymentSuccess: "Pago Exitoso",
      thankYou: "¡Gracias por tu compra!",
    },
    de: {
      title: "Kasse",
      cart: "Warenkorb",
      empty: "Ihr Warenkorb ist leer",
      goToShop: "Zum Shop",
      customerInfo: "Kundeninformationen",
      name: "Vollständiger Name",
      email: "E-Mail",
      phone: "Telefon",
      address: "Adresse",
      city: "Stadt",
      postalCode: "Postleitzahl",
      country: "Land",
      paymentInfo: "Zahlungsinformationen",
      subtotal: "Zwischensumme",
      total: "Gesamt",
      processing: "Verarbeitung...",
      clearCart: "Warenkorb leeren",
      loginRequired: "Melden Sie sich an, um Ihren Einkauf abzuschließen",
      login: "Anmelden",
      register: "oder erstellen Sie ein Konto",
      quantity: "Menge",
      continueToPayment: "Weiter zur Zahlung",
      creatingOrder: "Bestellung wird erstellt...",
      orderCreated: "Bestellung erstellt",
      selectPaymentMethod: "Bitte wählen Sie Ihre bevorzugte Zahlungsmethode.",
      errorFillFields: "Bitte füllen Sie Name und E-Mail aus.",
      error: "Fehler",
      errorCreateOrder: "Bestellung konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
      paymentMethods: "Verfügbare Zahlungsmethoden: Kredit-/Debitkarte, Multibanco, MB WAY",
      completePayment: "Zahlung abschließen",
      processingPayment: "Verarbeitung...",
      paymentFailed: "Zahlung fehlgeschlagen",
      paymentError: "Bei der Zahlungsverarbeitung ist ein Fehler aufgetreten",
      paymentSuccess: "Zahlung erfolgreich",
      thankYou: "Vielen Dank für Ihren Einkauf!",
    },
  };

  const t = translations[language as keyof typeof translations] || translations.pt;

  const handleCreateOrder = async () => {
    if (hasCreatedOrder.current || isCreatingOrder) {
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome e email.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingOrder(true);
    hasCreatedOrder.current = true;

    try {
      const orderData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone || "",
        shippingAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.postalCode}, ${customerInfo.country}`,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      console.log("Creating order with payment intent...");
      const response = await apiRequest("POST", "/api/orders/create-with-payment", orderData);
      const orderResponse: any = await response.json();
      console.log("Order response received:", {
        orderId: orderResponse.orderId,
        hasClientSecret: !!orderResponse.clientSecret
      });
      
      if (!orderResponse.clientSecret) {
        throw new Error("No client secret received from server. Please check Stripe configuration.");
      }
      
      setOrderId(orderResponse.orderId);
      setClientSecret(orderResponse.clientSecret);
      
      toast({
        title: "Pedido criado",
        description: "Por favor, selecione o seu método de pagamento preferido abaixo.",
      });
    } catch (error: any) {
      console.error("Error creating order:", error);
      hasCreatedOrder.current = false;
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o pedido. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    navigate(`/loja/pedido/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 pt-24">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t.cart}
            </CardTitle>
            <CardDescription>{t.empty}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/loja')} className="w-full" data-testid="button-go-to-shop">
              {t.goToShop}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoadingUser && !currentUser) {
    return (
      <div className="min-h-screen bg-background py-12 pt-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8" data-testid="text-checkout-title">{t.title}</h1>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                {t.loginRequired}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">{t.register}</p>
              <Link href="/auth">
                <Button className="w-full" data-testid="button-login-to-checkout">
                  <LogIn className="h-4 w-4 mr-2" />
                  {t.login}
                </Button>
              </Link>
              <Button variant="outline" onClick={() => navigate('/loja')} className="w-full" data-testid="button-back-to-shop">
                {t.goToShop}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8" data-testid="text-checkout-title">{t.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.customerInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.name} *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    required
                    data-testid="input-customer-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    required
                    data-testid="input-customer-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    data-testid="input-customer-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t.address}</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    data-testid="input-customer-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">{t.city}</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                      data-testid="input-customer-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t.postalCode}</Label>
                    <Input
                      id="postalCode"
                      value={customerInfo.postalCode}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                      data-testid="input-customer-postal-code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {!clientSecret && (
              <Card>
                <CardHeader>
                  <CardTitle>Continuar para Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleCreateOrder}
                    disabled={!customerInfo.name || !customerInfo.email || isCreatingOrder}
                    className="w-full"
                    size="lg"
                    data-testid="button-continue-to-payment"
                  >
                    {isCreatingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        A criar pedido...
                      </>
                    ) : (
                      "Continuar para Pagamento"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {clientSecret && stripePromise && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t.paymentInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm orderId={orderId} onSuccess={handlePaymentSuccess} />
                  </Elements>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    {t.cart}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive"
                    data-testid="button-clear-cart"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t.clearCart}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-start" data-testid={`cart-item-${item.product.id}`}>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      €{((item.product.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.subtotal}</span>
                    <span>€{(total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t.total}</span>
                    <span data-testid="text-total-amount">€{(total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
