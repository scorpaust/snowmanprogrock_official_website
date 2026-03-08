import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, Eye, Truck, CheckCircle, XCircle, Clock, CreditCard, MapPin, User, Mail, Phone, StickyNote, Download } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Order = {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  billingAddress: string | null;
  totalAmount: number;
  status: string;
  paymentMethod: string | null;
  paymentIntentId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  createdAt: string;
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Clock }> = {
  pending: { label: "Pendente", variant: "secondary", icon: Clock },
  paid: { label: "Pago", variant: "default", icon: CreditCard },
  processing: { label: "Em Processamento", variant: "default", icon: Package },
  shipped: { label: "Enviado", variant: "default", icon: Truck },
  completed: { label: "Concluído", variant: "outline", icon: CheckCircle },
  cancelled: { label: "Cancelado", variant: "destructive", icon: XCircle },
};

const paymentMethodLabels: Record<string, string> = {
  stripe: "Stripe (Cartão)",
  card: "Cartão",
  multibanco: "Multibanco",
  mbway: "MB WAY",
  paypal: "PayPal",
};

function parseAddress(addressJson: string | null): Record<string, string> | null {
  if (!addressJson) return null;
  try {
    return JSON.parse(addressJson);
  } catch {
    return null;
  }
}

function formatAddress(addr: Record<string, string> | null): string {
  if (!addr) return "N/A";
  const parts = [
    addr.street || addr.address || addr.line1,
    addr.city,
    addr.postalCode || addr.postal_code || addr.zip,
    addr.state || addr.region,
    addr.country,
  ].filter(Boolean);
  return parts.join(", ") || "N/A";
}

