import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Gallery } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

interface GalleryProps {
  language: string;
}

const seoByLang: Record<string, { title: string; description: string }> = {
  pt: { title: "Galeria", description: "Galeria de fotos e vídeos da banda Snowman. Momentos dos concertos, bastidores e videoclipes de rock progressivo." },
  en: { title: "Gallery", description: "Photo and video gallery of Snowman. Concert moments, behind the scenes and progressive rock music videos." },
  fr: { title: "Galerie", description: "Galerie de photos et vidéos de Snowman. Moments de concerts, coulisses et clips de rock progressif." },
  es: { title: "Galería", description: "Galería de fotos y vídeos de Snowman. Momentos de conciertos, tras bastidores y videoclips de rock progresivo." },
  de: { title: "Galerie", description: "Foto- und Videogalerie von Snowman. Konzertmomente, Hinter den Kulissen und Progressive-Rock-Musikvideos." },
};

function getCaption(item: Gallery, language: string): string {
  const captionMap: Record<string, string | null | undefined> = {
    pt: item.caption,
    en: item.captionEn,
    fr: item.captionFr,
    es: item.captionEs,
    de: item.captionDe,
  };
  return captionMap[language] || item.caption || '';
}

export default function GalleryPage({ language }: GalleryProps) {
  const seo = seoByLang[language] || seoByLang.pt;
  useSEO({ title: seo.title, description: seo.description, url: "/galeria", lang: language });
  const { data: gallery, isLoading } = useQuery<Gallery[]>({ queryKey: ["/api/gallery"] });
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [selectedMedia, setSelectedMedia] = useState<Gallery | null>(null);

  const t = {
    title: { pt: "GALERIA", en: "GALLERY", fr: "GALERIE", es: "GALERÍA", de: "GALERIE" },
    photos: { pt: "Fotos", en: "Photos", fr: "Photos", es: "Fotos", de: "Fotos" },
    videos: { pt: "Vídeos", en: "Videos", fr: "Vidéos", es: "Vídeos", de: "Videos" },
    noPhotos: { pt: "Nenhuma foto disponível", en: "No photos available", fr: "Aucune photo disponible", es: "No hay fotos disponibles", de: "Keine Fotos verfügbar" },
    noVideos: { pt: "Nenhum vídeo disponível", en: "No videos available", fr: "Aucune vidéo disponible", es: "No hay vídeos disponibles", de: "Keine Videos verfügbar" },
    loading: { pt: "Carregando...", en: "Loading...", fr: "Chargement...", es: "Cargando...", de: "Laden..." },
  };

  const translate = (key: any) => key[language as keyof typeof key] || key.pt;

  const photos = gallery?.filter(item => item.type === 'photo') || [];
  const videos = gallery?.filter(item => item.type === 'video') || [];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-muted-foreground" data-testid="text-loading">{translate(t.loading)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight uppercase mb-12" data-testid="text-gallery-title">
          {translate(t.title)}
        </h1>

        <div className="flex gap-4 mb-12">
          <Button
            variant={activeTab === 'photos' ? 'default' : 'outline'}
            onClick={() => setActiveTab('photos')}
            data-testid="button-tab-photos"
          >
            {translate(t.photos)}
          </Button>
          <Button
            variant={activeTab === 'videos' ? 'default' : 'outline'}
            onClick={() => setActiveTab('videos')}
            data-testid="button-tab-videos"
          >
            {translate(t.videos)}
          </Button>
        </div>

        {activeTab === 'photos' && (
          <>
            {photos.length > 0 ? (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-md hover-elevate"
                    onClick={() => setSelectedMedia(photo)}
                    data-testid={`img-photo-${photo.id}`}
                  >
                    <img
                      src={photo.url}
                      alt={getCaption(photo, language)}
                      loading="lazy"
                      className="w-full h-auto object-cover"
                    />
                    {photo.caption && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-sm">
                          {getCaption(photo, language)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12" data-testid="text-no-photos">
                {translate(t.noPhotos)}
              </p>
            )}
          </>
        )}

        {activeTab === 'videos' && (
          <>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="aspect-video bg-gray-900 rounded-md overflow-hidden cursor-pointer group relative hover-elevate"
                    onClick={() => setSelectedMedia(video)}
                    data-testid={`video-${video.id}`}
                  >
                    <img
                      src={video.thumbnail || video.url}
                      alt={getCaption(video, language)}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                      <div className="bg-primary/90 rounded-full p-4">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>
                    {video.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white text-sm">
                          {getCaption(video, language)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12" data-testid="text-no-videos">
                {translate(t.noVideos)}
              </p>
            )}
          </>
        )}
      </div>

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-6xl p-0 bg-black border-gray-800" data-testid="dialog-lightbox">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white"
              onClick={() => setSelectedMedia(null)}
              data-testid="button-close-lightbox"
            >
              <X className="h-6 w-6" />
            </Button>
            {selectedMedia && (
              <div className="w-full">
                {selectedMedia.type === 'photo' ? (
                  <img
                    src={selectedMedia.url}
                    alt={getCaption(selectedMedia, language)}
                    className="w-full h-auto max-h-[90vh] object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-auto max-h-[90vh]"
                    autoPlay
                  />
                )}
                {selectedMedia.caption && (
                  <div className="p-6 bg-black">
                    <p className="text-white text-center">
                      {getCaption(selectedMedia, language)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
