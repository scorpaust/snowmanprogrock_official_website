import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SpotifySettings } from "@shared/schema";
import { Music2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const spotifyFormSchema = z.object({
  embedUrl: z.string().regex(/^https:\/\/open\.spotify\.com\/embed\//, "Deve ser um URL de embed do Spotify"),
  displayType: z.enum(['player', 'banner']),
  isActive: z.boolean(),
});

type SpotifyForm = z.infer<typeof spotifyFormSchema>;

export default function SpotifySettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading: settingsLoading } = useQuery<SpotifySettings | null>({
    queryKey: ["/api/spotify-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/spotify-settings", undefined);
      if (!response.ok) {
        throw new Error("Erro ao carregar definições");
      }
      return await response.json();
    },
  });

  const form = useForm<SpotifyForm>({
    resolver: zodResolver(spotifyFormSchema),
    defaultValues: {
      embedUrl: "",
      displayType: "player",
      isActive: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        embedUrl: settings.embedUrl,
        displayType: settings.displayType as 'player' | 'banner',
        isActive: settings.isActive === 1,
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SpotifyForm) => {
      const payload = {
        embedUrl: data.embedUrl,
        displayType: data.displayType,
        isActive: data.isActive ? 1 : 0,
      };
      const response = await apiRequest("PUT", "/api/spotify-settings", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spotify-settings"] });
      toast({
        title: "Definições atualizadas",
        description: "As definições do Spotify foram guardadas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SpotifyForm) => {
    updateMutation.mutate(data);
  };

  if (settingsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">A carregar definições...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Music2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Definições Spotify</h1>
            <p className="text-muted-foreground">
              Configure o leitor Spotify para a página inicial
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuração do Embed Spotify</CardTitle>
            <CardDescription>
              Controle como o leitor Spotify é exibido no website
            </CardDescription>
          </CardHeader>
          <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="embedUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Embed do Spotify</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://open.spotify.com/embed/album/..."
                        {...field}
                        data-testid="input-embed-url"
                      />
                    </FormControl>
                    <FormDescription>
                      Deve ser um URL de embed do Spotify (álbum, playlist, faixa, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Exibição</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-display-type">
                          <SelectValue placeholder="Selecione o tipo de exibição" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="player">Player (352px altura)</SelectItem>
                        <SelectItem value="banner">Banner (152px altura)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Escolha como o embed do Spotify é exibido na página inicial
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>
                        Exibir o leitor Spotify na página inicial
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Button
                        type="button"
                        variant={field.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(!field.value)}
                        data-testid="button-is-active"
                      >
                        {field.value ? "Ativado" : "Desativado"}
                      </Button>
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                {updateMutation.isPending ? "A guardar..." : "Guardar Definições"}
              </Button>
            </form>
          </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
