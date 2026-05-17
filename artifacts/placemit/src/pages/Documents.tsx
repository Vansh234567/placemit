import { useListDocuments, useDeleteDocument, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, File, Download, Trash2, FileBadge, FileCheck, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Documents() {
  const { data: documents, isLoading } = useListDocuments();
  const deleteDoc = useDeleteDocument();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'resume': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'offer-letter': return <FileCheck className="w-8 h-8 text-green-500" />;
      case 'certificate': return <FileBadge className="w-8 h-8 text-purple-500" />;
      default: return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleDelete = (id: number) => {
    deleteDoc.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Document deleted" });
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="text-muted-foreground mt-2">Manage your resumes, certificates, and offer letters securely.</p>
        </div>
        <Button size="lg" className="shrink-0">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 w-full" />)
        ) : documents?.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed rounded-xl">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No documents yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Upload your resume to easily apply to jobs with one click.</p>
            </div>
          </div>
        ) : (
          documents?.map((doc) => (
            <Card key={doc.id} className="relative group overflow-hidden hover-elevate transition-all duration-200">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8 rounded-full shadow-sm"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleteDoc.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                  {getIcon(doc.type)}
                </div>
                <div className="space-y-1 w-full">
                  <h3 className="font-semibold text-sm truncate px-2" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {doc.sizeKb ? `${doc.sizeKb} KB • ` : ''} 
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wider mt-2 text-primary/70">
                    {doc.type.replace('-', ' ')}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}