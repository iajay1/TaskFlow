import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api/axios';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import TaskEditModal from '../components/TaskEditModal';

interface Member { id: string; name: string; email: string; role: string; joined_at: string; }
interface Project { id: string; name: string; description: string | null; owner_id: string; my_role: string; members: Member[]; }
interface Task { id: string; project_id: string; title: string; description: string | null; status: string; priority: string; assigned_to: string | null; assigned_to_name: string | null; created_by: string; created_by_name: string | null; due_date: string | null; created_at: string; subtask_count?: string; subtask_done?: string; comment_count?: string; }
interface Activity { id: string; action: string; details: string; user_name: string; created_at: string; }

const STATUS_COLUMNS = ['todo', 'in_progress', 'done'] as const;
const STATUS_LABELS: Record<string, string> = { todo: 'TO DO', in_progress: 'IN PROGRESS', done: 'DONE' };
const COL_COLORS: Record<string, string> = { todo: 'bg-[#ffabf3]', in_progress: 'bg-[#ffff00]', done: 'bg-[#00fbfb]' };
const PRIORITY_BG: Record<string, string> = { high: 'bg-red-400 text-white', medium: 'bg-[#ffff00] text-black', low: 'bg-[#00fbfb] text-black' };

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>(); const { user } = useAuth(); const { toast } = useToast(); const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null); const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true); const [showAddTask, setShowAddTask] = useState(false);
  const [showInvite, setShowInvite] = useState(false); const [editTask, setEditTask] = useState<Task | null>(null);
  const [search, setSearch] = useState(''); const [filterPriority, setFilterPriority] = useState('');
  const [showActivity, setShowActivity] = useState(false); const [activities, setActivities] = useState<Activity[]>([]);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null); const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  async function load() { try { const [p, t] = await Promise.all([api.get(`/api/projects/${id}`), api.get(`/api/tasks?project_id=${id}`)]); setProject(p.data); setTasks(t.data); } finally { setLoading(false); } }
  useEffect(() => { load(); }, [id]);
  const isAdmin = project?.my_role === 'admin';

  async function changeStatus(taskId: string, newStatus: string) {
    try { await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus }); setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)); toast('Status updated', 'success'); }
    catch { toast('Failed to update', 'error'); }
  }
  async function deleteProject() { if (!window.confirm(`Delete "${project?.name}"? This cannot be undone.`)) return; try { await api.delete(`/api/projects/${id}`); toast('Project deleted', 'success'); navigate('/projects'); } catch { toast('Failed', 'error'); } }
  async function exportCSV() { try { const r = await api.get(`/api/projects/${id}/export`, { responseType: 'blob' }); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.data])); a.download = `${project?.name}_export.csv`; a.click(); toast('Exported', 'success'); } catch { toast('Failed', 'error'); } }
  async function loadActivity() { try { const { data } = await api.get(`/api/activity?project_id=${id}`); setActivities(data); setShowActivity(true); } catch { toast('Failed', 'error'); } }

  function onDragStart(e: React.DragEvent, taskId: string) { setDragTaskId(taskId); e.dataTransfer.effectAllowed = 'move'; }
  function onDragOver(e: React.DragEvent, col: string) { e.preventDefault(); setDragOverCol(col); }
  function onDragLeave() { setDragOverCol(null); }
  function onDrop(e: React.DragEvent, targetStatus: string) { e.preventDefault(); if (dragTaskId) { const t = tasks.find(x => x.id === dragTaskId); if (t && t.status !== targetStatus) changeStatus(dragTaskId, targetStatus); } setDragTaskId(null); setDragOverCol(null); }

  const filtered = tasks.filter(t => { if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false; if (filterPriority && t.priority !== filterPriority) return false; return true; });

  if (loading) return <div className="p-8 animate-pulse"><div className="h-12 w-64 neo-card-static mb-4" /><div className="h-[500px] neo-card-static" /></div>;
  if (!project) return null;

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-[#f9f9f9] overflow-hidden" style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNlNWU1ZTUiLz48L3N2Zz4=")` }}>
      {/* Header */}
      <div className="px-8 py-5 flex items-center justify-between shrink-0 border-b-4 border-black bg-white">
        <div>
          <Link to="/projects" className="text-xs font-black text-black/50 hover:text-black transition-colors inline-flex items-center gap-1 mb-1 uppercase">
            <span className="material-symbols-outlined text-sm">arrow_back</span>PROJECTS
          </Link>
          <h2 className="text-[48px] font-black text-black uppercase leading-none tracking-tighter">{project.name}</h2>
          {project.description && <p className="text-base text-black/60 font-bold mt-1">{project.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {/* Member avatars */}
          <div className="flex -space-x-1 mr-2">
            {project.members.slice(0, 4).map(m => (
              <div key={m.id} className="w-9 h-9 bg-[#ffff00] border-2 border-black flex items-center justify-center text-[10px] font-black text-black" title={m.name}>
                {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            ))}
          </div>
          <button onClick={loadActivity} className="neo-btn-sm neo-btn-white px-3 py-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all" title="Activity"><span className="material-symbols-outlined text-lg text-black">history</span></button>
          <button onClick={exportCSV} className="neo-btn-sm neo-btn-white px-3 py-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all" title="Export"><span className="material-symbols-outlined text-lg text-black">download</span></button>
          {isAdmin && (<>
            <button onClick={() => setShowInvite(true)} className="neo-btn neo-btn-white px-4 py-2 text-xs font-black uppercase border-4">INVITE</button>
            <button onClick={() => setShowAddTask(true)} className="neo-btn px-4 py-2 text-xs font-black flex items-center gap-1 uppercase border-4"><span className="material-symbols-outlined text-lg">add</span>TASK</button>
            <button onClick={deleteProject} className="border-2 border-black p-2 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-100 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none" title="Delete"><span className="material-symbols-outlined text-lg text-red-500">delete</span></button>
          </>)}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-8 py-4 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 border-4 border-black bg-white px-4 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 max-w-xs">
          <span className="material-symbols-outlined text-lg text-black">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH TASKS..." className="bg-transparent border-none text-sm text-black placeholder-black/30 focus:outline-none w-full font-bold uppercase" />
        </div>
        <div className="flex gap-2">
          {['high', 'medium', 'low'].map(p => (
            <button key={p} onClick={() => setFilterPriority(filterPriority === p ? '' : p)}
              className={`px-4 py-2 border-2 border-black text-[11px] font-black uppercase transition-all active:translate-x-1 active:translate-y-1 ${
                filterPriority === p
                  ? `${PRIORITY_BG[p]} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                  : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100'
              }`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 grid grid-cols-3 gap-6 px-8 pb-6 overflow-hidden">
        {STATUS_COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col);
          return (
            <div key={col} className={`flex flex-col h-full border-4 border-black bg-white overflow-hidden ${dragOverCol === col ? 'bg-zinc-100' : ''}`}
              onDragOver={e => onDragOver(e, col)} onDragLeave={onDragLeave} onDrop={e => onDrop(e, col)}>
              {/* Column header */}
              <div className={`${COL_COLORS[col]} border-b-4 border-black p-4 flex justify-between items-center`}>
                <h3 className="text-2xl font-black text-black uppercase">{STATUS_LABELS[col]}</h3>
                <span className="neo-count">{colTasks.length}</span>
              </div>
              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colTasks.map(task => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                  const daysLeft = task.due_date ? Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000) : null;
                  return (
                    <article key={task.id} draggable onDragStart={e => onDragStart(e, task.id)}
                      className={`bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${dragTaskId === task.id ? 'opacity-40 scale-95' : ''} ${col === 'done' ? 'bg-zinc-200 opacity-80 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}
                      onClick={() => setEditTask(task)}>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <span className={`neo-badge ${PRIORITY_BG[task.priority] || 'bg-zinc-200'}`}>{task.priority}</span>
                        {isOverdue && <span className="neo-badge bg-red-500 text-white animate-pulse">LATE</span>}
                      </div>
                      <h4 className={`text-base font-bold text-black mb-2 leading-tight ${col === 'done' ? 'line-through decoration-4' : ''}`}>{task.title}</h4>
                      {task.description && <p className="text-xs text-black/60 line-clamp-2 mb-3 font-medium">{task.description}</p>}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-black">
                        <div className="flex items-center gap-2">
                          {task.assigned_to_name ? (
                            <div className="w-7 h-7 border-2 border-black bg-[#a3e635] flex items-center justify-center text-[9px] font-black text-black">
                              {task.assigned_to_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                            </div>
                          ) : <span className="text-[10px] text-black/30 font-bold">NONE</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-black/50 font-bold">
                          {Number(task.comment_count) > 0 && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">chat</span>{task.comment_count}</span>}
                          {Number(task.subtask_count) > 0 && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">check_box</span>{task.subtask_done}/{task.subtask_count}</span>}
                          {daysLeft !== null && daysLeft > 0 && daysLeft <= 3 && col !== 'done' && <span className="text-amber-600 font-black">{daysLeft}D</span>}
                          {task.due_date && !isOverdue && (daysLeft === null || daysLeft > 3) && <span>{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {colTasks.length === 0 && <div className="border-2 border-dashed border-black/30 p-8 text-center text-xs text-black/30 font-black uppercase">DROP TASKS HERE</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {editTask && <TaskEditModal task={editTask} members={project.members} isAdmin={isAdmin} userId={user?.id || ''}
        onClose={() => setEditTask(null)} onUpdated={t => { setTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x)); setEditTask(null); toast('Updated', 'success'); }}
        onDeleted={tid => { setTasks(prev => prev.filter(x => x.id !== tid)); setEditTask(null); toast('Deleted', 'success'); }} />}

      {showAddTask && <AddTaskModal projectId={id!} members={project.members} onClose={() => setShowAddTask(false)}
        onCreated={t => { setTasks(prev => [...prev, t]); setShowAddTask(false); toast('Created', 'success'); }} />}

      {showInvite && <InviteModal projectId={id!} onClose={() => setShowInvite(false)} onInvited={() => { setShowInvite(false); load(); toast('Invited', 'success'); }} />}

      {showActivity && (
        <Dialog open onOpenChange={() => setShowActivity(false)}>
          <DialogContent className="sm:max-w-lg !rounded-none border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white max-h-[80vh] flex flex-col">
            <DialogHeader><DialogTitle className="text-2xl font-black uppercase">ACTIVITY LOG</DialogTitle></DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {activities.length === 0 && <p className="text-black/40 text-center py-8 text-sm font-bold uppercase">No activity yet</p>}
              {activities.map(a => (
                <div key={a.id} className="border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3 bg-white">
                  <span className="material-symbols-outlined text-lg text-black mt-0.5">{a.action.includes('created') ? 'add_circle' : a.action.includes('deleted') ? 'remove_circle' : a.action.includes('status') ? 'swap_horiz' : 'edit'}</span>
                  <div><p className="text-sm text-black"><span className="font-black">{a.user_name}</span> {a.details}</p><p className="text-[10px] text-black/40 font-bold">{new Date(a.created_at).toLocaleString()}</p></div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AddTaskModal({ projectId, members, onClose, onCreated }: { projectId: string; members: Member[]; onClose: () => void; onCreated: (t: Task) => void }) {
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState(''); const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState(''); const [due, setDue] = useState(''); const [creating, setCreating] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); if (!title.trim()) return; setCreating(true);
    try { const { data } = await api.post('/api/tasks', { project_id: projectId, title, description: desc || undefined, priority, assigned_to: assignee || undefined, due_date: due || undefined }); onCreated(data); } catch {} finally { setCreating(false); } }
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg !rounded-none border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white">
        <DialogHeader><DialogTitle className="text-2xl font-black uppercase">CREATE TASK</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div><label className="neo-label bg-[#ffff00]">TITLE</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="neo-input py-3.5 px-5 text-sm font-bold uppercase" /></div>
          <div><label className="neo-label bg-[#ffd7f5]">DESCRIPTION</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="neo-input px-5 py-3.5 text-sm font-medium resize-none" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="neo-label bg-[#a3e635]">PRIORITY</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="neo-input py-3.5 px-4 text-sm font-bold uppercase"><option value="low">LOW</option><option value="medium">MEDIUM</option><option value="high">HIGH</option></select></div>
            <div><label className="neo-label bg-[#00fbfb]">ASSIGN</label>
              <select value={assignee} onChange={e => setAssignee(e.target.value)} className="neo-input py-3.5 px-4 text-sm font-bold"><option value="">—</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <div><label className="neo-label bg-white">DUE</label>
              <input type="date" value={due} onChange={e => setDue(e.target.value)} className="neo-input py-3.5 px-4 text-sm font-bold" /></div>
          </div>
          <DialogFooter className="gap-3">
            <button type="button" onClick={onClose} className="border-2 border-black px-5 py-2.5 text-sm font-black uppercase hover:bg-zinc-100 transition-colors">CANCEL</button>
            <button type="submit" disabled={creating} className="neo-btn neo-btn-yellow px-6 py-2.5 text-sm font-black flex items-center gap-2 uppercase">{creating ? <><Loader2 className="h-4 w-4 animate-spin" />CREATING…</> : 'CREATE'}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InviteModal({ projectId, onClose, onInvited }: { projectId: string; onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState(''); const [role, setRole] = useState('member'); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  async function submit(e: React.FormEvent) { e.preventDefault(); if (!email.trim()) return; setError(''); setLoading(true);
    try { await api.post(`/api/projects/${projectId}/members`, { email, role }); onInvited(); } catch (err: any) { setError(err.response?.data?.error || 'Failed'); } finally { setLoading(false); } }
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md !rounded-none border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white">
        <DialogHeader><DialogTitle className="text-2xl font-black uppercase">INVITE MEMBER</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          {error && <div className="border-4 border-black bg-red-100 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"><span className="material-symbols-outlined text-red-600 text-lg">error</span><span className="text-sm font-bold text-red-600 uppercase">{error}</span></div>}
          <div><label className="neo-label bg-[#ffff00]">EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="neo-input py-3.5 px-5 text-sm font-bold uppercase" /></div>
          <div><label className="neo-label bg-[#00fbfb]">ROLE</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="neo-input py-3.5 px-5 text-sm font-bold uppercase"><option value="member">MEMBER</option><option value="admin">ADMIN</option></select></div>
          <DialogFooter className="gap-3">
            <button type="button" onClick={onClose} className="border-2 border-black px-5 py-2.5 text-sm font-black uppercase hover:bg-zinc-100 transition-colors">CANCEL</button>
            <button type="submit" disabled={loading} className="neo-btn neo-btn-yellow px-6 py-2.5 text-sm font-black flex items-center gap-2 uppercase">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />INVITING…</> : 'INVITE'}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
