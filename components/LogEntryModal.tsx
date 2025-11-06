
import React, { useState } from 'react';
import { FocusSession, Mood, ConcentrationLevel } from '../types';
import { MOODS } from '../constants';
import { Star, X } from 'lucide-react';

interface LogEntryModalProps {
  onClose: () => void;
  onSubmit: (session: Omit<FocusSession, 'id' | 'timestamp' | 'duration'>) => void;
}

const LogEntryModal: React.FC<LogEntryModalProps> = ({ onClose, onSubmit }) => {
  const [task, setTask] = useState('');
  const [concentration, setConcentration] = useState<ConcentrationLevel>(3);
  const [mood, setMood] = useState<Mood>('😐');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim() === '') {
      alert('タスクの説明を入力してください。');
      return;
    }
    onSubmit({ task, concentration, mood });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-light-navy rounded-lg shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate hover:text-teal transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-lightest-slate mb-6 text-center">セッション完了！</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="task" className="block text-sm font-medium text-light-slate mb-2">何の作業をしましたか？</label>
            <input
              type="text"
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-navy border border-lightest-navy text-lightest-slate rounded-md p-3 focus:ring-2 focus:ring-teal focus:border-teal outline-none transition"
              placeholder="例：第3章の読書"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-light-slate mb-2">集中力はどうでしたか？</label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setConcentration(level as ConcentrationLevel)}
                  className="p-1"
                >
                  <Star
                    size={36}
                    className={`transition-colors duration-200 ${
                      level <= concentration ? 'text-teal fill-current' : 'text-slate'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-light-slate mb-2">今の気分は？</label>
            <div className="flex justify-around bg-navy p-2 rounded-lg">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`text-4xl p-2 rounded-full transition-transform transform hover:scale-125 ${mood === m ? 'bg-teal/20' : ''}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal text-navy font-bold py-3 px-4 rounded-md hover:bg-teal/80 transition-colors"
          >
            セッションを記録
          </button>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LogEntryModal;