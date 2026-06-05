import {
  useGetPost,
  useListComments,
  useCreateComment,
  useUpvotePost,
  useUpvoteComment,
  getGetPostQueryKey,
  getListCommentsQueryKey,
  getListPostsQueryKey,
} from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowBigUp, Clock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const { profile } = useAuth();
  const [commentContent, setCommentContent] = useState("");

  const { data: post, isLoading: postLoading } = useGetPost(postId, {
    query: { enabled: !!id, queryKey: getGetPostQueryKey(postId) },
  });

  const { data: comments, isLoading: commentsLoading } = useListComments(postId, {
    query: { enabled: !!id, queryKey: getListCommentsQueryKey(postId) },
  });

  const createComment = useCreateComment();
  const upvotePost = useUpvotePost();
  const upvoteComment = useUpvoteComment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleComment = () => {
    if (!commentContent.trim()) return;
    createComment.mutate(
      {
        postId,
        data: { content: commentContent, authorName: profile?.name ?? "Anonymous" },
      },
      {
        onSuccess: () => {
          setCommentContent("");
          toast({ title: "Comment posted" });
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
          queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        },
      },
    );
  };

  const handleUpvotePost = () => {
    upvotePost.mutate({ id: postId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
      },
    });
  };

  const handleUpvoteComment = (commentId: number) => {
    upvoteComment.mutate({ postId, commentId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
      },
    });
  };

  if (postLoading) {
    return <div className="space-y-6 max-w-4xl mx-auto"><Skeleton className="h-64 w-full" /></div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/community" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Community
      </Link>

      {/* Post */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Upvote column */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleUpvotePost}
                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <ArrowBigUp className="w-6 h-6" />
              </button>
              <span className="text-sm font-bold tabular-nums">{post.upvotes}</span>
            </div>

            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[10px]">{post.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{post.authorName}</span>
                  </div>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
              </div>
              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-5">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          {post.commentsCount} {post.commentsCount === 1 ? "Answer" : "Answers"}
        </h3>

        {/* Add comment */}
        <Card className="bg-muted/20 border-border/50 shadow-none">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder="Write an answer..."
              className="min-h-[90px] resize-y bg-background"
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleComment}
                disabled={createComment.isPending || !commentContent.trim()}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {createComment.isPending ? "Posting..." : "Post Answer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comment list */}
        <div className="space-y-3">
          {commentsLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)
          ) : comments?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No answers yet. Be the first.</p>
          ) : (
            comments?.map(comment => (
              <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-card border border-border/50">
                {/* Comment upvote */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleUpvoteComment(comment.id)}
                    className="p-0.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <ArrowBigUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold tabular-nums">{comment.upvotes}</span>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={comment.authorAvatarUrl ?? ""} />
                        <AvatarFallback className="text-[9px] bg-muted">{comment.authorName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold">{comment.authorName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
