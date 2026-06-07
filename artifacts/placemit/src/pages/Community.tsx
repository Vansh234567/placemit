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
import {
  MessageSquare,
  ArrowBigUp,
  Plus,
  Clock,
  Search,
  TrendingUp,
} from "lucide-react";
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

  const params: Record<string, string> = { sort };
  if (search.trim()) params.search = search.trim();

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
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data ?? [];
    },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUpvote = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
  };
        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          if (!profile?.id) {
            toast({ title: "Please login first" });
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
            return;
          }
        };

        setTitle("");
        setContent("");
        setOpen(false);

        queryClient.invalidateQueries({
          queryKey: ["questions"],
        });
      };
    if ((profile?.batch_year ?? 9999) > 2026) {
      toast({
        title: "Only 2026 and earlier batches can share experiences",
      });
      return;
    }

    if (!title.trim() || !content.trim()) return;

    const { data, error } = await supabase
      .from("questions")
      .insert({
        author_id: profile.id,
        title: title,
        content: content,
        tags: [],
        is_anon: false,
        votes: 0,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    console.log("Post created:", data);

    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ask questions, share tips, help each other.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
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
                  className="min-h-[140px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit">Submit Post</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex border rounded-md overflow-hidden shrink-0">
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
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : posts?.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg space-y-2">
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
              <Card className="hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Upvote */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleUpvote(e, post.id)}
                        className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <ArrowBigUp className="w-5 h-5" />
                      </button>
                      <span className="text-xs font-semibold tabular-nums">
                        {post.votes ?? 0}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-semibold text-sm leading-snug line-clamp-2">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                        <div className="flex items-center gap-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-[9px]">
                              U
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            Anonymous User
                            {post.profiles?.batch_year
                              ? ` • Batch ${post.profiles.batch_year}`
                              : ""}
                          </span>
                        </div>
                        <span>&bull;</span>
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />0
                        </span>
                      </div>
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
