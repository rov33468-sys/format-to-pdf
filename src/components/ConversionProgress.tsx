import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ConversionProgressProps {
  progress: number;
  isComplete: boolean;
  fileName?: string;
}

export const ConversionProgress = ({
  progress,
  isComplete,
  fileName,
}: ConversionProgressProps) => {
  return (
    <Card className="p-6 animate-scale-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-primary animate-scale-in" />
            ) : (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            )}
            <div>
              <h4 className="font-semibold text-foreground">
                {isComplete ? "Conversion Complete!" : "Converting to PDF..."}
              </h4>
              {fileName && (
                <p className="text-sm text-muted-foreground">{fileName}</p>
              )}
            </div>
          </div>
          <span className="text-lg font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </Card>
  );
};
