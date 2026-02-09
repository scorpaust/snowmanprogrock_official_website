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
import { Newspaper, Plus, Pencil, Trash2, Star, Upload, X, Image, Video, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { News, InsertNews } from "@shared/schema";
import { insertNewsSchema } from "@shared/schema";
import { format } from "date-fns";
import type { UploadResult } from "@uppy/core";

const MAX_CONTENT = 800;
const MAX_PARAGRAPH = 350;

const validateParagraphs = (text: string | undefined | null): string | true => {
  if (!text) return true;
  const paragraphs = text.split(/(?<=\.)\s+/);
  for (let i = 0; i < paragraphs.length; i++) {
    if (paragraphs[i].length > MAX_PARAGRAPH) {
      return `Parágrafo ${i + 1} excede ${MAX_PARAGRAPH} caracteres (${paragraphs[i].length}). Adicione um ponto final para separar.`;
    }
  }
  return true;
};

const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/).+$/;

const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const newsFormSchema = insertNewsSchema.extend({
  images: z.array(z.string()).default([]),
  videoUrls: z.array(z.string()).default([]),
  content: z.string().max(MAX_CONTENT, `O conteúdo deve ter no máximo ${MAX_CONTENT} caracteres`).refine(
    (val) => validateParagraphs(val) === true,
    (val) => ({ message: validateParagraphs(val) as string })
  ),
  contentEn: z.string().max(MAX_CONTENT).optional().refine(
    (val) => !val || validateParagraphs(val) === true,
    (val) => ({ message: (validateParagraphs(val) as string) || '' })
  ),
  contentFr: z.string().max(MAX_CONTENT).optional().refine(
    (val) => !val || validateParagraphs(val) === true,
    (val) => ({ message: (validateParagraphs(val) as string) || '' })
  ),
  contentEs: z.string().max(MAX_CONTENT).optional().refine(
    (val) => !val || validateParagraphs(val) === true,
    (val) => ({ message: (validateParagraphs(val) as string) || '' })
  ),
  contentDe: z.string().max(MAX_CONTENT).optional().refine(
    (val) => !val || validateParagraphs(val) === true,
    (val) => ({ message: (validateParagraphs(val) as string) || '' })
  ),
});

type NewsForm = z.infer<typeof newsFormSchema>;

