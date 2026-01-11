import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, Send, User, Star, LogIn } from "lucide-react";

type Comment = {
  id: string;
  userId: string;
  userProfileId: string | null;
  userName: string | null;
  userAvatar: string | null;
  userTotalComments: number | null;
  contentType: string;
  contentId: string;
  comment: string;
  isApproved: number;
  createdAt: string;
};

type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  totalComments: number;
};

interface CommentSectionProps {
  contentType: "news" | "product";
  contentId: string;
  language: string;
}

export function CommentSection({ contentType, contentId, language }: CommentSectionProps) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");

  const t = {
    title: { pt: "Comentários", en: "Comments", fr: "Commentaires", es: "Comentarios", de: "Kommentare" },
    noComments: { pt: "Ainda não há comentários. Seja o primeiro a comentar!", en: "No comments yet. Be the first to comment!", fr: "Pas encore de commentaires. Soyez le premier!", es: "No hay comentarios. ¡Sé el primero!", de: "Noch keine Kommentare. Sei der Erste!" },
    placeholder: { pt: "Escreva o seu comentário...", en: "Write your comment...", fr: "Écrivez votre commentaire...", es: "Escribe tu comentario...", de: "Schreibe deinen Kommentar..." },
    submit: { pt: "Enviar", en: "Submit", fr: "Envoyer", es: "Enviar", de: "Senden" },
    sending: { pt: "A enviar...", en: "Sending...", fr: "Envoi...", es: "Enviando...", de: "Senden..." },
    success: { pt: "Comentário enviado! Aguarda aprovação.", en: "Comment submitted! Awaiting approval.", fr: "Commentaire envoyé! En attente d'approbation.", es: "¡Comentario enviado! Pendiente de aprobación.", de: "Kommentar gesendet! Wartet auf Genehmigung." },
    error: { pt: "Erro ao enviar comentário", en: "Error submitting comment", fr: "Erreur lors de l'envoi", es: "Error al enviar comentario", de: "Fehler beim Senden" },
    minLength: { pt: "Comentário deve ter pelo menos 10 caracteres", en: "Comment must be at least 10 characters", fr: "Le commentaire doit contenir au moins 10 caractères", es: "El comentario debe tener al menos 10 caracteres", de: "Kommentar muss mindestens 10 Zeichen haben" },
    loginRequired: { pt: "Inicia sessão para comentar", en: "Login to comment", fr: "Connectez-vous pour commenter", es: "Inicia sesión para comentar", de: "Melden Sie sich an, um zu kommentieren" },
    login: { pt: "Entrar", en: "Login", fr: "Connexion", es: "Entrar", de: "Anmelden" },
    comment: { pt: "comentário", en: "comment", fr: "commentaire", es: "comentario", de: "Kommentar" },
    comments: { pt: "comentários", en: "comments", fr: "commentaires", es: "comentarios", de: "Kommentare" },
    approvedComments: { pt: "comentário aprovado", en: "approved comment", fr: "commentaire approuvé", es: "comentario aprobado", de: "genehmigter Kommentar" },
    approvedCommentsPlural: { pt: "comentários aprovados", en: "approved comments", fr: "commentaires approuvés", es: "comentarios aprobados", de: "genehmigte Kommentare" },
  };

  const translate = (key: Record<string, string>) => key[language] || key.pt;

  const getCommentLabel = (count: number) => {
    if (count === 1) {
      return translate(t.approvedComments);
    }
    return translate(t.approvedCommentsPlural);
  };

  const { data: currentUser } = useQuery<UserProfile>({
    queryKey: ['/api/customer/me'],
    retry: false,
  });

  const { data: allComments = [] } = useQuery<Comment[]>({
    queryKey: ['/api/comments'],
  });

  const approvedComments = allComments.filter(
    c => c.contentType === contentType && c.contentId === contentId && c.isApproved === 1
  );

  const submitMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!currentUser) throw new Error("Not authenticated");
      const response = await apiRequest("POST", "/api/comments", {
        contentType,
        contentId,
        comment,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customer/me'] });
      toast({ title: translate(t.success) });
      setNewComment("");
    },
    onError: () => {
      toast({ title: translate(t.error), variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    if (newComment.trim().length < 10) {
      toast({ title: translate(t.minLength), variant: "destructive" });
      return;
    }
    submitMutation.mutate(newComment.trim());
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

  const getStars = (totalComments: number | null) => {
    if (!totalComments) return 0;
    return Math.min(5, Math.floor(totalComments / 100));
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
        {currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10 border border-primary/30">
                <AvatarImage src={currentUser.avatar || undefined} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {currentUser.totalComments} {getCommentLabel(currentUser.totalComments)}
                  </span>
                  {getStars(currentUser.totalComments) > 0 && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: getStars(currentUser.totalComments) }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  )}
                </div>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={translate(t.placeholder)}
                  rows={3}
                  data-testid="input-comment-text"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || submitMutation.isPending}
                data-testid="button-submit-comment"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitMutation.isPending ? translate(t.sending) : translate(t.submit)}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-4">{translate(t.loginRequired)}</p>
            <Link href="/auth">
              <Button data-testid="button-login-to-comment">
                <LogIn className="h-4 w-4 mr-2" />
                {translate(t.login)}
              </Button>
            </Link>
          </div>
        )}

        <div className="border-t pt-6 space-y-4">
          {approvedComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6" data-testid="text-no-comments">
              {translate(t.noComments)}
            </p>
          ) : (
            approvedComments.map((comment) => {
              const stars = getStars(comment.userTotalComments);
              return (
                <div key={comment.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg" data-testid={`comment-${comment.id}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.userAvatar || undefined} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="font-medium">{comment.userName || comment.userId}</span>
                      {comment.userTotalComments !== null && (
                        <span className="text-xs text-muted-foreground">
                          {comment.userTotalComments} {getCommentLabel(comment.userTotalComments)}
                        </span>
                      )}
                      {stars > 0 && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-muted-foreground">{comment.comment}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
