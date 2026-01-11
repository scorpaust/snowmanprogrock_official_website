import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Package, Image as ImageIcon, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ObjectUploader } from "@/components/ObjectUploader";

const productFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  nameEn: z.string().optional(),
  nameFr: z.string().optional(),
  nameEs: z.string().optional(),
  nameDe: z.string().optional(),
  description: z.string().min(1, "Descrição é obrigatória"),
  descriptionEn: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEs: z.string().optional(),
  descriptionDe: z.string().optional(),
  price: z.number().int().positive("Preço deve ser positivo"),
  type: z.enum(['physical', 'digital']),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  images: z.array(z.string()).default([]),
  stock: z.number().int().min(0, "Stock não pode ser negativo").default(0),
  downloadUrl: z.string().optional(),
  isActive: z.number().int().min(0).max(1).default(1),
  featured: z.number().int().min(0).max(1).default(0),
});

type ProductForm = z.infer<typeof productFormSchema>;

type Product = {
  id: string;
  name: string;
  nameEn: string | null;
  nameFr: string | null;
  nameEs: string | null;
  nameDe: string | null;
  description: string;
  descriptionEn: string | null;
  descriptionFr: string | null;
  descriptionEs: string | null;
  descriptionDe: string | null;
  price: number;
  type: string;
  categoryId: string;
  images: string[];
  stock: number;
  downloadUrl: string | null;
  isActive: number;
  featured: number;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
};

