import { Upload } from "lucide-react";
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (content: string) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.txt')) {
        toast({
          title: "Invalid File",
          description: "Please upload a .txt file from MT4/FTMO",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileUpload(content);
        toast({
          title: "File Uploaded",
          description: "Trade report parsed successfully!",
        });
      };
      reader.readAsText(file);
    },
    [onFileUpload, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm"
    >
      <input
        type="file"
        accept=".txt"
        onChange={handleChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-medium text-foreground">Upload Trade Report</p>
          <p className="text-sm text-muted-foreground mt-1">
            Drop your MT4/FTMO .txt file here or click to browse
          </p>
        </div>
      </label>
    </div>
  );
}