export default function OrdersManagement() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [notesText, setNotesText] = useState("");
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: orderItems = [], isLoading: itemsLoading } = useQuery<OrderItem[]>({
    queryKey: ["/api/admin/orders", selectedOrder?.id, "items"],
    enabled: !!selectedOrder,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Estado atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar estado", variant: "destructive" });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/notes`, { notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Notas guardadas com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao guardar notas", variant: "destructive" });
    },
  });

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    paid: orders.filter(o => o.status === "paid").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  const hasPhysicalItems = (items: OrderItem[]) => {
    return items.length > 0;
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setNotesText(order.notes || "");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-orders-title">Encomendas</h1>
            <p className="text-muted-foreground">Gestão de encomendas da loja</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" data-testid="badge-total-orders">{orders.length} total</Badge>
            {orderCounts.pending > 0 && (
              <Badge variant="destructive" data-testid="badge-pending-orders">{orderCounts.pending} pendente{orderCounts.pending !== 1 ? 's' : ''}</Badge>
            )}
            {orderCounts.paid > 0 && (
              <Badge data-testid="badge-paid-orders">{orderCounts.paid} pago{orderCounts.paid !== 1 ? 's' : ''}</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Card key={key} className="cursor-pointer hover-elevate" onClick={() => setActiveTab(key)} data-testid={`card-status-${key}`}>
                <CardContent className="p-3 text-center">
                  <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-lg font-bold">{orderCounts[key as keyof typeof orderCounts]}</div>
                  <div className="text-xs text-muted-foreground">{config.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap" data-testid="tabs-order-status">
            <TabsTrigger value="all" data-testid="tab-all">Todas ({orderCounts.all})</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">Pendentes ({orderCounts.pending})</TabsTrigger>
            <TabsTrigger value="paid" data-testid="tab-paid">Pagas ({orderCounts.paid})</TabsTrigger>
            <TabsTrigger value="processing" data-testid="tab-processing">Processamento ({orderCounts.processing})</TabsTrigger>
            <TabsTrigger value="shipped" data-testid="tab-shipped">Enviadas ({orderCounts.shipped})</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">Concluídas ({orderCounts.completed})</TabsTrigger>
            <TabsTrigger value="cancelled" data-testid="tab-cancelled">Canceladas ({orderCounts.cancelled})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="text-muted-foreground">A carregar encomendas...</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground" data-testid="text-no-orders">Nenhuma encomenda encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Encomenda</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(order => {
                      const sc = statusConfig[order.status] || statusConfig.pending;
                      return (
                        <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                          <TableCell>
                            <span className="font-mono text-sm font-medium" data-testid={`text-order-number-${order.id}`}>
                              {order.orderNumber}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{order.customerName}</span>
                              <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold" data-testid={`text-order-total-${order.id}`}>
                              €{(order.totalAmount / 100).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sc.variant} data-testid={`badge-status-${order.id}`}>
                              {sc.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {paymentMethodLabels[order.paymentMethod || ''] || order.paymentMethod || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openOrderDetails(order)}
                              data-testid={`button-view-order-${order.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-order-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Package className="h-5 w-5" />
              Encomenda {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Criada em {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString('pt-PT')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Alterar Estado</label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(status) => {
                      updateStatusMutation.mutate({ id: selectedOrder.id, status });
                      setSelectedOrder({ ...selectedOrder, status });
                    }}
                    data-testid="select-order-status"
                  >
                    <SelectTrigger data-testid="trigger-order-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="processing">Em Processamento</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Total</label>
                  <span className="text-2xl font-bold text-primary">€{(selectedOrder.totalAmount / 100).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Dados do Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span data-testid="text-customer-name">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <a href={`mailto:${selectedOrder.customerEmail}`} className="text-primary hover:underline" data-testid="text-customer-email">
                        {selectedOrder.customerEmail}
                      </a>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <a href={`tel:${selectedOrder.customerPhone}`} className="text-primary hover:underline" data-testid="text-customer-phone">
                          {selectedOrder.customerPhone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{paymentMethodLabels[selectedOrder.paymentMethod || ''] || selectedOrder.paymentMethod || 'N/A'}</span>
                    </div>
                    {selectedOrder.paymentIntentId && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Stripe: {selectedOrder.paymentIntentId}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Morada de Envio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    {(() => {
                      const shipping = parseAddress(selectedOrder.shippingAddress);
                      if (!shipping) {
                        return <p className="text-muted-foreground" data-testid="text-no-shipping">Sem morada de envio (produto digital)</p>;
                      }
                      return (
                        <div className="space-y-1" data-testid="text-shipping-address">
                          {shipping.name && <p className="font-medium">{shipping.name}</p>}
                          {(shipping.street || shipping.address || shipping.line1) && (
                            <p>{shipping.street || shipping.address || shipping.line1}</p>
                          )}
                          {shipping.line2 && <p>{shipping.line2}</p>}
                          <p>
                            {[shipping.postalCode || shipping.postal_code || shipping.zip, shipping.city].filter(Boolean).join(" ")}
                          </p>
                          {(shipping.state || shipping.region) && <p>{shipping.state || shipping.region}</p>}
                          {shipping.country && <p className="font-medium">{shipping.country}</p>}
                        </div>
                      );
                    })()}

                    {selectedOrder.billingAddress && selectedOrder.billingAddress !== selectedOrder.shippingAddress && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Morada de Faturação</p>
                        <p className="text-sm" data-testid="text-billing-address">{formatAddress(parseAddress(selectedOrder.billingAddress))}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Itens da Encomenda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {itemsLoading ? (
                    <p className="text-sm text-muted-foreground">A carregar itens...</p>
                  ) : orderItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum item encontrado</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-center">Qtd.</TableHead>
                          <TableHead className="text-right">Preço Unit.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map(item => (
                          <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                            <TableCell>
                              <span className="font-medium" data-testid={`text-item-name-${item.id}`}>{item.productName}</span>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">€{(item.price / 100).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">€{((item.price * item.quantity) / 100).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-bold">Total:</TableCell>
                          <TableCell className="text-right font-bold text-primary">€{(selectedOrder.totalAmount / 100).toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Notas Internas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Adicionar notas sobre esta encomenda (ex: tracking number, observações de envio...)"
                    className="resize-none"
                    rows={3}
                    data-testid="textarea-notes"
                  />
                  <Button
                    size="sm"
                    onClick={() => updateNotesMutation.mutate({ id: selectedOrder.id, notes: notesText })}
                    disabled={updateNotesMutation.isPending}
                    data-testid="button-save-notes"
                  >
                    {updateNotesMutation.isPending ? "A guardar..." : "Guardar Notas"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
