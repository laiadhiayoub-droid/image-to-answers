import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  copyText?: string;
  downloadFilename?: string;
  downloadMime?: string;
  className?: string;
}

export function ResultCard({ title, icon, children, copyText, downloadFilename, downloadMime, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyText) return;
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    toast.success("تم النسخ");
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!copyText || !downloadFilename) return;
    const blob = new Blob([copyText], { type: downloadMime || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-card border border-border shadow-card overflow-hidden animate-fade-in",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary/20 flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
          <h3 className="font-semibold truncate">{title}</h3>
        </div>
        {copyText && (
          <div className="flex items-center gap-1 shrink-0">
            {downloadFilename && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="تحميل">
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="نسخ">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
