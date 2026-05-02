import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';

interface Task { id: string; title: string; due_date: string | null; priority: string; status: string; project_name: string; }

export default function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]); const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth()); const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { api.get('/api/dashboard').then(r => setTasks(r.data.myTasks || [])).finally(() => setLoading(false)); }, []);

  const today = new Date(); const todayStr = today.toISOString().split('T')[0];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long' }).toUpperCase();

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => { if (t.due_date) { const d = t.due_date.split('T')[0]; if (!map[d]) map[d] = []; map[d].push(t); } });
    return map;
  }, [tasks]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday = () => { setMonth(today.getMonth()); setYear(today.getFullYear()); };

  const priorityColors: Record<string, string> = { high: 'bg-red-400 text-white', medium: 'bg-[#ffff00] text-black', low: 'bg-[#00fbfb] text-black' };

  // Build grid: prev month trailing + current month + next month leading
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, isCurrentMonth: false, dateStr: '' });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isCurrentMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDayOfWeek - daysInMonth + 1, isCurrentMonth: false, dateStr: '' });

  if (loading) return <div className="p-8 w-full"><div className="neo-card-static h-96 animate-pulse" /></div>;

  return (
    <div className="p-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-[64px] font-black text-black uppercase leading-none tracking-tighter">{monthName}</h1>
          <p className="text-xl text-black/60 font-bold mt-2">{year}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={prevMonth} className="neo-btn neo-btn-white px-6 py-3 font-black text-sm uppercase">
            <span className="material-symbols-outlined">chevron_left</span> PREV
          </button>
          <button onClick={nextMonth} className="neo-btn neo-btn-white px-6 py-3 font-black text-sm uppercase">
            NEXT <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <button onClick={goToday} className="neo-btn neo-btn-yellow px-8 py-3 font-black text-sm uppercase ml-2">
            <span className="material-symbols-outlined">today</span> TODAY
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="neo-card-static overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-t-4 border-l-4 border-black">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="neo-cal-header">{d}</div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="grid grid-cols-7 border-t-4 border-l-4 border-black">
          {cells.map((cell, i) => {
            const isToday = cell.dateStr === todayStr;
            const isWeekend = i % 7 === 0 || i % 7 === 6;
            const dayTasks = cell.isCurrentMonth ? (tasksByDate[cell.dateStr] || []) : [];

            return (
              <div key={i}
                className={`neo-cal-cell relative ${
                  !cell.isCurrentMonth ? 'bg-[#dadada] text-black/30' :
                  isToday ? 'bg-[#a3e635] border-2 border-black z-10 scale-[1.02] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                  isWeekend ? 'bg-[#f3f3f3]' : ''
                }`}>
                <span className={`font-black text-xl block mb-2 ${
                  isToday ? 'text-black' : isWeekend && cell.isCurrentMonth ? 'text-red-500' : ''
                }`}>{cell.day}</span>
                {isToday && <div className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase mb-1 inline-block">TODAY</div>}
                {dayTasks.slice(0, 2).map(t => (
                  <div key={t.id} className={`neo-event ${priorityColors[t.priority] || 'bg-white'} truncate`}>
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && <span className="text-[10px] font-black text-black/50 mt-1 block">+{dayTasks.length - 2} MORE</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
