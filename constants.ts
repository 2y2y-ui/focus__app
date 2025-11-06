
import { FocusSession, Mood } from './types';

export const POMODORO_TIME = 25 * 60; // 25 minutes
export const SHORT_BREAK_TIME = 5 * 60; // 5 minutes
export const LONG_BREAK_TIME = 15 * 60; // 15 minutes

export const MOODS: Mood[] = ['😊', '😐', '😩', '🤯', '🔥'];

export const sampleFocusSessions: FocusSession[] = [
    { id: 1, task: "React component design", concentration: 4, mood: '🔥', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), duration: 1500 },
    { id: 2, task: "State management research", concentration: 5, mood: '🔥', timestamp: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(), duration: 1500 },
    { id: 3, task: "API integration", concentration: 3, mood: '😐', timestamp: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(), duration: 1500 },
    { id: 4, task: "Bug fixing", concentration: 2, mood: '😩', timestamp: new Date(Date.now() - 86400000).toISOString(), duration: 1500 },
    { id: 5, task: "UI styling with Tailwind", concentration: 5, mood: '😊', timestamp: new Date(Date.now() - 86400000 + 3600000).toISOString(), duration: 1500 },
    { id: 6, task: "Documentation writing", concentration: 3, mood: '😐', timestamp: new Date(Date.now() - 86400000 + 7200000).toISOString(), duration: 1500 },
];
