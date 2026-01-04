import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, X, MessageSquare, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Comment = {
  id: string;
  userId: string;
  contentType: string;
  contentId: string;
  comment: string;
  isApproved: number;
  createdAt: string;
  updatedAt: string;
};

export default function CommentsModeration() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['/api/comments'],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/comments/${id}`, { isApproved: 1 });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({ title: "Comentário aprovado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao aprovar comentário", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/comments/${id}`, { isApproved: 0 });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({ title: "Comentário rejeitado" });
    },
    onError: () => {
      toast({ title: "Erro ao rejeitar comentário", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/comments/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({ title: "Comentário eliminado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao eliminar comentário", variant: "destructive" });
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem a certeza que deseja eliminar este comentário permanentemente?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'pending') return comment.isApproved === 0;
    if (filter === 'approved') return comment.isApproved === 1;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">A carregar comentários...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Moderação de Comentários</h1>
            <p className="text-muted-foreground">Reveja e aprove os comentários dos utilizadores</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Badge variant="secondary">
              Total: {comments.length}
            </Badge>
            <Badge variant="default">
              Pendentes: {comments.filter(c => c.isApproved === 0).length}
            </Badge>
            <Badge variant="outline">
              Aprovados: {comments.filter(c => c.isApproved === 1).length}
            </Badge>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pendentes ({comments.filter(c => c.isApproved === 0).length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">
              Aprovados ({comments.filter(c => c.isApproved === 1).length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              Todos ({comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6 space-y-4">
            {filteredComments.map((comment) => (
              <Card key={comment.id} data-testid={`card-comment-${comment.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {comment.contentType === 'news' ? 'Comentário em Notícia' : 'Comentário em Produto'}
                        </span>
                        {comment.isApproved === 1 ? (
                          <Badge variant="default" className="text-xs">Aprovado</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Pendente</Badge>
                        )}
                      </div>
                      <p className="text-base">{comment.comment}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>ID Utilizador: {comment.userId.substring(0, 8)}...</span>
                        <span>ID Conteúdo: {comment.contentId.substring(0, 8)}...</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {comment.isApproved === 0 ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(comment.id)}
                          disabled={approveMutation.isPending}
                          data-testid={`button-approve-${comment.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReject(comment.id)}
                          disabled={rejectMutation.isPending}
                          data-testid={`button-reject-${comment.id}`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Desaprovar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${comment.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredComments.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'pending' && "Não há comentários pendentes para rever."}
                    {filter === 'approved' && "Ainda não há comentários aprovados."}
                    {filter === 'all' && "Ainda não há comentários."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
