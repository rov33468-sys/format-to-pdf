import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUploader = ({ onFilesSelected }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    []
  );

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|webp|txt|doc|docx)$/i)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not supported yet.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      onFilesSelected(validFiles);
      toast({
        title: "Files added",
        description: `${validFiles.length} file(s) ready to convert.`,
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? "border-primary bg-primary/5 scale-105"
            : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center p-12 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 bg-gradient-primary rounded-2xl shadow-medium animate-scale-in">
              <Upload className="w-12 h-12 text-primary-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Drop your files here
              </h3>
              <p className="text-muted-foreground">
                or click to browse from your device
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: JPG, PNG, GIF, WEBP, TXT, DOC, DOCX (max 10MB)
              </p>
            </div>
          </div>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
            accept=".jpg,.jpeg,.png,.gif,.webp,.txt,.doc,.docx"
          />
        </label>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          <h4 className="text-lg font-semibold text-foreground">
            Selected Files ({selectedFiles.length})
          </h4>
          {selectedFiles.map((file, index) => (
            <Card key={index} className="p-4 flex items-center justify-between hover:shadow-soft transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
