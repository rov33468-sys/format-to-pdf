import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileText, ArrowLeft, Download, Calendar, FileImage, Settings, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Conversion {
  id: string;
  original_filename: string;
  original_format: string;
  file_size: number;
  created_at: string;
}

interface UserPreferences {
  id: string;
  default_page_size: string;
  pdf_quality: string;
  auto_download: boolean;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoadingConversions, setIsLoadingConversions] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversions();
      fetchPreferences();
    }
  }, [user]);

  const fetchConversions = async () => {
    try {
      const { data, error } = await supabase
        .from("conversions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConversions(data || []);
    } catch (error) {
      console.error("Error fetching conversions:", error);
      toast({
        title: "Error",
        description: "Failed to load conversion history.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingConversions(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!preferences) return;
    
    setIsSavingPreferences(true);
    try {
      const { error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("id", preferences.id);

      if (error) throw error;
      
      setPreferences({ ...preferences, ...updates });
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PDFify
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Converter
          </Link>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            View your conversion history and manage preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Conversion History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Conversion History
                </CardTitle>
                <CardDescription>
                  Your recent PDF conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingConversions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : conversions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileImage className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversions yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your conversion history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversions.map((conversion) => (
                      <div
                        key={conversion.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {conversion.original_filename}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {conversion.original_format.toUpperCase()} • {formatFileSize(conversion.file_size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(conversion.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Preferences */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your conversion settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingPreferences ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : preferences ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="pageSize">Default Page Size</Label>
                      <Select
                        value={preferences.default_page_size || "a4"}
                        onValueChange={(value) => updatePreferences({ default_page_size: value })}
                        disabled={isSavingPreferences}
                      >
                        <SelectTrigger id="pageSize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quality">PDF Quality</Label>
                      <Select
                        value={preferences.pdf_quality || "high"}
                        onValueChange={(value) => updatePreferences({ pdf_quality: value })}
                        disabled={isSavingPreferences}
                      >
                        <SelectTrigger id="quality">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (smaller file)</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High (best quality)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoDownload">Auto-download</Label>
                        <p className="text-sm text-muted-foreground">
                          Download PDF automatically after conversion
                        </p>
                      </div>
                      <Switch
                        id="autoDownload"
                        checked={preferences.auto_download ?? true}
                        onCheckedChange={(checked) => updatePreferences({ auto_download: checked })}
                        disabled={isSavingPreferences}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No preferences found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
