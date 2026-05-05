import { useCallback, useRef, useState } from "react";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFile: (file: File) => void;
  loading?: boolean;
}

export function ImageDropzone({ onFile, loading }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files[0]) return;
      const file = files[0];
      if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
      if (item) {
        const file = item.getAsFile();
        if (file) onFile(file);
      }
    },
    [onFile]
  );

  return (
    <div
      onPaste={handlePaste}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative cursor-pointer rounded-3xl border-2 border-dashed border-border bg-card/50 backdrop-blur-sm transition-all",
        "hover:border-primary/60 hover:bg-card/80 hover:shadow-glow",
        "p-10 sm:p-16 text-center group",
        dragOver && "border-primary bg-primary/5 shadow-glow scale-[1.01]",
        loading && "pointer-events-none opacity-70"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-40 group-hover:opacity-60 transition-opacity rounded-full" />
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant">
            {loading ? (
              <Loader2 className="h-9 w-9 text-primary-foreground animate-spin" />
            ) : (
              <Upload className="h-9 w-9 text-primary-foreground" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">
            {loading ? "جاري تحليل الصورة..." : "اسحب صورة هنا أو انقر للرفع"}
          </h3>
          <p className="text-muted-foreground text-sm">
            يدعم PNG، JPEG، WebP — أو الصق لقطة شاشة مباشرة (Ctrl/Cmd + V)
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-secondary border border-border flex items-center gap-1.5">
            <ImageIcon className="h-3 w-3" /> لقطات الشاشة
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary border border-border">أكواد برمجية</span>
          <span className="px-3 py-1 rounded-full bg-secondary border border-border">معادلات رياضية</span>
          <span className="px-3 py-1 rounded-full bg-secondary border border-border">جداول</span>
        </div>
      </div>
    </div>
  );
}
