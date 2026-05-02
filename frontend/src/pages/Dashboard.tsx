import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface DashboardData {
  totalTasks: number; completed: number; overdue: number;
  byStatus: { todo: number; in_progress: number; done: number };
  overdueTasks: Array<{ id: string; title: string; due_date: string; priority: string; project_name: string; assigned_to_name: string | null; }>;
  myTasks: Array<{ id: string; title: string; status: string; priority: string; due_date: string | null; project_name: string; project_id: string; }>;
  tasksByUser: Array<{ id: string; name: string; total: string; done: string; in_progress: string; todo: string; }>;
}

function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  const size = 140, cx = 70, cy = 70, r = 50, stroke = 16;
  let offset = 0; const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={stroke} stroke="#e2e2e2" />
      {data.map((d, i) => {
        const pct = total > 0 ? d.value / total : 0; const dashArray = `${pct * circ} ${circ}`; const dashOffset = -offset * circ; offset += pct;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={stroke} strokeDasharray={dashArray} strokeDashoffset={dashOffset} transform={`rotate(-90 ${cx} ${cy})`} className="transition-all duration-700" />;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" className="text-2xl font-black fill-black">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="text-[10px] uppercase fill-black/60 font-black tracking-widest">TASKS</text>
    </svg>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/dashboard').then(r => setData(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="p-8 w-full"><div className="animate-pulse space-y-6"><div className="h-10 w-60 neo-card-static" /><div className="grid grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-40 neo-card-static" />)}</div></div></div>;
  if (!data) return null;

  const { totalTasks, completed, overdue, byStatus, myTasks } = data;
  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
  const chartData = [
    { label: 'To Do', value: byStatus.todo, color: '#e2e2e2' },
    { label: 'In Progress', value: byStatus.in_progress, color: '#ffff00' },
    { label: 'Done', value: byStatus.done, color: '#00fbfb' },
  ];

  const priorityBg: Record<string, string> = { high: 'bg-red-400 text-white', medium: 'bg-[#ffff00] text-black', low: 'bg-zinc-300 text-black' };

  return (
    <div className="p-8 w-full">
      {/* Header */}
      <div className="mb-10 border-b-4 border-black pb-6">
        <h1 className="text-[64px] font-black text-black uppercase leading-none tracking-tighter">DASHBOARD</h1>
        <p className="text-xl text-black/60 font-bold mt-2">Overview of your task progress</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* KPI Cards */}
        {[
          { label: 'TOTAL TASKS', value: totalTasks, icon: 'assignment', sub: `${byStatus.in_progress} in progress`, bg: 'bg-white' },
          { label: 'COMPLETED', value: completed, icon: 'check_circle', sub: `${completionRate}% completion rate`, bg: 'bg-[#00fbfb]' },
          { label: 'OVERDUE', value: overdue, icon: 'warning', sub: overdue === 0 ? 'All on track!' : 'Needs attention', bg: 'bg-red-400' },
        ].map((kpi, i) => (
          <div key={i} className={`col-span-4 ${kpi.bg} border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-start gap-4`}>
            <div className="w-14 h-14 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
            </div>
            <div>
              <p className="text-xs font-black text-black/60 tracking-widest uppercase">{kpi.label}</p>
              <p className="text-4xl font-black text-black mt-1">{kpi.value}</p>
              <p className="text-xs text-black/50 mt-1 font-bold">{kpi.sub}</p>
            </div>
          </div>
        ))}

        {/* Chart */}
        <div className="col-span-4 mt-8">
          <h2 className="text-2xl font-black text-black uppercase mb-4 flex items-center gap-3 border-b-4 border-black pb-3">
            <span className="material-symbols-outlined text-2xl">donut_large</span> DISTRIBUTION
          </h2>
          <div className="neo-card-static p-6 flex flex-col items-center gap-5">
            <DonutChart data={chartData} total={totalTasks} />
            <div className="w-full space-y-3">
              {chartData.map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-black" style={{ backgroundColor: d.color }} /><span className="text-xs font-bold text-black uppercase">{d.label}</span></div>
                  <span className="text-sm font-black text-black">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Tasks */}
        <div className="col-span-8 mt-8">
          <h2 className="text-2xl font-black text-black uppercase mb-4 flex items-center gap-3 border-b-4 border-black pb-3">
            <span className="material-symbols-outlined text-2xl">bolt</span> MY TASKS
          </h2>
          <div className="neo-card-static p-0 overflow-hidden">
            {myTasks.length > 0 ? myTasks.map((task) => {
              const daysLeft = task.due_date ? Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000) : null;
              return (
                <Link key={task.id} to={`/projects/${task.project_id}`}
                  className="flex items-center px-5 py-4 border-b-2 border-black last:border-b-0 hover:bg-zinc-100 transition-colors">
                  <div className="w-8 h-8 border-2 border-black flex items-center justify-center mr-4 shrink-0 bg-white">
                    <span className="material-symbols-outlined text-sm text-black">
                      {task.status === 'done' ? 'check' : task.status === 'in_progress' ? 'pending' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-black truncate uppercase">{task.title}</p><p className="text-[11px] text-black/50 font-bold">{task.project_name}</p></div>
                  <span className={`neo-badge ${priorityBg[task.priority] || 'bg-zinc-200'}`}>{task.priority}</span>
                  <div className="w-20 text-right ml-3">
                    {daysLeft !== null ? (daysLeft < 0 ? <span className="text-[11px] font-black text-red-500 uppercase">OVERDUE</span> : daysLeft <= 3 ? <span className="text-[11px] font-black text-amber-600">{daysLeft}D LEFT</span> : <span className="text-[11px] text-black/50 font-bold">{new Date(task.due_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>) : <span className="text-[11px] text-black/50">—</span>}
                  </div>
                </Link>
              );
            }) : <div className="px-5 py-10 text-center text-black/40 text-sm font-bold uppercase">No tasks assigned yet</div>}
          </div>
        </div>

        {/* Tasks per user */}
        {data.tasksByUser && data.tasksByUser.length > 0 && (
          <div className="col-span-12 mt-8">
            <h2 className="text-2xl font-black text-black uppercase mb-4 flex items-center gap-3 border-b-4 border-black pb-3">
              <span className="material-symbols-outlined text-2xl">groups</span> TEAM WORKLOAD
            </h2>
            <div className="neo-card-static p-0 overflow-hidden">
              {data.tasksByUser.map(u => {
                const total = Number(u.total); const done = Number(u.done); const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={u.id} className="flex items-center px-5 py-4 border-b-2 border-black last:border-b-0">
                    <div className="w-10 h-10 bg-[#ffff00] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mr-4 shrink-0">
                      <span className="text-xs font-black text-black">{u.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}</span>
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-bold text-black uppercase">{u.name}</p><p className="text-[11px] text-black/50 font-bold">{u.done} done · {u.in_progress} active · {u.todo} pending</p></div>
                    <div className="w-32 flex items-center gap-2 ml-4">
                      <div className="flex-1 h-3 overflow-hidden bg-zinc-200 border-2 border-black"><div className="h-full bg-[#00fbfb]" style={{ width: `${pct}%` }} /></div>
                      <span className="text-xs font-black text-black w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {totalTasks === 0 && (
        <div className="neo-card-static p-16 text-center mt-8">
          <div className="w-16 h-16 bg-[#ffff00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-black text-3xl">checklist</span>
          </div>
          <h3 className="text-2xl font-black text-black uppercase mb-2">NO TASKS YET</h3>
          <p className="text-sm text-black/60 font-bold max-w-sm mx-auto">Create a project and start adding tasks to see your dashboard.</p>
          <Link to="/projects"><button className="neo-btn neo-btn-yellow px-8 py-3 mt-6 font-black text-[15px]">GO TO PROJECTS</button></Link>
        </div>
      )}
    </div>
  );
}
