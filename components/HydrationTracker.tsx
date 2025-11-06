
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Droplet } from 'lucide-react';

const HydrationTracker: React.FC = () => {
  const [waterCount, setWaterCount] = useLocalStorage<number>('waterCount', 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const waterPerGlass = 200; // ml

  const handleWaterClick = () => {
    setWaterCount(prev => prev + 1);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="bg-light-navy p-6 rounded-lg shadow-xl text-center">
      <h3 className="text-xl font-bold text-lightest-slate mb-4">水分補給</h3>
      <p className="text-slate mb-6">水分補給は集中力の鍵です。1時間に約200mlを目安にしましょう。</p>
      
      <div className="flex flex-col items-center gap-4">
        <button 
          onClick={handleWaterClick}
          className="relative w-28 h-28 sm:w-32 sm:h-32 bg-navy rounded-full flex items-center justify-center text-teal shadow-inner overflow-hidden group"
          style={{
            border: '4px solid #112240',
            boxShadow: 'inset 0 0 10px #0a192f'
          }}
        >
          <div 
            className="absolute bottom-0 left-0 w-full bg-teal/20 transition-all duration-500 ease-in-out"
            style={{ height: `${Math.min(100, (waterCount * waterPerGlass / 2000) * 100)}%` }}
          ></div>
          <Droplet size={64} className="z-10 transition-transform duration-300 group-hover:scale-110" />
          {isAnimating && (
            <div className="absolute inset-0 rounded-full border-4 border-teal animate-ping"></div>
          )}
        </button>
        <p className="text-xl sm:text-2xl font-bold text-lightest-slate">
          {waterCount} 杯
        </p>
        <p className="text-slate text-sm">
          ({waterCount * waterPerGlass} ml)
        </p>
      </div>
       <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 0.7s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default HydrationTracker;
