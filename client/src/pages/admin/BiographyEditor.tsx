import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { FileText, Save, Upload, Image, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { Biography } from "@shared/schema";
import { insertBiographySchema } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

type BiographyForm = z.infer<typeof insertBiographySchema>;

export default function BiographyEditor() {
  const { toast } = useToast();

  const { data: biography, isLoading } = useQuery<Biography | null>({
    queryKey: ["/api/biography"],
    queryFn: async () => {
      const response = await fetch("/api/biography");
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch biography");
      }
      return response.json();
    },
  });

  const form = useForm<BiographyForm>({
    resolver: zodResolver(insertBiographySchema),
    defaultValues: {
      content: "",
      contentEn: "",
      contentFr: "",
      contentEs: "",
      contentDe: "",
      bandImage: "",
    },
  });

  useEffect(() => {
    if (biography) {
      form.reset({
        content: biography.content,
        contentEn: biography.contentEn || "",
        contentFr: biography.contentFr || "",
        contentEs: biography.contentEs || "",
        contentDe: biography.contentDe || "",
        bandImage: biography.bandImage || "",
      });
    }
  }, [biography, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: BiographyForm) => {
      const payload = {
        ...data,
        contentEn: data.contentEn || undefined,
        contentFr: data.contentFr || undefined,
        contentEs: data.contentEs || undefined,
        contentDe: data.contentDe || undefined,
        bandImage: data.bandImage || undefined,
      };
      const response = await apiRequest("PUT", "/api/biography", payload);
      if (!response.ok) throw new Error("Failed to save biography");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biography"] });
      toast({
        title: "Biografia guardada",
        description: "A biografia da banda foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao guardar biografia.",
        variant: "destructive",
      });
    },
  });

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

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      if (uploadURL) {
        try {
          const response = await apiRequest("POST", "/api/objects/normalize-path", { uploadURL });
          if (!response.ok) {
            throw new Error("Failed to normalize path");
          }
          const data = await response.json();
          form.setValue("bandImage", data.objectPath);
          toast({ title: "Foto carregada com sucesso" });
        } catch {
          toast({ title: "Erro ao processar foto", variant: "destructive" });
        }
      }
    }
  };

  const onSubmit = (data: BiographyForm) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">A carregar biografia...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Biografia</h1>
            <p className="text-muted-foreground">
              Editar a biografia da banda
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Foto Principal da Banda
                </CardTitle>
                <CardDescription>
                  Esta foto será exibida na página da Banda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="bandImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foto da Banda</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          {field.value && (
                            <div className="relative max-w-md">
                              <img
                                src={field.value}
                                alt="Foto da banda"
                                className="rounded-lg w-full max-h-64 object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => form.setValue("bandImage", "")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <div className="flex gap-2 items-center flex-wrap">
                            <ObjectUploader
                              maxNumberOfFiles={1}
                              maxFileSize={10485760}
                              onGetUploadParameters={handleGetUploadURL}
                              onComplete={handleUploadComplete}
                              variant="outline"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Foto
                            </ObjectUploader>
                            <span className="text-muted-foreground text-sm">ou</span>
                            <Input
                              placeholder="Cole o URL da imagem"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              className="max-w-sm"
                              data-testid="input-band-image"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Recomendado: imagem de alta qualidade (mínimo 1200x800 pixels)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conteúdo da Biografia</CardTitle>
                <CardDescription>
                  Máximo 800 caracteres por idioma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="pt" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="pt" data-testid="tab-pt">PT *</TabsTrigger>
                    <TabsTrigger value="en" data-testid="tab-en">EN</TabsTrigger>
                    <TabsTrigger value="fr" data-testid="tab-fr">FR</TabsTrigger>
                    <TabsTrigger value="es" data-testid="tab-es">ES</TabsTrigger>
                    <TabsTrigger value="de" data-testid="tab-de">DE</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pt" className="mt-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo (PT) *</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Biografia em português" rows={8} data-testid="input-content" />
                          </FormControl>
                          <FormDescription>{field.value?.length || 0}/800 caracteres</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="en" className="mt-4">
                    <FormField
                      control={form.control}
                      name="contentEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo (EN)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} placeholder="Biography in English" rows={8} data-testid="input-content-en" />
                          </FormControl>
                          <FormDescription>{field.value?.length || 0}/800 caracteres</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="fr" className="mt-4">
                    <FormField
                      control={form.control}
                      name="contentFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo (FR)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} placeholder="Biographie en français" rows={8} data-testid="input-content-fr" />
                          </FormControl>
                          <FormDescription>{field.value?.length || 0}/800 caracteres</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="es" className="mt-4">
                    <FormField
                      control={form.control}
                      name="contentEs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo (ES)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} placeholder="Biografía en español" rows={8} data-testid="input-content-es" />
                          </FormControl>
                          <FormDescription>{field.value?.length || 0}/800 caracteres</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="de" className="mt-4">
                    <FormField
                      control={form.control}
                      name="contentDe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo (DE)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} placeholder="Biographie auf Deutsch" rows={8} data-testid="input-content-de" />
                          </FormControl>
                          <FormDescription>{field.value?.length || 0}/800 caracteres</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    data-testid="button-save"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveMutation.isPending ? "A guardar..." : "Guardar Tudo"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
