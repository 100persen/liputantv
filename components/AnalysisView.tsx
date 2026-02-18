import React, { useState, useEffect, useRef } from "react";
import { AnalysisResult } from "../types";
import { CheckSquare, Camera, Edit3, Tv, AlertCircle, Mic, List, Info, Copy, Check, RefreshCw } from "lucide-react";

interface AnalysisViewProps {
  result: AnalysisResult | null;
  onUpdateInterviewSummary?: (index: number, summary: string) => void;
  onRegenerateScript?: () => void;
  isRegeneratingScript?: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  result, 
  onUpdateInterviewSummary, 
  onRegenerateScript,
  isRegeneratingScript 
}) => {
  const [activeTab, setActiveTab] = useState<"analysis" | "shotlist" | "guide" | "script">("analysis");
  const [copied, setCopied] = useState(false);
  const prevIsRegeneratingRef = useRef(isRegeneratingScript);

  // Auto-switch to script tab when regeneration finishes
  useEffect(() => {
    if (prevIsRegeneratingRef.current && !isRegeneratingScript) {
        setActiveTab("script");
    }
    prevIsRegeneratingRef.current = isRegeneratingScript;
  }, [isRegeneratingScript]);

  const handleCopy = () => {
    if (result?.tvScript.fullText) {
      navigator.clipboard.writeText(result.tvScript.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
        <Tv className="w-16 h-16 mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-500">Ruang Redaksi Mas Tikon</h3>
        <p className="max-w-xs mt-2 text-sm">Silakan isi formulir di sebelah kiri dan kirim untuk mendapatkan arahan editorial.</p>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        activeTab === id
          ? "border-news-accent text-news-accent"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const hasSummaries = result.shotList.interviews.some(i => i.answerSummary && i.answerSummary.trim().length > 0);

  return (
    <div className="bg-white shadow-sm rounded-lg border border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="flex border-b border-slate-100 overflow-x-auto">
        <TabButton id="analysis" label="Analisis Angle" icon={AlertCircle} />
        <TabButton id="guide" label="Panduan Lapangan" icon={List} />
        <TabButton id="shotlist" label="Shot List & SOT" icon={Camera} />
        <TabButton id="script" label="Naskah TV" icon={Edit3} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        
        {/* ANALYSIS TAB */}
        {activeTab === "analysis" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r shadow-sm">
                <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5"/> Catatan Mas Tikon
                </h3>
                <p className="text-blue-800 text-sm italic">"{result.feedback}"</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <h4 className="text-news-900 font-bold mb-4 uppercase text-sm tracking-wider border-b pb-2">Nilai Berita</h4>
                <p className="text-slate-700 leading-relaxed mb-6">{result.masTikonAnalysis.newsValue}</p>

                <div className="bg-green-50 p-6 rounded border border-green-100 shadow-sm">
                    <span className="text-xs font-bold text-green-600 uppercase mb-2 block flex items-center gap-2">
                        <Check className="w-4 h-4"/> Angle Terpilih (Generated)
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 font-serif">"{result.masTikonAnalysis.generatedAngle}"</h3>
                    <p className="text-sm text-slate-600 italic border-t border-green-200 pt-2 mt-2">
                        Alasan: {result.masTikonAnalysis.angleReasoning}
                    </p>
                </div>
            </div>
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === "guide" && (
          <div className="space-y-6 animate-fadeIn">
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <h4 className="text-news-900 font-bold mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
                    <List className="w-4 h-4" /> SOP Liputan di Lokasi
                </h4>
                <div className="space-y-4">
                    {result.fieldGuide.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-news-100 text-news-800 flex items-center justify-center font-bold text-sm border border-news-200">
                                {idx + 1}
                            </div>
                            <p className="text-slate-700 text-sm pt-1">{step}</p>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        )}

        {/* SHOTLIST TAB */}
        {activeTab === "shotlist" && (
            <div className="space-y-6 animate-fadeIn">
                 {/* Shot List Checklist */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                     <h4 className="text-news-900 font-bold mb-6 uppercase text-sm tracking-wider border-b pb-2">
                        Wajib Gambar (Shot List)
                     </h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ShotCategory title="Establishing Shot" items={result.shotList.establishing} />
                        <ShotCategory title="Aktivitas Utama" items={result.shotList.activities} />
                        <ShotCategory title="Close Up / Detail" items={result.shotList.closeUps} />
                        <ShotCategory title="Cutaway / Insert" items={result.shotList.cutaways} />
                        <ShotCategory title="Natural Sound" items={result.shotList.naturalSound} />
                     </div>
                </div>

                {/* Structured Interviews */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 border-l-4 border-l-news-accent">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-news-900 font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                          <Mic className="w-4 h-4" /> Panduan & Hasil Wawancara
                      </h4>
                      {onRegenerateScript && (
                          <button 
                            onClick={onRegenerateScript}
                            disabled={isRegeneratingScript || !hasSummaries}
                            className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded font-bold transition-all ${
                              isRegeneratingScript || !hasSummaries
                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                : "bg-news-accent text-white hover:bg-news-800 shadow-sm"
                            }`}
                          >
                            <RefreshCw className={`w-3 h-3 ${isRegeneratingScript ? "animate-spin" : ""}`} />
                            {isRegeneratingScript ? "Sedang Memperbarui..." : "Update Naskah dengan SOT"}
                          </button>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                        {result.shotList.interviews.map((interview, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded border border-slate-200">
                                <div className="font-bold text-slate-800 mb-1">{interview.name}</div>
                                <div className="text-xs text-news-accent font-semibold uppercase mb-3 tracking-wide">{interview.title}</div>
                                
                                <div className="mb-3">
                                  <span className="text-xs font-bold text-slate-400 uppercase">Pertanyaan Usulan:</span>
                                  <ul className="mt-1 space-y-1">
                                      {interview.suggestedQuestions.map((q, qIdx) => (
                                          <li key={qIdx} className="text-sm text-slate-700 flex gap-2">
                                              <span className="text-slate-400 select-none">•</span>
                                              {q}
                                          </li>
                                      ))}
                                  </ul>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-200">
                                    <label className="block text-xs font-bold text-news-800 uppercase mb-2">
                                        Rangkuman Hasil Wawancara (Untuk SOT):
                                    </label>
                                    <textarea
                                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-news-accent outline-none"
                                        rows={3}
                                        placeholder={`Tulis poin penting jawaban ${interview.name} di sini...`}
                                        value={interview.answerSummary || ""}
                                        onChange={(e) => onUpdateInterviewSummary && onUpdateInterviewSummary(idx, e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 italic">
                                        *Isi kolom ini, lalu klik tombol "Update Naskah" di atas agar SOT masuk ke naskah secara otomatis.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* SCRIPT TAB */}
        {activeTab === "script" && (
            <div className="animate-fadeIn">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-news-900 text-white p-3 flex justify-between items-center">
                        <span className="text-xs font-mono uppercase tracking-wider">Teleprompter View</span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleCopy}
                                className="flex items-center gap-1 bg-news-700 hover:bg-news-600 text-white px-3 py-1 rounded text-xs transition-colors font-bold"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? "Tersalin!" : "Salin Naskah"}
                            </button>
                        </div>
                    </div>
                    {isRegeneratingScript ? (
                      <div className="p-12 text-center text-slate-400">
                          <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-news-accent rounded-full mx-auto mb-4"></div>
                          <p>Mas Tikon sedang merevisi naskah dengan SOT Anda...</p>
                      </div>
                    ) : (
                      <div className="p-8 font-mono text-base leading-relaxed text-slate-800 space-y-8 max-w-3xl mx-auto border-x border-slate-100 min-h-[500px]">
                          
                          {/* Slug */}
                          <div className="border-b-2 border-slate-800 pb-2 mb-6">
                              <span className="block font-bold">SLUG: {result.tvScript.slug}</span>
                          </div>

                          {/* Anchor Intro */}
                          <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-sm">
                              <span className="block font-bold text-red-600 mb-2">[ANCHOR INTRO]</span>
                              <p className="uppercase">{result.tvScript.anchorIntro}</p>
                          </div>

                          {/* Body / VO */}
                          <div>
                              <span className="block font-bold text-red-600 mb-2">[VOICE OVER / PACKAGE]</span>
                              <p className="uppercase whitespace-pre-wrap">{result.tvScript.body}</p>
                          </div>

                          {/* CGs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                              <div className="bg-slate-100 p-3 rounded">
                                  <span className="block text-xs font-bold text-slate-500 mb-1">CG 1 (NAME TITLE)</span>
                                  {result.tvScript.cgs.cg1.length > 0 ? (
                                    result.tvScript.cgs.cg1.map((cg, i) => (
                                        <div key={i} className="font-bold text-sm uppercase">{cg}</div>
                                    ))
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">Belum ada CG nama narasumber</span>
                                  )}
                              </div>
                              <div className="bg-slate-100 p-3 rounded">
                                  <span className="block text-xs font-bold text-slate-500 mb-1">CG 3 (LOCATOR)</span>
                                  <div className="font-bold text-sm uppercase">{result.tvScript.cgs.cg3}</div>
                              </div>
                          </div>

                      </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const ShotCategory = ({ title, items }: { title: string, items: string[] }) => (
    <div>
        <h5 className="font-bold text-xs text-slate-500 uppercase mb-2">{title}</h5>
        <ul className="space-y-2">
            {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckSquare className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default AnalysisView;
