
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, BrainCircuit, AlertTriangle, Send, MessageSquare } from 'lucide-react';
import { ChatMessage, FocusSession } from '../types';
import { getChatResponse } from '../services/geminiService';

interface AiAdvisorProps {
  morningAdvice: string;
  interventionAdvice: string;
  isLoading: boolean;
  showSleepInput: boolean;
  onSleepHoursSubmit: (hours: number) => void;
  sessions: FocusSession[];
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ morningAdvice, interventionAdvice, isLoading, showSleepInput, onSleepHoursSubmit, sessions }) => {
  const [sleepInput, setSleepInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(sleepInput);
    if (!isNaN(hours) && hours > 0 && hours < 24) {
      onSleepHoursSubmit(hours);
    } else {
      alert('有効な時間数を入力してください。');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userInput.trim() || isChatLoading) return;

      const newUserMessage: ChatMessage = { role: 'user', content: userInput };
      setMessages(prev => [...prev, newUserMessage]);
      setUserInput('');
      setIsChatLoading(true);

      try {
          const response = await getChatResponse(userInput, sessions, messages);
          const newModelMessage: ChatMessage = { role: 'model', content: response };
          setMessages(prev => [...prev, newModelMessage]);
      } catch (error) {
          const errorMessage: ChatMessage = { role: 'model', content: 'エラーが発生しました。もう一度お試しください。' };
          setMessages(prev => [...prev, errorMessage]);
      } finally {
          setIsChatLoading(false);
      }
  };

  const adviceToShow = interventionAdvice || morningAdvice;
  const title = interventionAdvice ? "集中力アップの提案" : "モーニングブリーフィング";
  const Icon = interventionAdvice ? AlertTriangle : BrainCircuit;

  return (
    <div className="bg-light-navy rounded-lg shadow-xl">
      <div className="p-6 border-l-4 border-teal">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Sparkles className="text-teal animate-spin mr-3" size={24} />
            <p className="text-light-slate">あなたに合わせたアドバイスを生成中...</p>
          </div>
        ) : showSleepInput ? (
          <div>
            <h3 className="text-xl font-bold text-lightest-slate mb-2 flex items-center">
              <BrainCircuit className="mr-3 text-teal" />
              おはようございます！
            </h3>
            <p className="text-slate mb-4">昨夜の睡眠時間は何時間でしたか？</p>
            <form onSubmit={handleSleepSubmit} className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={sleepInput}
                onChange={(e) => setSleepInput(e.target.value)}
                className="flex-grow bg-navy border border-lightest-navy text-lightest-slate rounded-md p-2 focus:ring-2 focus:ring-teal focus:border-teal outline-none transition"
                placeholder="例：7.5"
                required
              />
              <button type="submit" className="bg-teal text-navy font-bold py-2 px-4 rounded-md hover:bg-teal/80 transition-colors">
                ブリーフィングを受け取る
              </button>
            </form>
          </div>
        ) : adviceToShow ? (
          <div>
            <h3 className="text-xl font-bold text-lightest-slate mb-2 flex items-center">
              <Icon className="mr-3 text-teal" />
              {title}
            </h3>
            <p className="text-light-slate whitespace-pre-wrap">{adviceToShow}</p>
          </div>
        ) : (
          <div>
              <h3 className="text-xl font-bold text-lightest-slate mb-2 flex items-center">
                  <BrainCircuit className="mr-3 text-teal" />
                  おかえりなさい！
              </h3>
              <p className="text-light-slate">AIアドバイザーの準備はできています。下のチャットで相談を始めましょう。</p>
          </div>
        )}
      </div>

      {/* AI Focus Coach Chat */}
      <div className="border-t border-lightest-navy p-6">
        <h3 className="text-xl font-bold text-lightest-slate mb-4 flex items-center">
          <MessageSquare className="mr-3 text-teal" />
          AIフォーカスコーチ
        </h3>
        <div ref={chatContainerRef} className="h-56 sm:h-64 overflow-y-auto bg-navy p-4 rounded-md mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate text-center">生産性に関するお悩みや、<br/>集中するためのコツなどを相談できます。</p>
            </div>
          ) : (
            messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-teal text-navy' : 'bg-lightest-navy text-lightest-slate'}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                </div>
            ))
          )}
           {isChatLoading && (
                <div className="flex justify-start">
                    <div className="bg-lightest-navy text-lightest-slate rounded-lg px-4 py-2">
                        <div className="flex items-center">
                            <span className="animate-pulse">...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-grow bg-navy border border-lightest-navy text-lightest-slate rounded-md p-2 focus:ring-2 focus:ring-teal focus:border-teal outline-none transition"
            placeholder={isChatLoading ? "応答を待っています..." : "AIコーチに相談する..."}
            disabled={isChatLoading}
          />
          <button type="submit" className="bg-teal text-navy font-bold p-2 rounded-md hover:bg-teal/80 transition-colors disabled:bg-slate disabled:cursor-not-allowed" disabled={isChatLoading}>
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAdvisor;
