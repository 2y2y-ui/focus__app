
import React, { useMemo } from 'react';
import { FocusSession } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  sessions: FocusSession[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-lightest-navy p-3 rounded-md border border-slate/50">
        <p className="text-lightest-slate font-bold">{`時刻: ${label}`}</p>
        <p className="text-teal">{`集中度: ${data.concentration} ★`}</p>
        <p className="text-light-slate">{`タスク: ${data.task}`}</p>
        <p className="text-light-slate">{`気分: ${data.mood}`}</p>
      </div>
    );
  }
  return null;
};

const GoldenTimeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const avgConcentration = payload[0].value;
      return (
        <div className="bg-lightest-navy p-3 rounded-md border border-slate/50">
          <p className="text-lightest-slate font-bold">{`時間帯: ${label}`}</p>
          <p className="text-teal">{`平均集中度: ${avgConcentration.toFixed(2)} ★`}</p>
        </div>
      );
    }
    return null;
  };

const Dashboard: React.FC<DashboardProps> = ({ sessions }) => {
  const todaySessions = useMemo(() => {
    const today = new Date().toDateString();
    return sessions.filter(s => new Date(s.timestamp).toDateString() === today);
  }, [sessions]);

  const manualTodaySessions = useMemo(() => {
    // durationが0より大きいセッション（手動で完了したもの）をフィルタリング
    return sessions.filter(s => {
        const sessionDate = new Date(s.timestamp).toDateString();
        const today = new Date().toDateString();
        return sessionDate === today && s.duration > 0;
    });
  }, [sessions]);

  const totalFocusTime = useMemo(() => {
    return todaySessions.reduce((acc, session) => acc + session.duration, 0);
  }, [todaySessions]);

  const chartData = useMemo(() => {
    return todaySessions.map(s => ({
      time: new Date(s.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      concentration: s.concentration,
      task: s.task,
      mood: s.mood,
    })).sort((a,b) => a.time.localeCompare(b.time));
  }, [todaySessions]);
  
  const goldenTimeData = useMemo(() => {
    if (sessions.length < 3) return []; // 意味のある分析のために最低3セッションを要求

    const hourlyConcentration: { [hour: number]: { total: number; count: number } } = {};

    sessions.forEach(session => {
        const hour = new Date(session.timestamp).getHours();
        if (!hourlyConcentration[hour]) {
            hourlyConcentration[hour] = { total: 0, count: 0 };
        }
        hourlyConcentration[hour].total += session.concentration;
        hourlyConcentration[hour].count += 1;
    });

    const data = Object.entries(hourlyConcentration).map(([hour, values]) => ({
        hour: `${hour}時`,
        avgConcentration: values.total / values.count,
    }));

    return data.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [sessions]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}時間 ${m}分`;
  };

  return (
    <div className="bg-light-navy p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-lightest-slate mb-6">今日のダッシュボード</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
        <div className="bg-navy p-4 rounded-md">
          <p className="text-slate text-sm">合計集中時間</p>
          <p className="text-3xl font-bold text-teal">{formatTime(totalFocusTime)}</p>
        </div>
        <div className="bg-navy p-4 rounded-md">
          <p className="text-slate text-sm">完了セッション数</p>
          <p className="text-3xl font-bold text-teal">{manualTodaySessions.length}</p>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-lightest-slate mb-4 mt-8">今日の集中力の推移</h3>
      {todaySessions.length > 1 ? (
        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
              <XAxis dataKey="time" stroke="#a8b2d1" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} allowDecimals={false} stroke="#a8b2d1" tick={{ fontSize: 12 }}/>
              <Tooltip content={<CustomTooltip />} cursor={{stroke: '#64ffda', strokeWidth: 1, strokeDasharray: '3 3'}}/>
              <Line 
                type="monotone" 
                dataKey="concentration" 
                name="集中度" 
                stroke="#64ffda" 
                strokeWidth={2} 
                dot={{ r: 5, fill: '#64ffda' }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-60 flex items-center justify-center bg-navy rounded-md">
            <p className="text-slate">さらにセッションを記録すると、集中力の推移がグラフで表示されます。</p>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-lightest-slate mb-4 mt-12">ゴールデンタイム分析</h3>
      <p className="text-slate mb-4 text-sm">全期間のデータから、あなたの集中力が高い時間帯を分析します。</p>
      {goldenTimeData.length > 0 ? (
        <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer>
                <BarChart data={goldenTimeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
                    <XAxis dataKey="hour" stroke="#a8b2d1" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 5]} stroke="#a8b2d1" tick={{ fontSize: 12 }}/>
                    <Tooltip content={<GoldenTimeTooltip />} cursor={{fill: '#233554'}} />
                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                    <Bar dataKey="avgConcentration" fill="#64ffda" name="平均集中度" barSize={30}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-60 flex items-center justify-center bg-navy rounded-md">
            <p className="text-slate">さらにセッションを記録すると、あなたのゴールデンタイムが表示されます。</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
