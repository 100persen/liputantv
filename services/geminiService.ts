import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NewsData, AnalysisResult, TvScript, InterviewGuide } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    masTikonAnalysis: {
      type: Type.OBJECT,
      properties: {
        newsValue: { type: Type.STRING, description: "Penjelasan nilai berita" },
        generatedAngle: { type: Type.STRING, description: "Usulan angle berita yang dibuat oleh AI berdasarkan data" },
        angleReasoning: { type: Type.STRING, description: "Alasan pemilihan angle tersebut" },
      },
      required: ["newsValue", "generatedAngle", "angleReasoning"],
    },
    fieldGuide: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Langkah-langkah liputan step-by-step",
    },
    shotList: {
      type: Type.OBJECT,
      properties: {
        establishing: { type: Type.ARRAY, items: { type: Type.STRING } },
        activities: { type: Type.ARRAY, items: { type: Type.STRING } },
        closeUps: { type: Type.ARRAY, items: { type: Type.STRING } },
        cutaways: { type: Type.ARRAY, items: { type: Type.STRING } },
        interviews: { 
            type: Type.ARRAY, 
            items: { 
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    title: { type: Type.STRING },
                    suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            },
            description: "Daftar pertanyaan spesifik untuk setiap narasumber sesuai jabatannya"
        },
        naturalSound: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["establishing", "activities", "closeUps", "cutaways", "interviews", "naturalSound"],
    },
    technicalGuide: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    tvScript: {
      type: Type.OBJECT,
      properties: {
        slug: { type: Type.STRING, description: "Judul pendek berita (SLUG)" },
        anchorIntro: { type: Type.STRING, description: "Naskah untuk presenter di studio (Format TV)" },
        body: { type: Type.STRING, description: "Naskah Voice Over (Format TV) dengan spasi antar paragraf" },
        cgs: { 
            type: Type.OBJECT,
            properties: {
                cg1: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Format: NAMA (JABATAN) - TOPIK SINGKAT" },
                cg3: { type: Type.STRING, description: "Lokasi / Locator untuk CG Tempat" }
            }
        },
        fullText: { type: Type.STRING, description: "Gabungan seluruh naskah yang sudah diformat sempurna dengan jarak antar paragraf" }
      },
      required: ["slug", "anchorIntro", "body", "cgs", "fullText"],
    },
    feedback: {
      type: Type.STRING,
      description: "Catatan penutup dari Mas Tikon",
    },
  },
  required: ["masTikonAnalysis", "fieldGuide", "shotList", "technicalGuide", "tvScript", "feedback"],
};

const scriptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    slug: { type: Type.STRING },
    anchorIntro: { type: Type.STRING },
    body: { type: Type.STRING },
    cgs: { 
        type: Type.OBJECT,
        properties: {
            cg1: { type: Type.ARRAY, items: { type: Type.STRING } },
            cg3: { type: Type.STRING }
        }
    },
    fullText: { type: Type.STRING }
  },
  required: ["slug", "anchorIntro", "body", "cgs", "fullText"],
};

export const generateEditorialAnalysis = async (data: NewsData): Promise<AnalysisResult> => {
  const systemInstruction = `
    Kamu adalah Mas Tikon, Produser Senior TV.
    
    ATURAN KHUSUS PEMBUATAN NASKAH TV (WAJIB PATUH):
    1. GUNAKAN HURUF KAPITAL (ALL CAPS) UNTUK SELURUH BAGIAN NASKAH.
    2. GANTI TANDA BACA: Koma (,) -> Garis Miring (/). Titik (.) -> Garis Miring Ganda (//).
    3. ANGKA: Tulis terbilang (SATU, SEPULUH). Kecuali Tahun (2025).
    4. SPACING/LAYOUT: Berikan jarak 1 baris kosong (Double Enter) antar paragraf/alenia agar naskah enak dibaca (easy to read on teleprompter).
    5. STRUKTUR: SLUG -> ANCHOR INTRO -> PKG/VO -> SOT.
    
    ATURAN CG (CHARACTER GENERATOR):
    CG 1 harus lengkap: "NAMA NARASUMBER (JABATAN) - TOPIK SINGKAT".
    Contoh: "BUDI SANTOSO (SAKSI MATA) - KRONOLOGI KEBAKARAN".
    
    Jadilah mentor yang tegas tapi solutif.
  `;

  const intervieweesString = data.interviewees.map(i => `- Nama: ${i.name}, Jabatan: ${i.title}`).join('\n');

  const prompt = `
    Data Liputan Jurnalis Magang:
    Topik: ${data.topic}
    Jenis: ${data.eventType}
    
    DATA 5W+1H:
    What: ${data.what}
    Who: ${data.who}
    When: ${data.when}
    Where: ${data.where}
    Why: ${data.why}
    How: ${data.how}
    
    DAFTAR NARASUMBER:
    ${intervieweesString}
    
    TUGASMU:
    1. Tentukan ANGLE terbaik.
    2. Buatkan daftar pertanyaan spesifik.
    3. Buat NASKAH TV STANDAR SIAP TAYANG.
    4. PENTING: Pada output 'fullText' dan 'body', pastikan ada jarak SPASI/ENTER antar alenia (paragraph break) agar tidak menumpuk.
    5. CG 1 harus mencantumkan topik singkat (max 3 kata) yang relevan dengan jabatan narasumber.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.5,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const regenerateScriptWithSOT = async (
  currentScript: TvScript, 
  interviews: InterviewGuide[], 
  newsData: NewsData
): Promise<TvScript> => {
  const systemInstruction = `
    Kamu adalah Mas Tikon, Editor Berita TV Senior.
    Tugasmu adalah MEREVISI naskah berita untuk memasukkan SOT.
    
    ATURAN EDITING:
    1. PERTAHANKAN Format Naskah TV (ALL CAPS).
    2. TEKNIS: Koma diganti (/), Titik diganti (//), Angka diganti Huruf.
    3. LAYOUT (PENTING): Pisahkan setiap paragraf/alenia dengan JARAK BARIS KOSONG (Double Line Break). Jangan biarkan naskah menumpuk.
    
    ATURAN SOT & CG:
    1. Masukkan SOT ke dalam BODY naskah secara mengalir.
    2. Format CG 1: "NAMA (JABATAN) - TOPIK SINGKAT".
       Topik diambil dari inti SOT yang diucapkan.
       Contoh: "KHOIRUL ANWAR (REKTOR UMG) - TARGET AKREDITASI".
  `;

  const summaries = interviews
    .filter(i => i.answerSummary && i.answerSummary.trim() !== "")
    .map(i => `NARASUMBER: ${i.name} (${i.title})\nPOIN PENTING WAWANCARA: "${i.answerSummary}"`)
    .join('\n\n====================\n\n');

  if (!summaries) {
    return currentScript;
  }

  const prompt = `
    BERIKUT ADALAH NASKAH BERITA SAAT INI:
    ${currentScript.fullText}

    BERIKUT ADALAH HASIL WAWANCARA (SOT) BARU:
    ${summaries}

    INSTRUKSI PERBAIKAN:
    Tulis ulang seluruh naskah (fullText).
    1. Masukkan SOT ke dalam alur cerita.
    2. Pastikan CG 1 diupdate sesuai format "NAMA (JABATAN) - TOPIK".
    3. RAPIDKAN LAYOUT: Beri jarak spasi antar alenia agar enak dilihat saat dicopy.
    
    OUTPUT HARUS DALAM FORMAT JSON SESUAI SCHEMA (tvScript).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: scriptSchema,
        temperature: 0.4,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as TvScript;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini API Error (Regenerate Script):", error);
    throw error;
  }
};
