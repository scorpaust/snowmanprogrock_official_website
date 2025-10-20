import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SpotifySettings } from "@shared/schema";
import { LogOut, Music2 } from "lucide-react";

const spotifyFormSchema = z.object({
  embedUrl: z.string().regex(/^https:\/\/open\.spotify\.com\/embed\//, "Must be a Spotify embed URL"),
  displayType: z.enum(['player', 'banner']),
  isActive: z.boolean(),
});

type SpotifyForm = z.infer<typeof spotifyFormSchema>;

export default function SpotifySettingsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: authUser, isLoading: authLoading, error: authError } = useQuery<{ id: string; username: string; role: string }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<SpotifySettings | null>({
    queryKey: ["/api/spotify-settings"],
    enabled: !!authUser,
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
    if (authError || (!authLoading && !authUser)) {
      setLocation("/admin/login");
    }
  }, [authUser, authLoading, authError, setLocation]);

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
        title: "Settings updated",
        description: "Spotify player settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      setLocation("/admin/login");
    },
  });

  const onSubmit = (data: SpotifyForm) => {
    updateMutation.mutate(data);
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-black/95 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Music2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Spotify Settings</h1>
              <p className="text-sm text-muted-foreground">Logged in as {authUser.username}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="embedUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spotify Embed URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://open.spotify.com/embed/album/..."
                        {...field}
                        data-testid="input-embed-url"
                      />
                    </FormControl>
                    <FormDescription>
                      Must be a Spotify embed URL (album, playlist, track, etc.)
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
                    <FormLabel>Display Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-display-type">
                          <SelectValue placeholder="Select display type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="player">Player (352px height)</SelectItem>
                        <SelectItem value="banner">Banner (152px height)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how the Spotify embed is displayed on the home page
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
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Display the Spotify player on the home page
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
                        {field.value ? "Enabled" : "Disabled"}
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
                {updateMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
