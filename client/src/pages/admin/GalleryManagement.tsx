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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Image as ImageIcon, Plus, Pencil, Trash2, Video, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Gallery } from "@shared/schema";
import { insertGallerySchema } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

type GalleryForm = z.infer<typeof insertGallerySchema>;

export default function GalleryManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Gallery | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: galleryList, isLoading } = useQuery<Gallery[]>({
    queryKey: ["/api/gallery"],
  });

  const form = useForm<GalleryForm>({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      type: "photo",
      url: "",
      thumbnail: "",
      caption: "",
      captionEn: "",
      captionFr: "",
      captionEs: "",
      captionDe: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GalleryForm) => {
      const payload = {
        ...data,
        caption: data.caption || undefined,
        captionEn: data.captionEn || undefined,
        captionFr: data.captionFr || undefined,
        captionEs: data.captionEs || undefined,
        captionDe: data.captionDe || undefined,
        thumbnail: data.thumbnail || undefined,
      };
      const response = await apiRequest("POST", "/api/gallery", payload);
      if (!response.ok) throw new Error("Failed to create gallery item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Item criado",
        description: "O item da galeria foi criado com sucesso.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar item da galeria.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GalleryForm> }) => {
      const payload = {
        ...data,
        caption: data.caption || undefined,
        captionEn: data.captionEn || undefined,
        captionFr: data.captionFr || undefined,
        captionEs: data.captionEs || undefined,
        captionDe: data.captionDe || undefined,
        thumbnail: data.thumbnail || undefined,
      };
      const response = await apiRequest("PATCH", `/api/gallery/${id}`, payload);
      if (!response.ok) throw new Error("Failed to update gallery item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Item atualizado",
        description: "O item da galeria foi atualizado com sucesso.",
      });
      setIsDialogOpen(false);
      setSelectedItem(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar item da galeria.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/gallery/${id}`, undefined);
      if (!response.ok) throw new Error("Failed to delete gallery item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Item eliminado",
        description: "O item da galeria foi eliminado com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao eliminar item da galeria.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setSelectedItem(null);
    form.reset({
      type: "photo",
      url: "",
      thumbnail: "",
      caption: "",
      captionEn: "",
      captionFr: "",
      captionEs: "",
      captionDe: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Gallery) => {
    setSelectedItem(item);
    form.reset({
      type: item.type as "photo" | "video",
      url: item.url,
      thumbnail: item.thumbnail || "",
      caption: item.caption || "",
      captionEn: item.captionEn || "",
      captionFr: item.captionFr || "",
      captionEs: item.captionEs || "",
      captionDe: item.captionDe || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: GalleryForm) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleGetUploadURL = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleMainUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      if (uploadURL) {
        try {
          const response = await apiRequest("POST", "/api/objects/normalize-path", { uploadURL });
          if (!response.ok) {
            throw new Error("Failed to normalize path");
          }
          const data = await response.json();
          form.setValue("url", data.objectPath);
          toast({
            title: "Upload concluído",
            description: "Ficheiro carregado com sucesso.",
          });
        } catch (error) {
          console.error("Error normalizing path:", error);
          toast({
            title: "Erro",
            description: "Falha ao processar upload.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleThumbnailUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      if (uploadURL) {
        try {
          const response = await apiRequest("POST", "/api/objects/normalize-path", { uploadURL });
          if (!response.ok) {
            throw new Error("Failed to normalize path");
          }
          const data = await response.json();
          form.setValue("thumbnail", data.objectPath);
          toast({
            title: "Upload concluído",
            description: "Thumbnail carregado com sucesso.",
          });
        } catch (error) {
          console.error("Error normalizing path:", error);
          toast({
            title: "Erro",
            description: "Falha ao processar upload.",
            variant: "destructive",
          });
        }
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">A carregar galeria...</p>
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
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Galeria</h1>
              <p className="text-muted-foreground">
                Gerir fotos e vídeos da banda
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} data-testid="button-create-gallery">
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos os Itens</CardTitle>
            <CardDescription>
              {galleryList?.length || 0} itens na galeria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Legenda (PT)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {galleryList && galleryList.length > 0 ? (
                  galleryList.map((item) => (
                    <TableRow key={item.id} data-testid={`row-gallery-${item.id}`}>
                      <TableCell>
                        <Badge variant={item.type === "photo" ? "default" : "secondary"}>
                          {item.type === "photo" ? (
                            <><ImageIcon className="h-3 w-3 mr-1" /> Foto</>
                          ) : (
                            <><Video className="h-3 w-3 mr-1" /> Vídeo</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.url}</TableCell>
                      <TableCell>{item.caption || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            data-testid={`button-edit-${item.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? "Editar Item" : "Novo Item"}
              </DialogTitle>
              <DialogDescription>
                Adicione fotos ou vídeos à galeria da banda
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="photo">Foto</SelectItem>
                          <SelectItem value="video">Vídeo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://... ou faça upload"
                            data-testid="input-url"
                          />
                        </FormControl>
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={52428800}
                          onGetUploadParameters={handleGetUploadURL}
                          onComplete={handleMainUploadComplete}
                          variant="outline"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Carregar
                        </ObjectUploader>
                      </div>
                      <FormDescription>
                        Cole um URL (YouTube, Vimeo, etc.) ou faça upload do ficheiro do PC
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "video" && (
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail (URL)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="https://... ou faça upload"
                              data-testid="input-thumbnail"
                            />
                          </FormControl>
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={handleGetUploadURL}
                            onComplete={handleThumbnailUploadComplete}
                            variant="outline"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Carregar
                          </ObjectUploader>
                        </div>
                        <FormDescription>
                          Cole um URL ou faça upload da imagem de pré-visualização
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Tabs defaultValue="pt" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="pt" data-testid="tab-pt">PT</TabsTrigger>
                    <TabsTrigger value="en" data-testid="tab-en">EN</TabsTrigger>
                    <TabsTrigger value="fr" data-testid="tab-fr">FR</TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-es">ES</TabsTrigger>
                    <TabsTrigger value="de" data-testid="tab-de">DE</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pt" className="mt-4">
                    <FormField
                      control={form.control}
                      name="caption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legenda (PT)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} placeholder="Descrição em português" rows={2} data-testid="input-caption" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="en" className="mt-4">
                    <FormField
                      control={form.control}
                      name="captionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legenda (EN)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} placeholder="Description in English" rows={2} data-testid="input-caption-en" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="fr" className="mt-4">
                    <FormField
                      control={form.control}
                      name="captionFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legenda (FR)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} placeholder="Description en français" rows={2} data-testid="input-caption-fr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="es" className="mt-4">
                    <FormField
                      control={form.control}
                      name="captionEs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legenda (ES)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} placeholder="Descripción en español" rows={2} data-testid="input-caption-es" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="de" className="mt-4">
                    <FormField
                      control={form.control}
                      name="captionDe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legenda (DE)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} placeholder="Beschreibung auf Deutsch" rows={2} data-testid="input-caption-de" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

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
                      : selectedItem
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
                Esta ação não pode ser revertida. O item será permanentemente
                eliminado da galeria.
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
