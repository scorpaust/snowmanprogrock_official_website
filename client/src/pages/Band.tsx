import { useQuery } from "@tanstack/react-query";
import type { Biography } from "@shared/schema";

interface BandProps {
  language: string;
}

export default function Band({ language }: BandProps) {
  const { data: biography } = useQuery<Biography>({ queryKey: ["/api/biography"] });

  const t = {
    title: { pt: "A BANDA", en: "THE BAND", fr: "LE GROUPE", es: "LA BANDA", de: "DIE BAND" },
    bioTitle: { pt: "Biografia", en: "Biography", fr: "Biographie", es: "Biografía", de: "Biografie" },
    membersTitle: { pt: "MEMBROS", en: "MEMBERS", fr: "MEMBRES", es: "MIEMBROS", de: "MITGLIEDER" },
    member: { pt: "Membro", en: "Member", fr: "Membre", es: "Miembro", de: "Mitglied" },
    role: { pt: "Função", en: "Role", fr: "Rôle", es: "Rol", de: "Rolle" },
    noBio: { pt: "Biografia em breve...", en: "Biography coming soon...", fr: "Biographie à venir...", es: "Biografía próximamente...", de: "Biografie demnächst..." },
  };

  const translate = (key: any) => key[language as keyof typeof key] || key.pt;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight uppercase mb-8" data-testid="text-band-title">
            {translate(t.title)}
          </h1>
        </div>

        {/* Band Image */}
        <div className="mb-16 aspect-[21/9] bg-gray-900 rounded-md overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80"
            alt="Snowman Band"
            className="w-full h-full object-cover"
            data-testid="img-band"
          />
        </div>

        {/* Biography */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 tracking-tight" data-testid="text-biography-title">
            {translate(t.bioTitle)}
          </h2>
          
          {biography ? (
            <div className="prose prose-invert prose-lg max-w-none" data-testid="text-biography-content">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {language === 'en' && biography.contentEn ? biography.contentEn : biography.content}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12" data-testid="text-no-biography">
              {translate(t.noBio)}
            </p>
          )}
        </div>

        {/* Member Profiles Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-12 tracking-tight text-center" data-testid="text-members-title">
            {translate(t.membersTitle)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((member) => (
              <div key={member} className="text-center group" data-testid={`card-member-${member}`}>
                <div className="aspect-square bg-gray-900 rounded-full overflow-hidden mb-4 hover-elevate">
                  <img
                    src={`https://images.unsplash.com/photo-${1500000000000 + member * 100000}?w=400&q=80`}
                    alt={`${translate(t.member)} ${member}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">{translate(t.member)} {member}</h3>
                <p className="text-sm text-muted-foreground">{translate(t.role)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
