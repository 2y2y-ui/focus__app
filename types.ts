
export type Mood = '😊' | '😐' | '😩' | '🤯' | '🔥';

export type ConcentrationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface FocusSession {
  id: number;
  task: string;
  concentration: ConcentrationLevel;
  mood: Mood;
  timestamp: string;
  duration: number; // in seconds
  interruptionReason?: string;
}

export interface DayWiseData {
  [day: string]: FocusSession[];
}

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};
