import React from "react";
import { NewsData, Interviewee } from "../types";
import { Send, FileText, MapPin, Users, HelpCircle, Plus, Trash2 } from "lucide-react";

interface NewsFormProps {
  data: NewsData;
  onChange: (key: keyof NewsData, value: any) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

const NewsForm: React.FC<NewsFormProps> = ({ data, onChange, onSubmit, isGenerating }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.name as keyof NewsData, e.target.value);
  };

  // Interviewee Management
  const addInterviewee = () => {
    const newInterviewee: Interviewee = {
      id: Date.now().toString(),
      name: "",
      title: ""
    };
    onChange("interviewees", [...data.interviewees, newInterviewee]);
  };

  const removeInterviewee = (id: string) => {
    onChange("interviewees", data.interviewees.filter(i => i.id !== id));
  };

  const updateInterviewee = (id: string, field: keyof Interviewee, value: string) => {
    const updated = data.interviewees.map(i => 
      i.id === id ? { ...i, [field]: value } : i
    );
    onChange("interviewees", updated);
  };

  const w5hLabels: Record<string, string> = {
    what: "What (Apa)",
    who: "Who (Siapa)",
    when: "When (Kapan)",
    where: "Where (Di mana)",
    why: "Why (Mengapa)",
    how: "How (Bagaimana)"
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6 h-full overflow-y-auto">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-news-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-news-accent" />
          Formulir Pra-Liputan
        </h2>
        <p className="text-sm text-slate-500 mt-1">Isi data mentah. Mas Tikon akan menentukan angle dan naskah.</p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Judul / Topik</label>
            <input
              type="text"
              name="topic"
              value={data.topic}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-news-accent focus:border-transparent outline-none text-sm"
              placeholder="Contoh: Kebakaran Pasar Besar"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jenis Acara</label>
            <input
              type="text"
              name="eventType"
              value={data.eventType}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-news-accent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Waktu</label>
            <input
              type="text"
              name="dateTime"
              value={data.dateTime}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-news-accent outline-none text-sm"
            />
          </div>
          <div className="col-span-2">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Lokasi
             </label>
            <input
              type="text"
              name="location"
              value={data.location}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-news-accent outline-none text-sm"
            />
          </div>
          <div className="col-span-2">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> Tokoh Utama
             </label>
            <input
              type="text"
              name="keyFigures"
              value={data.keyFigures}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-news-accent outline-none text-sm"
            />
          </div>
        </div>

        {/* 5W1H */}
        <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
          <h3 className="text-sm font-bold text-news-800 mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            5W + 1H Data
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {['what', 'who', 'when', 'where', 'why', 'how'].map((key) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{w5hLabels[key]}</label>
                <textarea
                  name={key}
                  value={data[key as keyof NewsData]}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-news-accent outline-none text-sm resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Interviewees */}
        <div>
           <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-news-accent uppercase tracking-wider">
                  Rencana Narasumber (Wawancara)
              </label>
              <button 
                onClick={addInterviewee}
                className="text-xs flex items-center gap-1 bg-news-100 text-news-800 px-2 py-1 rounded hover:bg-news-200 transition-colors"
              >
                  <Plus className="w-3 h-3" /> Tambah
              </button>
           </div>
           
           <div className="space-y-3">
              {data.interviewees.length === 0 && (
                  <p className="text-sm text-slate-400 italic text-center py-2 border border-dashed rounded">Belum ada narasumber</p>
              )}
              {data.interviewees.map((person, index) => (
                  <div key={person.id} className="flex gap-2 items-start bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="flex-1 space-y-2">
                          <input 
                              type="text" 
                              placeholder="Nama Lengkap Narasumber"
                              value={person.name}
                              onChange={(e) => updateInterviewee(person.id, 'name', e.target.value)}
                              className="w-full p-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-news-accent outline-none"
                          />
                          <input 
                              type="text" 
                              placeholder="Jabatan / Kapasitas (Penting untuk pertanyaan)"
                              value={person.title}
                              onChange={(e) => updateInterviewee(person.id, 'title', e.target.value)}
                              className="w-full p-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-news-accent outline-none"
                          />
                      </div>
                      <button 
                        onClick={() => removeInterviewee(person.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Hapus"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
              ))}
           </div>
           <p className="text-xs text-slate-400 mt-2">
              *Pertanyaan akan dibuatkan otomatis oleh Mas Tikon berdasarkan jabatan narasumber.
           </p>
        </div>

        <button
          onClick={onSubmit}
          disabled={isGenerating}
          className={`w-full py-4 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
            isGenerating
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-news-900 hover:bg-news-800 hover:shadow-xl active:scale-[0.99]"
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Sedang Dianalisis Mas Tikon...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Kirim ke Meja Redaksi
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NewsForm;
