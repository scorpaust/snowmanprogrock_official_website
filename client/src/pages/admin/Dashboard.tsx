import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Calendar, Image, ShoppingCart, MessageSquare, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Stats {
  news: number;
  events: number;
  gallery: number;
  products: number;
  comments: number;
  users: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats", undefined);
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return await response.json();
    },
    retry: false,
  });

  const statsCards = [
    {
      title: "Notícias",
      value: stats?.news || 0,
      icon: Newspaper,
      color: "text-blue-500",
    },
    {
      title: "Eventos",
      value: stats?.events || 0,
      icon: Calendar,
      color: "text-green-500",
    },
    {
      title: "Galeria",
      value: stats?.gallery || 0,
      icon: Image,
      color: "text-purple-500",
    },
    {
      title: "Produtos",
      value: stats?.products || 0,
      icon: ShoppingCart,
      color: "text-orange-500",
    },
    {
      title: "Comentários Pendentes",
      value: stats?.comments || 0,
      icon: MessageSquare,
      color: "text-yellow-500",
    },
    {
      title: "Utilizadores",
      value: stats?.users || 0,
      icon: Users,
      color: "text-pink-500",
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading stats...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão Snowman
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Backoffice</CardTitle>
            <CardDescription>
              Gerencie todo o conteúdo do website Snowman a partir daqui
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Utilize o menu lateral para navegar entre as diferentes secções:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Notícias: Criar e gerir artigos de notícias</li>
              <li>Eventos: Gerir eventos e concertos da banda</li>
              <li>Galeria: Adicionar fotos e vídeos</li>
              <li>Produtos: Gerir a loja online (discos, merchandise)</li>
              <li>Biografia: Editar a biografia da banda</li>
              <li>Utilizadores: Gerir utilizadores do backoffice</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