export default function ProductsManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageInput, setImageInput] = useState("");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      nameFr: "",
      nameEs: "",
      nameDe: "",
      description: "",
      descriptionEn: "",
      descriptionFr: "",
      descriptionEs: "",
      descriptionDe: "",
      price: 0,
      type: 'physical',
      categoryId: "",
      images: [],
      stock: 0,
      downloadUrl: "",
      isActive: 1,
      featured: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const payload = {
        ...data,
        nameEn: data.nameEn || null,
        nameFr: data.nameFr || null,
        nameEs: data.nameEs || null,
        nameDe: data.nameDe || null,
        descriptionEn: data.descriptionEn || null,
        descriptionFr: data.descriptionFr || null,
        descriptionEs: data.descriptionEs || null,
        descriptionDe: data.descriptionDe || null,
        downloadUrl: data.downloadUrl || null,
      };
      const response = await apiRequest("POST", "/api/products", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Produto criado com sucesso" });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao criar produto", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductForm> }) => {
      const payload = {
        ...data,
        nameEn: data.nameEn || null,
        nameFr: data.nameFr || null,
        nameEs: data.nameEs || null,
        nameDe: data.nameDe || null,
        descriptionEn: data.descriptionEn || null,
        descriptionFr: data.descriptionFr || null,
        descriptionEs: data.descriptionEs || null,
        descriptionDe: data.descriptionDe || null,
        downloadUrl: data.downloadUrl || null,
      };
      const response = await apiRequest("PATCH", `/api/products/${id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Produto atualizado com sucesso" });
      setEditingProduct(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar produto", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Produto eliminado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao eliminar produto", variant: "destructive" });
    },
  });

  const onSubmit = (data: ProductForm) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      nameEn: product.nameEn || "",
      nameFr: product.nameFr || "",
      nameEs: product.nameEs || "",
      nameDe: product.nameDe || "",
      description: product.description,
      descriptionEn: product.descriptionEn || "",
      descriptionFr: product.descriptionFr || "",
      descriptionEs: product.descriptionEs || "",
      descriptionDe: product.descriptionDe || "",
      price: product.price,
      type: product.type as 'physical' | 'digital',
      categoryId: product.categoryId,
      images: product.images,
      stock: product.stock,
      downloadUrl: product.downloadUrl || "",
      isActive: product.isActive,
      featured: product.featured,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem a certeza que pretende eliminar este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      const currentImages = form.getValues("images");
      form.setValue("images", [...currentImages, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    form.setValue("images", currentImages.filter((_, i) => i !== index));
  };

  const handleGetUploadURL = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }
    const data = await response.json();
    return { method: "PUT" as const, url: data.uploadURL };
  };

  const handleImageUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      for (const upload of result.successful) {
        const uploadURL = upload.uploadURL;
        if (uploadURL) {
          const normalizeResponse = await apiRequest("POST", "/api/objects/normalize-path", {
            uploadURL,
          });
          const { path } = await normalizeResponse.json();
          const currentImages = form.getValues("images");
          form.setValue("images", [...currentImages, path]);
        }
      }
      toast({
        title: "Upload completo",
        description: `${result.successful.length} imagem(ns) carregada(s)`,
      });
    }
  };

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Desconhecida";
  };

  if (productsLoading || categoriesLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">A carregar produtos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Produtos</h1>
            <p className="text-muted-foreground">Gerir produtos e inventário da loja</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-product">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Produto</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <Tabs defaultValue="pt" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="pt" data-testid="tab-create-pt">PT *</TabsTrigger>
                      <TabsTrigger value="en" data-testid="tab-create-en">EN</TabsTrigger>
                      <TabsTrigger value="fr" data-testid="tab-create-fr">FR</TabsTrigger>
                      <TabsTrigger value="es" data-testid="tab-create-es">ES</TabsTrigger>
                      <TabsTrigger value="de" data-testid="tab-create-de">DE</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pt" className="space-y-4 mt-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome (PT)*</FormLabel>
                          <FormControl><Input {...field} data-testid="input-product-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição (PT)*</FormLabel>
                          <FormControl><Textarea {...field} rows={3} data-testid="textarea-description" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </TabsContent>

                    <TabsContent value="en" className="space-y-4 mt-4">
                      <FormField control={form.control} name="nameEn" render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Name (EN)</FormLabel>
                          <FormControl><Input {...rest} value={value ?? ""} onChange={onChange} data-testid="input-product-name-en" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="descriptionEn" render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Description (EN)</FormLabel>
                          <FormControl><Textarea {...rest} value={value ?? ""} onChange={onChange} rows={3} data-testid="textarea-description-en" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </TabsContent>

                    <TabsContent value="fr" className="space-y-4 mt-4">
                      <FormField control={form.control} name="nameFr" render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Nom (FR)</FormLabel>
                          <FormControl><Input {...rest} value={value ?? ""} onChange={onChange} data-testid="input-product-name-fr" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="descriptionFr" render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Description (FR)</FormLabel>
                          <FormControl><Textarea {...rest} value={value ?? ""} onChange={onChange} rows={3} data-testid="textarea-description-fr" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </TabsContent>

                    <TabsContent value="es" className="space-y-4 mt-4">
                      <FormField control={form.control} name="nameEs" render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Nombre (ES)</FormLabel>
                          <FormControl><Input {...rest} value={value ?? ""} onChange={onChange} data-testid="input-product-name-es" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="descriptionEs" render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Descripción (ES)</FormLabel>
                          <FormControl><Textarea {...rest} value={value ?? ""} onChange={onChange} rows={3} data-testid="textarea-description-es" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </TabsContent>

                    <TabsContent value="de" className="space-y-4 mt-4">
                      <FormField control={form.control} name="nameDe" render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Name (DE)</FormLabel>
                          <FormControl><Input {...rest} value={value ?? ""} onChange={onChange} data-testid="input-product-name-de" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="descriptionDe" render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Beschreibung (DE)</FormLabel>
                          <FormControl><Textarea {...rest} value={value ?? ""} onChange={onChange} rows={3} data-testid="textarea-description-de" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </TabsContent>
                  </Tabs>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (cêntimos)*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo*</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-type">
                                <SelectValue placeholder="Selecionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="physical">Físico</SelectItem>
                              <SelectItem value="digital">Digital</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-stock"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Selecionar categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="downloadUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de Download (produtos digitais)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-download-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Imagens do Produto</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="URL da imagem"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        data-testid="input-image-url"
                      />
                      <Button type="button" onClick={addImage} data-testid="button-add-image">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <ObjectUploader
                        onGetUploadParameters={handleGetUploadURL}
                        onComplete={handleImageUploadComplete}
                        maxNumberOfFiles={5}
                        accept={["image/jpeg", "image/png", "image/webp", "image/gif"]}
                        data-testid="button-upload-product-image"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Carregar
                      </ObjectUploader>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("images").map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="h-20 w-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => removeImage(index)}
                            data-testid={`button-remove-image-${index}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormLabel>Ativo</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value === 1}
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                              data-testid="switch-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormLabel>Destaque</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value === 1}
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                              data-testid="switch-featured"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                      {createMutation.isPending ? "A criar..." : "Criar Produto"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} data-testid={`card-product-${product.id}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="flex gap-1">
                        {product.featured === 1 && (
                          <Badge variant="default" className="text-xs">Destaque</Badge>
                        )}
                        {product.isActive === 0 && (
                          <Badge variant="secondary" className="text-xs">Inativo</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getCategoryName(product.categoryId)}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>{product.type === 'physical' ? `Stock: ${product.stock}` : 'Digital'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(product)}
                          data-testid={`button-edit-${product.id}`}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Produto</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <Tabs defaultValue="pt" className="w-full">
                              <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="pt" data-testid="tab-edit-pt">PT *</TabsTrigger>
                                <TabsTrigger value="en" data-testid="tab-edit-en">EN</TabsTrigger>
                                <TabsTrigger value="fr" data-testid="tab-edit-fr">FR</TabsTrigger>
                                <TabsTrigger value="es" data-testid="tab-edit-es">ES</TabsTrigger>
                                <TabsTrigger value="de" data-testid="tab-edit-de">DE</TabsTrigger>
                              </TabsList>

                              <TabsContent value="pt" className="space-y-4 mt-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome (PT)*</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Descrição (PT)*</FormLabel>
                                    <FormControl><Textarea {...field} rows={3} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </TabsContent>

                              <TabsContent value="en" className="space-y-4 mt-4">
                                <FormField control={form.control} name="nameEn" render={({ field: { value, onChange, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Name (EN)</FormLabel>
                                    <FormControl><Input {...rest} value={value ?? ""} onChange={onChange} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="descriptionEn" render={({ field: { value, onChange, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Description (EN)</FormLabel>
                                    <FormControl><Textarea {...rest} value={value ?? ""} onChange={onChange} rows={3} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </TabsContent>

                              <TabsContent value="fr" className="space-y-4 mt-4">
                                <FormField control={form.control} name="nameFr" render={({ field: { value, onChange, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Nom (FR)</FormLabel>
                                    <FormControl><Input {...rest} value={value ?? ""} onChange={onChange} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="descriptionFr" render={({ field: { value, onChange, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Description (FR)</FormLabel>
                                    <FormControl><Textarea {...rest} value={value ?? ""} onChange={onChange} rows={3} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </TabsContent>

                              <TabsContent value="es" className="space-y-4 mt-4">
                                <FormField control={form.control} name="nameEs" render={({ field: { value, onChange, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Nombre (ES)</FormLabel>
                                    <FormControl><Input {...rest} value={value ?? ""} onChange={onChange} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="descriptionEs" render={({ field: { value, onChange, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Descripción (ES)</FormLabel>
                                    <FormControl><Textarea {...rest} value={value ?? ""} onChange={onChange} rows={3} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </TabsContent>

                              <TabsContent value="de" className="space-y-4 mt-4">
                                <FormField control={form.control} name="nameDe" render={({ field: { value, onChange, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Name (DE)</FormLabel>
                                    <FormControl><Input {...rest} value={value ?? ""} onChange={onChange} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="descriptionDe" render={({ field: { value, onChange, ...rest } }) => (
                                  <FormItem>
                                    <FormLabel>Beschreibung (DE)</FormLabel>
                                    <FormControl><Textarea {...rest} value={value ?? ""} onChange={onChange} rows={3} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </TabsContent>
                            </Tabs>

                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Preço (cêntimos)*</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo*</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecionar tipo" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="physical">Físico</SelectItem>
                                        <SelectItem value="digital">Digital</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Categoria*</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecionar categoria" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                          {cat.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="downloadUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL de Download (produtos digitais)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <FormLabel>Imagens do Produto</FormLabel>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="URL da imagem"
                                  value={imageInput}
                                  onChange={(e) => setImageInput(e.target.value)}
                                />
                                <Button type="button" onClick={addImage}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <ObjectUploader
                                  onGetUploadParameters={handleGetUploadURL}
                                  onComplete={handleImageUploadComplete}
                                  maxNumberOfFiles={5}
                                  accept={["image/jpeg", "image/png", "image/webp", "image/gif"]}
                                  data-testid="button-edit-upload-product-image"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Carregar
                                </ObjectUploader>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {form.watch("images").map((url, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={url}
                                      alt={`Product ${index + 1}`}
                                      className="h-20 w-20 object-cover rounded border"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                                      onClick={() => removeImage(index)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-4">
                              <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-2">
                                    <FormLabel>Ativo</FormLabel>
                                    <FormControl>
                                      <Switch
                                        checked={field.value === 1}
                                        onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="featured"
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-2">
                                    <FormLabel>Destaque</FormLabel>
                                    <FormControl>
                                      <Switch
                                        checked={field.value === 1}
                                        onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <DialogFooter>
                              <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "A atualizar..." : "Atualizar Produto"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${product.id}`}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Apagar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Ainda não existem produtos. Crie o primeiro produto para começar.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