export default function NewsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoUrlError, setVideoUrlError] = useState("");

  const { data: newsList, isLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const form = useForm<NewsForm>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      titleEn: "",
      titleFr: "",
      titleEs: "",
      titleDe: "",
      content: "",
      contentEn: "",
      contentFr: "",
      contentEs: "",
      contentDe: "",
      images: [],
      videoUrls: [],
      featured: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: NewsForm) => {
      const payload = {
        ...data,
        titleEn: data.titleEn || undefined,
        titleFr: data.titleFr || undefined,
        titleEs: data.titleEs || undefined,
        titleDe: data.titleDe || undefined,
        contentEn: data.contentEn || undefined,
        contentFr: data.contentFr || undefined,
        contentEs: data.contentEs || undefined,
        contentDe: data.contentDe || undefined,
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
        titleFr: data.titleFr || undefined,
        titleEs: data.titleEs || undefined,
        titleDe: data.titleDe || undefined,
        contentEn: data.contentEn || undefined,
        contentFr: data.contentFr || undefined,
        contentEs: data.contentEs || undefined,
        contentDe: data.contentDe || undefined,
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
    setVideoUrlInput("");
    setVideoUrlError("");
    form.reset({
      title: "",
      titleEn: "",
      titleFr: "",
      titleEs: "",
      titleDe: "",
      content: "",
      contentEn: "",
      contentFr: "",
      contentEs: "",
      contentDe: "",
      images: [],
      videoUrls: [],
      featured: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setVideoUrlInput("");
    setVideoUrlError("");
    form.reset({
      title: news.title,
      titleEn: news.titleEn || "",
      titleFr: news.titleFr || "",
      titleEs: news.titleEs || "",
      titleDe: news.titleDe || "",
      content: news.content,
      contentEn: news.contentEn || "",
      contentFr: news.contentFr || "",
      contentEs: news.contentEs || "",
      contentDe: news.contentDe || "",
      images: news.images || [],
      videoUrls: news.videoUrls || [],
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

  const handleImageUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      if (uploadURL) {
        try {
          const response = await apiRequest("POST", "/api/objects/normalize-path", { uploadURL });
          if (!response.ok) {
            throw new Error("Failed to normalize path");
          }
          const data = await response.json();
          const currentImages = form.getValues("images") || [];
          form.setValue("images", [...currentImages, data.objectPath]);
          toast({
            title: "Upload concluído",
            description: "Imagem carregada com sucesso.",
          });
        } catch (error) {
          console.error("Error normalizing path:", error);
          toast({
            title: "Erro",
            description: "Falha ao processar imagem.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue("images", currentImages.filter((_, i) => i !== index));
  };

  const addVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    if (!youtubeUrlRegex.test(url)) {
      setVideoUrlError("URL inválido. Insira um link válido do YouTube.");
      return;
    }
    const videoId = extractYoutubeId(url);
    if (!videoId) {
      setVideoUrlError("Não foi possível extrair o ID do vídeo. Verifique o link.");
      return;
    }
    const currentVideos = form.getValues("videoUrls") || [];
    if (currentVideos.some(v => extractYoutubeId(v) === videoId)) {
      setVideoUrlError("Este vídeo já foi adicionado.");
      return;
    }
    form.setValue("videoUrls", [...currentVideos, url]);
    setVideoUrlInput("");
    setVideoUrlError("");
  };

  const removeVideoUrl = (index: number) => {
    const currentVideos = form.getValues("videoUrls") || [];
    form.setValue("videoUrls", currentVideos.filter((_, i) => i !== index));
  };

  const renderContentField = (
    name: "content" | "contentEn" | "contentFr" | "contentEs" | "contentDe",
    label: string,
    placeholder: string,
    testId: string
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const value = field.value || "";
        const charCount = value.length;
        const isOverLimit = charCount > MAX_CONTENT;
        const paragraphs = value.split(/(?<=\.)\s+/);
        const hasLongParagraph = paragraphs.some(p => p.length > MAX_PARAGRAPH);
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={value}
                maxLength={MAX_CONTENT}
                placeholder={placeholder}
                rows={5}
                data-testid={testId}
              />
            </FormControl>
            <div className="flex items-center justify-between gap-2">
              <FormDescription className="text-xs">
                {hasLongParagraph && (
                  <span className="text-destructive">Cada parágrafo (após ponto final) deve ter no máximo {MAX_PARAGRAPH} caracteres.</span>
                )}
              </FormDescription>
              <FormDescription className={`text-xs text-right ${isOverLimit ? 'text-destructive' : ''}`}>
                {charCount}/{MAX_CONTENT}
              </FormDescription>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );

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
                Gerir notícias e artigos da banda
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
                  <TableHead>Imagem</TableHead>
                  <TableHead>Título (PT)</TableHead>
                  <TableHead>Data Publicação</TableHead>
                  <TableHead className="text-center">Destaque</TableHead>
                  <TableHead className="text-center">Imagens</TableHead>
                  <TableHead className="text-center">Vídeos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsList && newsList.length > 0 ? (
                  newsList.map((news) => (
                    <TableRow key={news.id} data-testid={`row-news-${news.id}`}>
                      <TableCell>
                        {news.images && news.images[0] ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                            <img src={news.images[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{news.title}</TableCell>
                      <TableCell>
                        {format(new Date(news.publishedAt), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-center">
                        {news.featured === 1 ? (
                          <Star className="h-4 w-4 text-yellow-500 mx-auto fill-yellow-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {news.images?.length || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {news.videoUrls?.length ? (
                          <div className="flex items-center justify-center gap-1">
                            <Video className="h-3.5 w-3.5 text-red-500" />
                            <span>{news.videoUrls.length}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
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
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                Preencha os campos abaixo. Os campos em outras línguas são opcionais.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagens</FormLabel>
                      <div className="space-y-3">
                        {field.value && field.value.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {field.value.map((img, index) => (
                              <div key={index} className="relative group aspect-square rounded-md overflow-hidden bg-muted">
                                <img src={img} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  data-testid={`button-remove-image-${index}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                {index === 0 && (
                                  <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">Principal</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880}
                          accept={["image/jpeg", "image/png", "image/webp", "image/gif"]}
                          onGetUploadParameters={handleGetUploadURL}
                          onComplete={handleImageUploadComplete}
                          variant="outline"
                          data-testid="button-upload-image"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Carregar Imagem
                        </ObjectUploader>
                      </div>
                      <FormDescription>A primeira imagem será a imagem principal da notícia.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vídeos YouTube</FormLabel>
                      <div className="space-y-3">
                        {field.value && field.value.length > 0 && (
                          <div className="space-y-2">
                            {field.value.map((url, index) => {
                              const videoId = extractYoutubeId(url);
                              return (
                                <div key={index} className="flex items-center gap-2 rounded-md border p-2 bg-muted/30">
                                  {videoId && (
                                    <img
                                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                      alt={`Vídeo ${index + 1}`}
                                      className="w-24 h-14 rounded object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground truncate">{url}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeVideoUrl(index)}
                                    data-testid={`button-remove-video-${index}`}
                                  >
                                    <X className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <Input
                              value={videoUrlInput}
                              onChange={(e) => {
                                setVideoUrlInput(e.target.value);
                                setVideoUrlError("");
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addVideoUrl();
                                }
                              }}
                              placeholder="https://www.youtube.com/watch?v=..."
                              data-testid="input-video-url"
                            />
                            {videoUrlError && (
                              <p className="text-xs text-destructive mt-1">{videoUrlError}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addVideoUrl}
                            data-testid="button-add-video"
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                      <FormDescription>Cole links do YouTube para embeber vídeos na notícia.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Tabs defaultValue="pt" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="pt" data-testid="tab-pt">PT *</TabsTrigger>
                    <TabsTrigger value="en" data-testid="tab-en">EN</TabsTrigger>
                    <TabsTrigger value="fr" data-testid="tab-fr">FR</TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-es">ES</TabsTrigger>
                    <TabsTrigger value="de" data-testid="tab-de">DE</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pt" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título (PT) *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Título em português" data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {renderContentField("content", "Conteúdo (PT) *", "Conteúdo em português", "input-content")}
                  </TabsContent>

                  <TabsContent value="en" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="titleEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título (EN)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Title in English" data-testid="input-title-en" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {renderContentField("contentEn", "Conteúdo (EN)", "Content in English", "input-content-en")}
                  </TabsContent>

                  <TabsContent value="fr" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="titleFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título (FR)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Titre en français" data-testid="input-title-fr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {renderContentField("contentFr", "Conteúdo (FR)", "Contenu en français", "input-content-fr")}
                  </TabsContent>

                  <TabsContent value="es" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="titleEs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título (ES)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Título en español" data-testid="input-title-es" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {renderContentField("contentEs", "Conteúdo (ES)", "Contenido en español", "input-content-es")}
                  </TabsContent>

                  <TabsContent value="de" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="titleDe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título (DE)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Titel auf Deutsch" data-testid="input-title-de" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {renderContentField("contentDe", "Conteúdo (DE)", "Inhalt auf Deutsch", "input-content-de")}
                  </TabsContent>
                </Tabs>

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
