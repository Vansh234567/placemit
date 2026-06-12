import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Plus, Clock, Search, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Community() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "top">("newest");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(
          `
          *,
          profiles!questions_author_id_fkey (
            batch_year,
            name
          ),
          answers (
            id
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) {
      toast({ title: "Please login first" });
      return;
    }

    if (!title.trim() || !content.trim()) {
      return;
    }

    const { data, error } = await supabase
      .from("questions")
      .insert({
        author_id: profile.id,
        title,
        content,
        tags: [],
        is_anon: false,
        votes: 0,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      toast({ title: "Failed to create post" });
      return;
    }

    console.log("Post created:", data);
    setTitle("");
    setContent("");
    setOpen(false);

    await queryClient.invalidateQueries({ queryKey: ["questions"] });
    toast({ title: "Post created" });
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Community
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ask questions, share tips, help each other.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto gap-1.5">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg rounded-xl">
            <DialogHeader>
              <DialogTitle>New Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  placeholder="What's your question or topic?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  placeholder="Share more detail..."
                  className="min-h-[120px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" className="w-full sm:w-auto">
                  Submit Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 w-full"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex border rounded-md overflow-hidden shrink-0 self-start">
          <button
            type="button"
            onClick={() => setSort("newest")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
              sort === "newest"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Newest
          </button>
          <button
            type="button"
            onClick={() => setSort("top")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border-l transition-colors ${
              sort === "top"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Top
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {postsLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : posts?.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg space-y-2 px-4">
            <p className="text-base font-medium text-foreground">
              {search ? `No posts matching "${search}"` : "No posts yet."}
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try a different keyword."
                : "Be the first to start a conversation."}
            </p>
          </div>
        ) : (
          posts?.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="block"
            >
              <Card className="hover:border-primary/40 transition-colors w-full overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="min-w-0 space-y-1.5">
                    <p className="font-semibold text-sm leading-snug line-clamp-2 break-words">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-[9px]">
                            U
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[120px]">
                          Anonymous User
                          {post.profiles?.batch_year
                            ? ` • ${post.profiles.batch_year}`
                            : ""}
                        </span>
                      </div>
                      <span className="hidden sm:inline">&bull;</span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <MessageSquare className="w-3 h-3" />
                        {post.answers?.length ?? 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
