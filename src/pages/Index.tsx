import { useState } from "react";
import { Link } from "react-router-dom";
import { FileUploader } from "@/components/FileUploader";
import { ConversionProgress } from "@/components/ConversionProgress";
import { Button } from "@/components/ui/button";
import { Download, FileText, Zap, Shield, Globe, LogIn, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { convertFileToPDF } from "@/lib/pdfConverter";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [convertedPDF, setConvertedPDF] = useState<Blob | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setConvertedPDF(null);
    setConversionProgress(0);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    setConversionProgress(0);
    setCurrentFileName(files[0].name);

    try {
      const progressInterval = setInterval(() => {
        setConversionProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const pdfBlob = await convertFileToPDF(files[0]);
      
      clearInterval(progressInterval);
      setConversionProgress(100);
      setConvertedPDF(pdfBlob);

      // Save conversion to database if user is logged in
      if (user) {
        const file = files[0];
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
        
        await supabase.from("conversions").insert({
          user_id: user.id,
          original_filename: file.name,
          original_format: fileExtension,
          file_size: file.size,
        });
      }

      toast({
        title: "Conversion successful!",
        description: "Your PDF is ready to download.",
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your file. Please try again.",
        variant: "destructive",
      });
      setConversionProgress(0);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedPDF) return;

    const url = URL.createObjectURL(convertedPDF);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentFileName.replace(/\.[^/.]+$/, "")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your PDF is being downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PDFify
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-primary font-semibold text-sm">Free Online PDF Converter</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Convert Any Document to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">PDF</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your images, documents, and files into professional PDF format in seconds. 
            No registration required, completely free.
          </p>

          <div className="pt-8">
            <FileUploader onFilesSelected={handleFilesSelected} />
          </div>

          {files.length > 0 && !isConverting && conversionProgress === 0 && (
            <div className="animate-slide-up">
              <Button
                size="lg"
                onClick={handleConvert}
                className="text-lg px-8 py-6 shadow-medium hover:shadow-large transition-all"
              >
                <Zap className="w-5 h-5 mr-2" />
                Convert to PDF
              </Button>
            </div>
          )}

          {(isConverting || conversionProgress > 0) && (
            <div className="animate-fade-in">
              <ConversionProgress
                progress={conversionProgress}
                isComplete={conversionProgress === 100}
                fileName={currentFileName}
              />
            </div>
          )}

          {convertedPDF && (
            <div className="animate-scale-in">
              <Button
                size="lg"
                onClick={handleDownload}
                className="text-lg px-8 py-6 shadow-medium hover:shadow-large transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h3 className="text-4xl font-bold text-foreground">Why Choose PDFify?</h3>
            <p className="text-xl text-muted-foreground">
              Fast, secure, and reliable document conversion
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-card rounded-2xl border border-border shadow-soft hover:shadow-medium transition-all animate-slide-up">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-3">Lightning Fast</h4>
              <p className="text-muted-foreground">
                Convert your documents in seconds with our optimized conversion engine. No waiting, no hassle.
              </p>
            </div>

            <div className="p-8 bg-card rounded-2xl border border-border shadow-soft hover:shadow-medium transition-all animate-slide-up [animation-delay:100ms]">
              <div className="p-3 bg-secondary/10 rounded-xl w-fit mb-4">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-3">100% Secure</h4>
              <p className="text-muted-foreground">
                Your files are processed securely and never stored on our servers. Complete privacy guaranteed.
              </p>
            </div>

            <div className="p-8 bg-card rounded-2xl border border-border shadow-soft hover:shadow-medium transition-all animate-slide-up [animation-delay:200ms]">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-3">Works Everywhere</h4>
              <p className="text-muted-foreground">
                Access from any device, any browser. No software installation required. Just upload and convert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">PDFify</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 PDFify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
