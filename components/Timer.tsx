
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { POMODORO_TIME, SHORT_BREAK_TIME, LONG_BREAK_TIME } from '../constants';
import { Bell, Play, Pause, RotateCcw, Coffee, Briefcase, Timer as TimerIcon, Hourglass } from 'lucide-react';

type AppMode = 'pomodoro' | 'stopwatch' | 'timer';
type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerProps {
  onSessionComplete: (duration: number) => void;
  onTimerActivityChange: (isActive: boolean) => void;
}

const Timer: React.FC<TimerProps> = ({ onSessionComplete, onTimerActivityChange }) => {
  const [appMode, setAppMode] = useState<AppMode>('pomodoro');
  
  // Pomodoro states
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('focus');
  const [pomodoroTime, setPomodoroTime] = useState(POMODORO_TIME);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // Stopwatch states
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchActive, setIsStopwatchActive] = useState(false);

  // Timer states
  const [timerInput, setTimerInput] = useState({ minutes: '10', seconds: '00' });
  const [timerDuration, setTimerDuration] = useState(600);
  const [timerTime, setTimerTime] = useState(600);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const totalPomodoroTime = useMemo(() => ({
    focus: POMODORO_TIME,
    shortBreak: SHORT_BREAK_TIME,
    longBreak: LONG_BREAK_TIME,
  }[pomodoroMode]), [pomodoroMode]);

  useEffect(() => {
    let isActive = false;
    if (appMode === 'pomodoro') {
        isActive = isPomodoroActive;
    } else if (appMode === 'stopwatch') {
        isActive = isStopwatchActive;
    } else if (appMode === 'timer') {
        isActive = isTimerActive;
    }
    onTimerActivityChange(isActive);
  }, [appMode, isPomodoroActive, isStopwatchActive, isTimerActive, onTimerActivityChange]);


  const playSound = () => {
    new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3').play();
  };

  // Pomodoro Logic
  const handlePomodoroSessionEnd = useCallback(() => {
    setIsPomodoroActive(false);
    playSound();
    if (pomodoroMode === 'focus') {
      onSessionComplete(totalPomodoroTime - pomodoroTime);
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      setPomodoroMode(newPomodoroCount % 4 === 0 ? 'longBreak' : 'shortBreak');
    } else {
      setPomodoroMode('focus');
    }
  }, [pomodoroMode, onSessionComplete, pomodoroCount, pomodoroTime, totalPomodoroTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => setPomodoroTime(t => t - 1), 1000);
    } else if (isPomodoroActive && pomodoroTime === 0) {
      handlePomodoroSessionEnd();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPomodoroActive, pomodoroTime, handlePomodoroSessionEnd]);

  useEffect(() => {
    setPomodoroTime(totalPomodoroTime);
  }, [pomodoroMode, totalPomodoroTime]);

  // Stopwatch Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isStopwatchActive) {
      const startTime = Date.now() - stopwatchTime;
      interval = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 10);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isStopwatchActive, stopwatchTime]);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerActive && timerTime > 0) {
      interval = setInterval(() => setTimerTime(t => t - 1), 1000);
    } else if (isTimerActive && timerTime === 0) {
      setIsTimerActive(false);
      playSound();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerActive, timerTime]);
  
  const handleTimerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue < 60) {
        setTimerInput(prev => ({...prev, [name]: value.padStart(2, '0')}));
    } else if (value === '') {
        setTimerInput(prev => ({...prev, [name]: ''}));
    }
  };

  const setTimer = () => {
    const minutes = parseInt(timerInput.minutes, 10) || 0;
    const seconds = parseInt(timerInput.seconds, 10) || 0;
    const totalSeconds = minutes * 60 + seconds;
    setTimerDuration(totalSeconds);
    setTimerTime(totalSeconds);
    setIsTimerActive(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatStopwatchTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const centiseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${minutes}:${seconds}:${centiseconds}`;
  };

  const renderCircularProgress = (time: number, totalTime: number) => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = totalTime > 0 ? ((totalTime - time) / totalTime) * circumference : 0;
    return (
      <svg className="absolute w-full h-full" viewBox="0 0 280 280">
        <circle cx="140" cy="140" r={radius} className="text-lightest-navy" strokeWidth="12" fill="transparent" />
        <circle
          cx="140"
          cy="140"
          r={radius}
          className="text-teal"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
    );
  };

  const renderPomodoro = () => (
    <>
      <div className="flex justify-center gap-2 mb-6">
        <button onClick={() => { setIsPomodoroActive(false); setPomodoroMode('focus'); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pomodoroMode === 'focus' ? 'bg-teal text-navy' : 'bg-lightest-navy text-lightest-slate hover:bg-slate/50'}`}><Briefcase className="inline mr-2 h-4 w-4" />集中</button>
        <button onClick={() => { setIsPomodoroActive(false); setPomodoroMode('shortBreak'); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pomodoroMode === 'shortBreak' ? 'bg-teal text-navy' : 'bg-lightest-navy text-lightest-slate hover:bg-slate/50'}`}><Coffee className="inline mr-2 h-4 w-4" />短い休憩</button>
        <button onClick={() => { setIsPomodoroActive(false); setPomodoroMode('longBreak'); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pomodoroMode === 'longBreak' ? 'bg-teal text-navy' : 'bg-lightest-navy text-lightest-slate hover:bg-slate/50'}`}><Coffee className="inline mr-2 h-4 w-4" />長い休憩</button>
      </div>
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
        {renderCircularProgress(pomodoroTime, totalPomodoroTime)}
        <div className="z-10">
          <div className="text-6xl sm:text-7xl font-bold text-lightest-slate tracking-tighter">{formatTime(pomodoroTime)}</div>
          <div className="text-slate text-sm mt-1">
            {pomodoroMode === 'focus' ? `ポモドーロ #${pomodoroCount + 1}` : 'リラックスタイム！'}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center items-center gap-4">
        <button onClick={() => { setIsPomodoroActive(false); setPomodoroTime(totalPomodoroTime); }} className="p-3 bg-lightest-navy text-lightest-slate rounded-full hover:bg-slate/50 transition-colors"><RotateCcw size={24} /></button>
        <button onClick={() => setIsPomodoroActive(!isPomodoroActive)} className="px-10 py-4 bg-teal text-navy text-xl font-bold rounded-full hover:bg-teal/80 transition-transform transform hover:scale-105">
          {isPomodoroActive ? <Pause size={28} className="inline-block"/> : <Play size={28} className="inline-block"/>}
          <span className="ml-2">{isPomodoroActive ? '一時停止' : '開始'}</span>
        </button>
        <button onClick={playSound} className="p-3 bg-lightest-navy text-lightest-slate rounded-full hover:bg-slate/50 transition-colors"><Bell size={24} /></button>
      </div>
    </>
  );

  const renderStopwatch = () => (
    <>
      <div className="h-12 mb-6"></div> {/* Placeholder for pomodoro buttons */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
         <div className="text-5xl sm:text-6xl font-mono font-bold text-lightest-slate tracking-tighter">{formatStopwatchTime(stopwatchTime)}</div>
      </div>
       <div className="mt-8 flex justify-center items-center gap-4">
        <button onClick={() => { setIsStopwatchActive(false); setStopwatchTime(0); }} className="p-3 bg-lightest-navy text-lightest-slate rounded-full hover:bg-slate/50 transition-colors"><RotateCcw size={24} /></button>
        <button onClick={() => setIsStopwatchActive(!isStopwatchActive)} className="px-10 py-4 bg-teal text-navy text-xl font-bold rounded-full hover:bg-teal/80 transition-transform transform hover:scale-105">
          {isStopwatchActive ? <Pause size={28} className="inline-block"/> : <Play size={28} className="inline-block"/>}
          <span className="ml-2">{isStopwatchActive ? '停止' : '開始'}</span>
        </button>
        <div className="w-12 h-12"></div> {/* Placeholder for bell button */}
      </div>
    </>
  );

  const renderTimer = () => (
    <>
      <div className="flex justify-center items-center gap-2 mb-6">
        <input type="text" name="minutes" value={timerInput.minutes} onChange={handleTimerInputChange} className="w-20 bg-navy text-2xl text-center text-lightest-slate rounded-md p-2 border border-lightest-navy focus:ring-teal" />
        <span className="text-2xl text-lightest-slate">:</span>
        <input type="text" name="seconds" value={timerInput.seconds} onChange={handleTimerInputChange} className="w-20 bg-navy text-2xl text-center text-lightest-slate rounded-md p-2 border border-lightest-navy focus:ring-teal" />
        <button onClick={setTimer} className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-lightest-navy text-lightest-slate hover:bg-slate/50">設定</button>
      </div>
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
        {renderCircularProgress(timerTime, timerDuration)}
        <div className="z-10">
          <div className="text-6xl sm:text-7xl font-bold text-lightest-slate tracking-tighter">{formatTime(timerTime)}</div>
          <div className="text-slate text-sm mt-1">カスタムタイマー</div>
        </div>
      </div>
      <div className="mt-8 flex justify-center items-center gap-4">
        <button onClick={() => { setIsTimerActive(false); setTimerTime(timerDuration); }} className="p-3 bg-lightest-navy text-lightest-slate rounded-full hover:bg-slate/50 transition-colors"><RotateCcw size={24} /></button>
        <button onClick={() => setIsTimerActive(!isTimerActive)} className="px-10 py-4 bg-teal text-navy text-xl font-bold rounded-full hover:bg-teal/80 transition-transform transform hover:scale-105" disabled={timerDuration === 0}>
          {isTimerActive ? <Pause size={28} className="inline-block"/> : <Play size={28} className="inline-block"/>}
          <span className="ml-2">{isTimerActive ? '一時停止' : '開始'}</span>
        </button>
        <button onClick={playSound} className="p-3 bg-lightest-navy text-lightest-slate rounded-full hover:bg-slate/50 transition-colors"><Bell size={24} /></button>
      </div>
    </>
  );

  return (
    <div className="bg-light-navy p-6 rounded-lg shadow-xl text-center">
      <div className="flex justify-center border-b border-lightest-navy mb-6">
        <button onClick={() => setAppMode('pomodoro')} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${appMode === 'pomodoro' ? 'border-b-2 border-teal text-teal' : 'text-slate hover:text-lightest-slate'}`}><Hourglass size={18} />ポモドーロ</button>
        <button onClick={() => setAppMode('stopwatch')} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${appMode === 'stopwatch' ? 'border-b-2 border-teal text-teal' : 'text-slate hover:text-lightest-slate'}`}><TimerIcon size={18} />ストップウォッチ</button>
        <button onClick={() => setAppMode('timer')} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${appMode === 'timer' ? 'border-b-2 border-teal text-teal' : 'text-slate hover:text-lightest-slate'}`}><Hourglass size={18} />タイマー</button>
      </div>
      
      {appMode === 'pomodoro' && renderPomodoro()}
      {appMode === 'stopwatch' && renderStopwatch()}
      {appMode === 'timer' && renderTimer()}

    </div>
  );
};

export default Timer;
