import { useListPosts, useUpvotePost, getListPostsQueryKey, useCreatePost } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ArrowBigUp, Plus, Clock } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.enum(["general", "interview-prep", "resume-help", "offers", "advice"])
});

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "interview-prep", label: "Interview Prep" },
  { value: "resume-help", label: "Resume Help" },
  { value: "offers", label: "Offers & Negotiation" },
  { value: "advice", label: "Advice" },
];

export default function Community() {
  const { profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  
  const { data: posts, isLoading } = useListPosts(activeCategory ? { category: activeCategory as any } : undefined, {
    query: { queryKey: getListPostsQueryKey(activeCategory ? { category: activeCategory as any } : undefined) }
  });
  
  const upvotePost = useUpvotePost();
  const createPost = useCreatePost();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general"
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPost.mutate({
      data: {
        ...values,
        authorName: profile?.name ?? "Anonymous",
      }
    }, {
      onSuccess: () => {
        toast({ title: "Post created successfully" });
        setOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
      }
    });
  };

  const handleUpvote = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // prevent navigation
    upvotePost.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-muted-foreground mt-2">Discuss interviews, get resume help, and share advice.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="What's on your mind?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your thoughts, ask a question..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createPost.isPending}>
                    {createPost.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        <Button 
          variant={!activeCategory ? "default" : "outline"} 
          onClick={() => setActiveCategory(undefined)}
          className="shrink-0 rounded-full"
        >
          All Topics
        </Button>
        {CATEGORIES.map(c => (
          <Button 
            key={c.value}
            variant={activeCategory === c.value ? "default" : "outline"} 
            onClick={() => setActiveCategory(c.value)}
            className="shrink-0 rounded-full"
          >
            {c.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : posts?.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground">No posts yet</p>
              <p className="text-sm">Be the first to start a conversation in this category.</p>
            </CardContent>
          </Card>
        ) : (
          posts?.map((post) => (
            <Link key={post.id} href={`/community/${post.id}`} className="block">
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:hidden mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.authorAvatarUrl || ''} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {post.authorName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{post.authorName}</span>
                      <span className="text-xs text-muted-foreground mx-1">&bull;</span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="hidden sm:flex flex-col items-center justify-start gap-1 p-2 bg-muted/30 rounded-lg min-w-[64px]">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={(e) => handleUpvote(e, post.id)}
                      >
                        <ArrowBigUp className="w-6 h-6" />
                      </Button>
                      <span className="text-sm font-bold text-foreground">{post.upvotes}</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-lg font-semibold leading-tight">{post.title}</h2>
                        <Badge variant="secondary" className="shrink-0 hidden sm:inline-flex capitalize">
                          {post.category.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="hidden sm:flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={post.authorAvatarUrl || ''} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {post.authorName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{post.authorName}</span>
                          <span className="text-xs text-muted-foreground mx-1">&bull;</span>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground sm:w-auto w-full sm:justify-end">
                          <div className="flex sm:hidden items-center gap-1.5">
                            <ArrowBigUp className="w-4 h-4 text-primary" />
                            <span className="text-foreground">{post.upvotes}</span>
                          </div>
                          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                            <MessageSquare className="w-4 h-4" />
                            {post.commentsCount} comments
                          </div>
                          <Badge variant="secondary" className="shrink-0 sm:hidden capitalize">
                            {post.category.replace('-', ' ')}
                          </Badge>
                        </div>
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