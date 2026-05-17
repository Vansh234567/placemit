import { useGetPost, useListComments, useCreateComment, useUpvotePost, getGetPostQueryKey, getListCommentsQueryKey, getListPostsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowBigUp, Clock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const [commentContent, setCommentContent] = useState("");
  
  const { data: post, isLoading: postLoading } = useGetPost(postId, { 
    query: { enabled: !!id, queryKey: getGetPostQueryKey(postId) } 
  });
  
  const { data: comments, isLoading: commentsLoading } = useListComments(postId, {
    query: { enabled: !!id, queryKey: getListCommentsQueryKey(postId) }
  });

  const createComment = useCreateComment();
  const upvotePost = useUpvotePost();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleComment = () => {
    if (!commentContent.trim()) return;
    
    createComment.mutate({
      postId,
      data: {
        content: commentContent,
        authorName: "Student User" // Mock
      }
    }, {
      onSuccess: () => {
        setCommentContent("");
        toast({ title: "Comment posted" });
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
      }
    });
  };

  const handleUpvote = () => {
    upvotePost.mutate({ id: postId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
      }
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
        Back to Forum
      </Link>

      <Card className="border-border">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-muted-foreground/20 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5"
                onClick={handleUpvote}
              >
                <ArrowBigUp className="w-7 h-7" />
              </Button>
              <span className="font-bold text-lg">{post.upvotes}</span>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="capitalize">{post.category.replace('-', ' ')}</Badge>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[10px]">{post.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{post.authorName}</span>
                  </div>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{post.title}</h1>
              </div>
              
              <div className="prose dark:prose-invert max-w-none text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {post.content}
              </div>
              
              <div className="sm:hidden flex items-center gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full"
                  onClick={handleUpvote}
                >
                  <ArrowBigUp className="w-5 h-5 mr-1.5" />
                  <span className="font-bold">{post.upvotes}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          {post.commentsCount} Comments
        </h3>
        
        <Card className="bg-muted/20 border-border/50 shadow-none">
          <CardContent className="p-4 flex gap-4">
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">S</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea 
                placeholder="Add a comment..." 
                className="min-h-[100px] resize-y bg-background"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleComment} disabled={createComment.isPending || !commentContent.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {createComment.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {commentsLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : comments?.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-lg bg-card border border-border/50">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={comment.authorAvatarUrl || ''} />
                <AvatarFallback className="bg-muted font-medium">{comment.authorName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}