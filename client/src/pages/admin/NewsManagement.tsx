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
import { Switch } from "@/components/ui/switch";
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
import { Newspaper, Plus, Pencil, Trash2, Star } from "lucide-react";
import type { News, InsertNews } from "@shared/schema";
import { insertNewsSchema } from "@shared/schema";
import { format } from "date-fns";

const newsFormSchema = insertNewsSchema.extend({
  images: z.array(z.string()).default([]),
});

type NewsForm = z.infer<typeof newsFormSchema>;

export default function NewsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: newsList, isLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const form = useForm<NewsForm>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      titleEn: "",
      content: "",
      contentEn: "",
      images: [],
      featured: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: NewsForm) => {
      const payload = {
        ...data,
        titleEn: data.titleEn || undefined,
        contentEn: data.contentEn || undefined,
      };
      const response = await apiRequest("POST", "/api/news", payload);
      if (!response.ok) throw new Error("Failed to create news");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "Notícia criada",
        description: "A notícia foi criada com sucesso.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar notícia.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewsForm> }) => {
      const payload = {
        ...data,
        titleEn: data.titleEn || undefined,
        contentEn: data.contentEn || undefined,
      };
      const response = await apiRequest("PATCH", `/api/news/${id}`, payload);
      if (!response.ok) throw new Error("Failed to update news");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "Notícia atualizada",
        description: "A notícia foi atualizada com sucesso.",
      });
      setIsDialogOpen(false);
      setSelectedNews(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar notícia.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/news/${id}`, undefined);
      if (!response.ok) throw new Error("Failed to delete news");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "Notícia eliminada",
        description: "A notícia foi eliminada com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao eliminar notícia.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setSelectedNews(null);
    form.reset({
      title: "",
      titleEn: "",
      content: "",
      contentEn: "",
      images: [],
      featured: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    form.reset({
      title: news.title,
      titleEn: news.titleEn || "",
      content: news.content,
      contentEn: news.contentEn || "",
      images: news.images || [],
      featured: news.featured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: NewsForm) => {
    if (selectedNews) {
      updateMutation.mutate({ id: selectedNews.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">A carregar notícias...</p>
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
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notícias</h1>
              <p className="text-muted-foreground">
                Gerir artigos e notícias da banda
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} data-testid="button-create-news">
            <Plus className="h-4 w-4 mr-2" />
            Nova Notícia
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas as Notícias</CardTitle>
            <CardDescription>
              {newsList?.length || 0} notícias publicadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título (PT)</TableHead>
                  <TableHead>Data Publicação</TableHead>
                  <TableHead className="text-center">Destaque</TableHead>
                  <TableHead className="text-center">Imagens</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsList && newsList.length > 0 ? (
                  newsList.map((news) => (
                    <TableRow key={news.id} data-testid={`row-news-${news.id}`}>
                      <TableCell className="font-medium">{news.title}</TableCell>
                      <TableCell>
                        {format(new Date(news.publishedAt), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-center">
                        {news.featured === 1 && (
                          <Star className="h-4 w-4 text-yellow-500 inline" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {news.images?.length || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(news)}
                            data-testid={`button-edit-${news.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(news.id)}
                            data-testid={`button-delete-${news.id}`}
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
                      Nenhuma notícia encontrada
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
                {selectedNews ? "Editar Notícia" : "Nova Notícia"}
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
                            placeholder="Título em português"
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
                            placeholder="Title in English"
                            data-testid="input-title-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo (PT) *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Conteúdo em português (max 1200 caracteres)"
                          rows={4}
                          data-testid="input-content"
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/1200 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contentEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo (EN)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Content in English (max 1200 characters)"
                          rows={4}
                          data-testid="input-content-en"
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/1200 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notícia em destaque
                        </FormLabel>
                        <FormDescription>
                          Destacar esta notícia na página principal
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 1}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 1 : 0)
                          }
                          data-testid="switch-featured"
                        />
                      </FormControl>
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
                      : selectedNews
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
                Esta ação não pode ser revertida. A notícia será permanentemente
                eliminada.
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
