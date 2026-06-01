export interface Capsule {
  id: string;
  sectionId: number;
  category: string;
  title: string;
  shortDescription: string;
  content: string;
  takeaway: string;
  readTime: string;
  date: string; // ISO date string in YYYY-MM-DD format
}

export interface Revision {
  capsuleId: string;
  capsuleTitle: string;
  sectionId: number;
  category: string;
  note: string;
  savedDate: string; // Formatting like "May 27, 2026" or YYYY-MM-DD
}

export interface ConvoUtterance {
  speaker: string;
  text: string;
}

export interface VocabularyWord {
  word: string;
  meaning: string;
}

export interface ConvoData {
  title: string;
  theme: string;
  conversation: ConvoUtterance[];
  vocabulary: VocabularyWord[];
  takeaway: string;
}

export interface SectionInfo {
  id: number;
  name: string;
  description: string;
}
