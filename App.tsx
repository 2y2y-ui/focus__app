
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FocusSession } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Timer from './components/Timer';
import LogEntryModal from './components/LogEntryModal';
import Dashboard from './components/Dashboard';
import AiAdvisor from './components/AiAdvisor';
import HydrationTracker from './components/HydrationTracker';
import { getMorningBriefing, getInterventionAdvice } from './services/geminiService';
import { sampleFocusSessions } from './constants';

const App: React.FC = () => {
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('focusSessions', sampleFocusSessions);
  const [sleepHours, setSleepHours] = useLocalStorage<number | null>('sleepHours', null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [lastSessionDuration, setLastSessionDuration] = useState(25 * 60);
  
  const [morningAdvice, setMorningAdvice] = useState<string>('');
  const [interventionAdvice, setInterventionAdvice] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [showSleepInput, setShowSleepInput] = useState(() => !localStorage.getItem('sleepHours'));
  
  const [isAnyTimerActive, setIsAnyTimerActive] = useState(false);
  const isTimerActiveRef = useRef(isAnyTimerActive);
  const lastLoggedHour = useRef<number | null>(null);

  useEffect(() => {
    isTimerActiveRef.current = isAnyTimerActive;
  }, [isAnyTimerActive]);

  useEffect(() => {
    let timerId: number;

    const logAndSchedule = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // 同じ時間に複数回記録されるのを防ぐ
      if (lastLoggedHour.current !== currentHour) {
          const newSession: FocusSession = {
              id: Date.now(),
              timestamp: now.toISOString(),
              task: isTimerActiveRef.current ? '自動記録 - 集中' : '自動記録 - 非集中',
              concentration: isTimerActiveRef.current ? 5 : 0,
              mood: '😐',
              duration: 0, // 自動記録のセッション時間は0
          };
          setSessions(prev => [...prev, newSession]);
          lastLoggedHour.current = currentHour;
      }
      scheduleNextLog();
    };

    const scheduleNextLog = () => {
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1, 0, 1, 0); // 1秒過ぎに設定して重複を回避
        const delay = nextHour.getTime() - now.getTime();
        timerId = window.setTimeout(logAndSchedule, delay);
    };
    
    scheduleNextLog();

    return () => clearTimeout(timerId);
  }, [setSessions]);


  const handleSessionComplete = (duration: number) => {
    setLastSessionDuration(duration);
    setIsLogModalOpen(true);
  };

  const handleLogSubmit = (session: Omit<FocusSession, 'id' | 'timestamp' | 'duration'>) => {
    const newSession: FocusSession = {
      ...session,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      duration: lastSessionDuration,
    };
    setSessions(prev => [...prev, newSession]);
    setIsLogModalOpen(false);
  };
  
  const checkInterventionNeeded = useCallback(() => {
    const recentSessions = sessions.slice(-3).filter(s => s.duration > 0); // 手動セッションのみを考慮
    if (recentSessions.length === 3 && recentSessions.every(s => s.concentration < 3)) {
      setIsLoadingAdvice(true);
      getInterventionAdvice(recentSessions).then(advice => {
        setInterventionAdvice(advice);
        setIsLoadingAdvice(false);
      });
    } else {
      setInterventionAdvice('');
    }
  }, [sessions]);

  useEffect(() => {
    checkInterventionNeeded();
  }, [sessions, checkInterventionNeeded]);

  const handleSleepHoursSubmit = async (hours: number) => {
    setSleepHours(hours);
    setShowSleepInput(false);
    setIsLoadingAdvice(true);
    const advice = await getMorningBriefing(hours, sessions);
    setMorningAdvice(advice);
    setIsLoadingAdvice(false);
  };

  return (
    <div className="min-h-screen bg-navy text-slate font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AiAdvisor 
              morningAdvice={morningAdvice}
              interventionAdvice={interventionAdvice}
              isLoading={isLoadingAdvice}
              showSleepInput={showSleepInput}
              onSleepHoursSubmit={handleSleepHoursSubmit}
              sessions={sessions}
            />
            <Timer onSessionComplete={handleSessionComplete} onTimerActivityChange={setIsAnyTimerActive} />
            <Dashboard sessions={sessions} />
          </div>
          <div className="space-y-8">
            <HydrationTracker />
          </div>
        </div>
      </main>
      {isLogModalOpen && (
        <LogEntryModal
          onClose={() => setIsLogModalOpen(false)}
          onSubmit={handleLogSubmit}
        />
      )}
    </div>
  );
};

export default App;
