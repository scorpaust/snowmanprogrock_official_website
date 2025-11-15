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
      toast({ title: "Comment approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve comment", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/comments/${id}`, { isApproved: 0 });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({ title: "Comment rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject comment", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/comments/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({ title: "Comment deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete comment", variant: "destructive" });
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this comment permanently?")) {
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
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Comments Moderation</h1>
            <p className="text-muted-foreground">Review and approve user comments</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Badge variant="secondary">
              Total: {comments.length}
            </Badge>
            <Badge variant="default">
              Pending: {comments.filter(c => c.isApproved === 0).length}
            </Badge>
            <Badge variant="outline">
              Approved: {comments.filter(c => c.isApproved === 1).length}
            </Badge>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending ({comments.filter(c => c.isApproved === 0).length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">
              Approved ({comments.filter(c => c.isApproved === 1).length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              All ({comments.length})
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
                          {comment.contentType === 'news' ? 'Comment on News' : 'Comment on Product'}
                        </span>
                        {comment.isApproved === 1 ? (
                          <Badge variant="default" className="text-xs">Approved</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Pending</Badge>
                        )}
                      </div>
                      <p className="text-base">{comment.comment}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>User ID: {comment.userId.substring(0, 8)}...</span>
                        <span>Content ID: {comment.contentId.substring(0, 8)}...</span>
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
                          Approve
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
                          Unapprove
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
                        Delete
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
                    {filter === 'pending' && "No pending comments to review."}
                    {filter === 'approved' && "No approved comments yet."}
                    {filter === 'all' && "No comments yet."}
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
