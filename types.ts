export interface Interviewee {
  id: string;
  name: string;
  title: string;
}

export interface NewsData {
  topic: string;
  eventType: string;
  location: string;
  dateTime: string;
  organizer: string;
  keyFigures: string;
  what: string;
  who: string;
  when: string;
  where: string;
  why: string;
  how: string;
  interviewees: Interviewee[];
  // Removed proposedAngle and questions as requested
}

export interface InterviewGuide {
  name: string;
  title: string;
  suggestedQuestions: string[];
  answerSummary?: string; // New field for user input
}

export interface ShotList {
  establishing: string[];
  activities: string[];
  closeUps: string[];
  cutaways: string[];
  interviews: InterviewGuide[]; // Changed to structured object
  naturalSound: string[];
}

export interface TvScript {
  slug: string;
  anchorIntro: string; // Presenter reads this
  body: string; // Voice over
  cgs: {
    cg1: string[]; // Format: NAME (TITLE) - TOPIC
    cg3: string;   // Location/Date or Locator
  };
  fullText: string; // The fully formatted text for copying
}

export interface AnalysisResult {
  masTikonAnalysis: {
    newsValue: string;
    generatedAngle: string; // AI generates this now
    angleReasoning: string;
  };
  fieldGuide: string[];
  shotList: ShotList;
  technicalGuide: string[];
  tvScript: TvScript; // Renamed from scriptDraft
  feedback: string;
}

export const DEFAULT_NEWS_DATA: NewsData = {
  topic: "Pelantikan Rektor Universitas Muhammadiyah Gresik Periode 2025–2029",
  eventType: "Seremonial Pendidikan",
  location: "Kampus Universitas Muhammadiyah Gresik (UMG), Gresik, Jawa Timur",
  dateTime: "Senin, 10 Februari 2025, Pukul 09.00 WIB",
  organizer: "Pimpinan Pusat (PP) Muhammadiyah",
  keyFigures: "Prof. Dr. Khoirul Anwar, S.Pd., M.Pd. (Rektor Baru), Nadhirotul Laili (Rektor Lama)",
  what: "Pelantikan Rektor baru Universitas Muhammadiyah Gresik periode 2025–2029.",
  who: "Prof. Dr. Khoirul Anwar dilantik oleh PP Muhammadiyah, menggantikan Nadhirotul Laili.",
  when: "Senin, 10 Februari 2025, pukul 09.00 WIB.",
  where: "Kampus UMG, Gresik, Jawa Timur.",
  why: "Pergantian kepemimpinan dan kelanjutan pengembangan institusi pendidikan UMG.",
  how: "Prosesi pelantikan berlangsung secara resmi dan dihadiri civitas akademika serta pimpinan Muhammadiyah.",
  interviewees: [
    { id: '1', name: "Prof. Dr. Khoirul Anwar", title: "Rektor Baru UMG" },
    { id: '2', name: "Perwakilan PP Muhammadiyah", title: "Pimpinan Pusat" },
    { id: '3', name: "Nadhirotul Laili", title: "Rektor Periode 2021-2025" }
  ]
};
