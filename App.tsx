import React, { useState } from "react";
import { NewsData, DEFAULT_NEWS_DATA, AnalysisResult } from "./types";
import { generateEditorialAnalysis, regenerateScriptWithSOT } from "./services/geminiService";
import NewsForm from "./components/NewsForm";
import AnalysisView from "./components/AnalysisView";
import { Tv } from "lucide-react";

const App: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsData>(DEFAULT_NEWS_DATA);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRegeneratingScript, setIsRegeneratingScript] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (key: keyof NewsData, value: any) => {
    setNewsData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAnalysisSubmit = async () => {
    if (!process.env.API_KEY) {
      setError("API Key belum dikonfigurasi. Harap setel process.env.API_KEY.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await generateEditorialAnalysis(newsData);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError("Gagal menghubungi Mas Tikon. Cek koneksi atau coba lagi nanti.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateInterviewSummary = (index: number, summary: string) => {
    if (!analysisResult) return;
    
    const updatedInterviews = [...analysisResult.shotList.interviews];
    updatedInterviews[index] = { ...updatedInterviews[index], answerSummary: summary };

    setAnalysisResult({
      ...analysisResult,
      shotList: {
        ...analysisResult.shotList,
        interviews: updatedInterviews
      }
    });
  };

  const handleRegenerateScript = async () => {
    if (!analysisResult || !process.env.API_KEY) return;

    setIsRegeneratingScript(true);
    try {
      const updatedScript = await regenerateScriptWithSOT(
        analysisResult.tvScript, 
        analysisResult.shotList.interviews,
        newsData
      );
      
      setAnalysisResult({
        ...analysisResult,
        tvScript: updatedScript
      });
      // Optionally switch tab or notify user? 
      // AnalysisView will handle UI feedback.
    } catch (err) {
      console.error(err);
      setError("Gagal memperbarui naskah dengan SOT.");
    } finally {
      setIsRegeneratingScript(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-news-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-news-red rounded flex items-center justify-center text-white font-bold shadow-inner">
               TV
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Panduan Mas Tikon</h1>
              <p className="text-xs text-slate-400 font-medium">Bagi Jurnalis Magang</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
            <Tv className="w-4 h-4" />
            <span>Virtual Newsroom Assistant v1.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-red-700 font-medium">{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 h-full">
            <NewsForm 
                data={newsData} 
                onChange={handleInputChange} 
                onSubmit={handleAnalysisSubmit} 
                isGenerating={isGenerating} 
            />
          </div>

          {/* Right Column: Analysis Output */}
          <div className="lg:col-span-7 h-full">
            <AnalysisView 
              result={analysisResult} 
              onUpdateInterviewSummary={handleUpdateInterviewSummary}
              onRegenerateScript={handleRegenerateScript}
              isRegeneratingScript={isRegeneratingScript}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
