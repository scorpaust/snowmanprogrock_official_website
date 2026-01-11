import { useQuery } from "@tanstack/react-query";
import type { Biography, BandMember } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface BandProps {
  language: string;
}

export default function Band({ language }: BandProps) {
  const { data: biography } = useQuery<Biography>({ queryKey: ["/api/biography"] });
  const { data: members = [], isLoading: membersLoading } = useQuery<BandMember[]>({ 
    queryKey: ["/api/band-members"] 
  });

  const activeMembers = members
    .filter(m => m.isActive === 1)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const t = {
    title: { pt: "A BANDA", en: "THE BAND", fr: "LE GROUPE", es: "LA BANDA", de: "DIE BAND" },
    bioTitle: { pt: "Biografia", en: "Biography", fr: "Biographie", es: "Biografía", de: "Biografie" },
    membersTitle: { pt: "MEMBROS", en: "MEMBERS", fr: "MEMBRES", es: "MIEMBROS", de: "MITGLIEDER" },
    noBio: { pt: "Biografia em breve...", en: "Biography coming soon...", fr: "Biographie à venir...", es: "Biografía próximamente...", de: "Biografie demnächst..." },
    noMembers: { pt: "Membros em breve...", en: "Members coming soon...", fr: "Membres à venir...", es: "Miembros próximamente...", de: "Mitglieder demnächst..." },
  };

  const translate = (key: any) => key[language as keyof typeof key] || key.pt;

  const getLocalizedRole = (member: BandMember) => {
    switch (language) {
      case 'en': return member.roleEn || member.role;
      case 'fr': return member.roleFr || member.role;
      case 'es': return member.roleEs || member.role;
      case 'de': return member.roleDe || member.role;
      default: return member.role;
    }
  };

  const getLocalizedBiography = (bio: Biography) => {
    switch (language) {
      case 'en': return bio.contentEn || bio.content;
      case 'fr': return bio.contentFr || bio.content;
      case 'es': return bio.contentEs || bio.content;
      case 'de': return bio.contentDe || bio.content;
      default: return bio.content;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight uppercase mb-8" data-testid="text-band-title">
            {translate(t.title)}
          </h1>
        </div>

        <div className="mb-16 aspect-[21/9] bg-gray-900 rounded-md overflow-hidden">
          {biography?.bandImage ? (
            <img
              src={biography.bandImage}
              alt="Snowman Band"
              className="w-full h-full object-cover"
              data-testid="img-band"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="text-6xl md:text-8xl font-bold text-gray-700 tracking-widest" data-testid="text-band-placeholder">
                SNOWMAN
              </span>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 tracking-tight" data-testid="text-biography-title">
            {translate(t.bioTitle)}
          </h2>
          
          {biography ? (
            <div className="prose prose-invert prose-lg max-w-none" data-testid="text-biography-content">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {getLocalizedBiography(biography)}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12" data-testid="text-no-biography">
              {translate(t.noBio)}
            </p>
          )}
        </div>

        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-12 tracking-tight text-center" data-testid="text-members-title">
            {translate(t.membersTitle)}
          </h2>
          
          {membersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeMembers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {activeMembers.map((member) => (
                <div key={member.id} className="text-center group" data-testid={`card-member-${member.id}`}>
                  <div className="aspect-square mb-4 hover-elevate">
                    <Avatar className="w-full h-full">
                      <AvatarImage 
                        src={member.image || undefined} 
                        alt={member.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-4xl bg-gray-800 text-gray-200">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="font-semibold text-lg" data-testid={`text-member-name-${member.id}`}>
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid={`text-member-role-${member.id}`}>
                    {getLocalizedRole(member)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12" data-testid="text-no-members">
              {translate(t.noMembers)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
