import { useMemo, useState } from "react";
import { FileText, Code2, Sigma, Table2, Palette, Sparkles, Languages, Loader2, RotateCcw } from "lucide-react";
import { ImageDropzone } from "@/components/ImageDropzone";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AnalysisResult {
  description: string;
  ocrText: string;
  isCode: boolean;
  codeLanguage: string | null;
  latex: string;
  tableMarkdown: string;
  tableJson: any[];
  colors: { hex: string; name: string }[];
}

const LANGUAGES = [
  { value: "Arabic", label: "العربية" },
  { value: "English", label: "English" },
  { value: "French", label: "Français" },
  { value: "Spanish", label: "Español" },
  { value: "German", label: "Deutsch" },
  { value: "Chinese", label: "中文" },
  { value: "Japanese", label: "日本語" },
  { value: "Turkish", label: "Türkçe" },
];

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const Index = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [translation, setTranslation] = useState<string>("");
  const [translating, setTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState("Arabic");

  const handleFile = async (file: File) => {
    setResult(null);
    setTranslation("");
    setImageUrl(URL.createObjectURL(file));
    setLoading(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64: base64, mimeType },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as AnalysisResult);
      toast.success("تم التحليل بنجاح");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "تعذر تحليل الصورة");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!result?.ocrText) return;
    setTranslating(true);
    setTranslation("");
    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { targetLanguage: { translateText: true, text: result.ocrText, language: targetLang } },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTranslation(data.translation || "");
    } catch (e: any) {
      toast.error(e.message || "تعذر الترجمة");
    } finally {
      setTranslating(false);
    }
  };

  const reset = () => {
    setImageUrl(null);
    setResult(null);
    setTranslation("");
  };

  const hasTable = useMemo(() => result && (result.tableMarkdown || (result.tableJson && result.tableJson.length > 0)), [result]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/40 sticky top-0 z-30">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SnipAI</h1>
              <p className="text-xs text-muted-foreground leading-tight">تحليل ذكي للصور</p>
            </div>
          </div>
          {imageUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              صورة جديدة
            </Button>
          )}
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {!imageUrl && (
          <section className="text-center mb-10 space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              مدعوم بالذكاء الاصطناعي
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              حوّل أي صورة إلى <span className="gradient-text">بيانات منظمة</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              ارفع لقطة شاشة أو صورة لاستخراج النصوص والأكواد والمعادلات الرياضية والجداول والألوان السائدة فوراً.
            </p>
          </section>
        )}

        <ImageDropzone onFile={handleFile} loading={loading} />

        {imageUrl && (
          <section className="mt-8 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-6">
            {/* Preview */}
            <div className="lg:sticky lg:top-24 self-start">
              <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border bg-secondary/40">
                  <h3 className="font-semibold text-sm">الصورة الأصلية</h3>
                </div>
                <div className="p-3">
                  <img src={imageUrl} alt="المرفوعة" className="w-full rounded-lg" />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-5">
              {loading && !result && (
                <div className="rounded-2xl bg-card border border-border p-10 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">يحلل الذكاء الاصطناعي صورتك...</p>
                </div>
              )}

              {result?.description && (
                <ResultCard title="الوصف التحليلي" icon={<Sparkles className="h-4 w-4" />} copyText={result.description}>
                  <p className="text-sm leading-relaxed text-foreground/90">{result.description}</p>
                </ResultCard>
              )}

              {result?.ocrText && (
                <ResultCard
                  title={result.isCode ? `كود ${result.codeLanguage || ""}`.trim() : "النص المستخرج"}
                  icon={result.isCode ? <Code2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  copyText={result.ocrText}
                  downloadFilename={result.isCode ? `snippet.${result.codeLanguage || "txt"}` : "extracted.txt"}
                >
                  <pre
                    dir="ltr"
                    className="text-xs sm:text-sm font-mono bg-secondary/60 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words text-foreground/90 max-h-96"
                  >
                    {result.ocrText}
                  </pre>

                  {/* Translate */}
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={targetLang} onValueChange={setTargetLang}>
                        <SelectTrigger className="w-40 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((l) => (
                            <SelectItem key={l.value} value={l.value}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleTranslate} disabled={translating} size="sm" className="gap-2">
                        {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                        ترجمة النص
                      </Button>
                    </div>
                    {translation && (
                      <div className="rounded-lg bg-secondary/60 p-4 text-sm whitespace-pre-wrap leading-relaxed animate-fade-in">
                        {translation}
                      </div>
                    )}
                  </div>
                </ResultCard>
              )}

              {result?.latex && (
                <ResultCard
                  title="صيغة LaTeX"
                  icon={<Sigma className="h-4 w-4" />}
                  copyText={result.latex}
                  downloadFilename="formula.tex"
                >
                  <pre
                    dir="ltr"
                    className="text-sm font-mono bg-secondary/60 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words"
                  >
                    {result.latex}
                  </pre>
                </ResultCard>
              )}

              {hasTable && (
                <ResultCard
                  title="جدول"
                  icon={<Table2 className="h-4 w-4" />}
                  copyText={result!.tableMarkdown || JSON.stringify(result!.tableJson, null, 2)}
                  downloadFilename="table.md"
                  downloadMime="text/markdown"
                >
                  {result!.tableMarkdown && (
                    <pre
                      dir="ltr"
                      className="text-xs font-mono bg-secondary/60 rounded-lg p-4 overflow-x-auto whitespace-pre"
                    >
                      {result!.tableMarkdown}
                    </pre>
                  )}
                  {result!.tableJson?.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        عرض كـ JSON
                      </summary>
                      <pre
                        dir="ltr"
                        className="mt-2 text-xs font-mono bg-secondary/60 rounded-lg p-4 overflow-x-auto"
                      >
                        {JSON.stringify(result!.tableJson, null, 2)}
                      </pre>
                    </details>
                  )}
                </ResultCard>
              )}

              {result?.colors && result.colors.length > 0 && (
                <ResultCard
                  title="الألوان السائدة"
                  icon={<Palette className="h-4 w-4" />}
                  copyText={result.colors.map((c) => c.hex).join("\n")}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {result.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          navigator.clipboard.writeText(c.hex);
                          toast.success(`نُسخ ${c.hex}`);
                        }}
                        className="group flex items-center gap-3 p-2.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border hover:border-primary/50 transition-all text-right"
                      >
                        <div
                          className="h-12 w-12 rounded-lg shrink-0 shadow-card border border-border"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-mono font-semibold" dir="ltr">
                            {c.hex.toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{c.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ResultCard>
              )}

              {result && !result.ocrText && !result.latex && !hasTable && !result.description && (
                <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
                  لم يتم العثور على محتوى قابل للاستخراج في هذه الصورة.
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <footer className="border-t border-border/50 mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          صُنع بـ ♥ باستخدام Lovable AI — الصور لا تُخزَّن.
        </div>
      </footer>
    </main>
  );
};

export default Index;
