import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const { profile } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["question", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(
          `
          *,
          profiles!questions_author_id_fkey (
            batch_year,
            name
          )
        `,
        )
        .eq("id", postId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["answers", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .eq("question_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!postId,
  });

  const handleComment = async () => {
    if (!profile?.id) return;
    if (!commentContent.trim()) return;

    const { error } = await supabase.from("answers").insert({
      question_id: postId,
      author_id: profile.id,
      content: commentContent,
    });

    if (error) {
      console.error(error);
      toast({ title: "Failed to post answer" });
      return;
    }

    setCommentContent("");
    await queryClient.invalidateQueries({ queryKey: ["answers", postId] });
    toast({ title: "Answer posted" });
  };

  if (postLoading) {
    return (
      <div className="space-y-4 w-full">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Post not found</div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back link */}
      <Link
        href="/community"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Community
      </Link>

      {/* Post card */}
      <Card className="w-full overflow-hidden">
        <CardContent className="p-4 sm:p-6 md:p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-[10px]">U</AvatarFallback>
              </Avatar>
              <span className="font-medium">
                Anonymous User
                {post.profiles?.batch_year
                  ? ` • Batch ${post.profiles.batch_year}`
                  : ""}
              </span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight break-words mb-3">
            {post.title}
          </h1>

          {/* Content */}
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </CardContent>
      </Card>

      {/* Answers section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          {comments?.length ?? 0}{" "}
          {(comments?.length ?? 0) === 1 ? "Answer" : "Answers"}
        </h3>

        {/* Answer input */}
        <Card className="bg-muted/20 border-border/50 shadow-none w-full overflow-hidden">
          <CardContent className="p-3 sm:p-4 space-y-3">
            <Textarea
              placeholder="Write an answer..."
              className="min-h-[80px] sm:min-h-[90px] resize-y bg-background w-full"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleComment}
                disabled={!commentContent.trim()}
                className="w-full sm:w-auto"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Post Answer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answer list */}
        <div className="space-y-3">
          {commentsLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : comments?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No answers yet. Be the first.
            </p>
          ) : (
            comments?.map((comment) => (
              <div
                key={comment.id}
                className="p-3 sm:p-4 rounded-lg bg-card border border-border/50 w-full overflow-hidden"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-[9px] bg-muted">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold">MIT Student</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
