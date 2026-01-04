import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, Send, User } from "lucide-react";

type Comment = {
  id: string;
  userId: string;
  contentType: string;
  contentId: string;
  comment: string;
  isApproved: number;
  createdAt: string;
};

interface CommentSectionProps {
  contentType: "news" | "product";
  contentId: string;
  language: string;
}

export function CommentSection({ contentType, contentId, language }: CommentSectionProps) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");

  const t = {
    title: { pt: "Comentários", en: "Comments", fr: "Commentaires", es: "Comentarios", de: "Kommentare" },
    noComments: { pt: "Ainda não há comentários. Seja o primeiro a comentar!", en: "No comments yet. Be the first to comment!", fr: "Pas encore de commentaires. Soyez le premier!", es: "No hay comentarios. ¡Sé el primero!", de: "Noch keine Kommentare. Sei der Erste!" },
    placeholder: { pt: "Escreva o seu comentário...", en: "Write your comment...", fr: "Écrivez votre commentaire...", es: "Escribe tu comentario...", de: "Schreibe deinen Kommentar..." },
    namePlaceholder: { pt: "O seu nome", en: "Your name", fr: "Votre nom", es: "Tu nombre", de: "Dein Name" },
    submit: { pt: "Enviar", en: "Submit", fr: "Envoyer", es: "Enviar", de: "Senden" },
    sending: { pt: "A enviar...", en: "Sending...", fr: "Envoi...", es: "Enviando...", de: "Senden..." },
    success: { pt: "Comentário enviado! Aguarda aprovação.", en: "Comment submitted! Awaiting approval.", fr: "Commentaire envoyé! En attente d'approbation.", es: "¡Comentario enviado! Pendiente de aprobación.", de: "Kommentar gesendet! Wartet auf Genehmigung." },
    error: { pt: "Erro ao enviar comentário", en: "Error submitting comment", fr: "Erreur lors de l'envoi", es: "Error al enviar comentario", de: "Fehler beim Senden" },
    anonymous: { pt: "Anónimo", en: "Anonymous", fr: "Anonyme", es: "Anónimo", de: "Anonym" },
    pending: { pt: "Pendente", en: "Pending", fr: "En attente", es: "Pendiente", de: "Ausstehend" },
  };

  const translate = (key: Record<string, string>) => key[language] || key.pt;

  const { data: allComments = [] } = useQuery<Comment[]>({
    queryKey: ['/api/comments'],
  });

  const approvedComments = allComments.filter(
    c => c.contentType === contentType && c.contentId === contentId && c.isApproved === 1
  );

  const submitMutation = useMutation({
    mutationFn: async (data: { comment: string; authorName: string }) => {
      const response = await apiRequest("POST", "/api/comments", {
        userId: data.authorName || translate(t.anonymous),
        contentType,
        contentId,
        comment: data.comment,
        isApproved: 0,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({ title: translate(t.success) });
      setNewComment("");
      setAuthorName("");
    },
    onError: () => {
      toast({ title: translate(t.error), variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    submitMutation.mutate({ comment: newComment.trim(), authorName: authorName.trim() });
  };

  const formatDate = (dateString: string) => {
    const localeMap: Record<string, string> = {
      pt: 'pt-PT', en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE',
    };
    return new Date(dateString).toLocaleDateString(localeMap[language] || 'pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="mt-12" data-testid="section-comments">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {translate(t.title)} ({approvedComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={translate(t.namePlaceholder)}
              className="flex-1 max-w-xs px-3 py-2 bg-background border rounded-md text-sm"
              data-testid="input-comment-name"
            />
          </div>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={translate(t.placeholder)}
            rows={3}
            data-testid="input-comment-text"
          />
          <Button 
            type="submit" 
            disabled={!newComment.trim() || submitMutation.isPending}
            data-testid="button-submit-comment"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitMutation.isPending ? translate(t.sending) : translate(t.submit)}
          </Button>
        </form>

        <div className="border-t pt-6 space-y-4">
          {approvedComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6" data-testid="text-no-comments">
              {translate(t.noComments)}
            </p>
          ) : (
            approvedComments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg" data-testid={`comment-${comment.id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{comment.userId}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-muted-foreground">{comment.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
