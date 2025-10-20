import { useQuery } from "@tanstack/react-query";
import type { SpotifySettings } from "@shared/schema";

export function SpotifyPlayer() {
  const { data: settings, isLoading } = useQuery<SpotifySettings | null>({
    queryKey: ["/api/spotify-settings"],
  });

  if (isLoading || !settings || settings.isActive === 0) {
    return null;
  }

  const isCompact = settings.displayType === 'banner';

  return (
    <div className="w-full" data-testid="spotify-player">
      <iframe
        src={settings.embedUrl}
        width="100%"
        height={isCompact ? "152" : "352"}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
        data-testid="spotify-iframe"
      ></iframe>
    </div>
  );
}
