import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X } from "lucide-react";

export function FileUpload() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.includes('text') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a text file (.txt, .md, or other text formats)",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/upload/', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      toast({
        title: "File Uploaded Successfully",
        description: result.status || "Your writing sample has been processed"
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Upload Your Writing Sample</label>
        <p className="text-sm text-muted-foreground">
          Upload a text file of your writing to help AI learn your style
        </p>
      </div>

      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer hover:shadow-soft ${
            isDragOver 
              ? 'border-primary bg-primary/5 shadow-glow' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              isDragOver ? 'bg-primary/20' : 'bg-muted/50'
            }`}>
              <Upload className={`w-8 h-8 ${
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            
            <div>
              <p className="text-lg font-medium mb-2">
                {isDragOver ? 'Drop your file here' : 'Upload writing sample'}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to select • .txt, .md files supported
              </p>
            </div>

            <Button 
              variant="outline" 
              className="rounded-xl border-primary/20 hover:bg-primary/10"
              type="button"
            >
              Choose File
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </Card>
      ) : (
        <Card className="p-4 rounded-2xl bg-gradient-glow border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                  {isUploading && " • Uploading..."}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              disabled={isUploading}
              className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}