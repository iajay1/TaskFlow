import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface Member { id: string; name: string; email: string; role: string; }
interface Task { id: string; project_id: string; title: string; description: string | null; status: string; priority: string; assigned_to: string | null; assigned_to_name: string | null; due_date: string | null; [key: string]: any; }
interface Comment { id: string; content: string; user_name: string; created_at: string; user_id: string; }
interface Subtask { id: string; title: string; completed: boolean; }

export default function TaskEditModal({ task, members, onClose, onUpdated, onDeleted, isAdmin, userId }: {
  task: Task; members: Member[]; onClose: () => void; onUpdated: (t: Task) => void; onDeleted: (id: string) => void; isAdmin: boolean; userId: string;
}) {
  const [title, setTitle] = useState(task.title); const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority); const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || ''); const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '');
  const [saving, setSaving] = useState(false); const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState(''); const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState(''); const [tab, setTab] = useState<'details' | 'comments' | 'subtasks'>('details');

  useEffect(() => {
    api.get(`/api/comments?task_id=${task.id}`).then(r => setComments(r.data)).catch(() => {});
    api.get(`/api/subtasks?task_id=${task.id}`).then(r => setSubtasks(r.data)).catch(() => {});
  }, [task.id]);

  const canEdit = isAdmin || task.assigned_to === userId;

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await api.put(`/api/tasks/${task.id}`, { title, description: description || undefined, priority, status, assigned_to: assignedTo || undefined, due_date: dueDate || undefined });
      data.subtask_count = String(subtasks.length); data.subtask_done = String(subtasks.filter(s => s.completed).length); data.comment_count = String(comments.length);
      if (data.assigned_to) { const m = members.find(m => m.id === data.assigned_to); data.assigned_to_name = m?.name || task.assigned_to_name; }
      onUpdated(data);
    } catch { } finally { setSaving(false); }
  }

  async function handleDelete() { if (!window.confirm('Delete this task permanently?')) return; try { await api.delete(`/api/tasks/${task.id}`); onDeleted(task.id); } catch { } }
  async function addComment() { if (!newComment.trim()) return; try { const { data } = await api.post('/api/comments', { task_id: task.id, content: newComment }); setComments(prev => [...prev, data]); setNewComment(''); } catch { } }
  async function addSubtask() { if (!newSubtask.trim()) return; try { const { data } = await api.post('/api/subtasks', { task_id: task.id, title: newSubtask }); setSubtasks(prev => [...prev, data]); setNewSubtask(''); } catch { } }
  async function toggleSubtask(id: string) { try { const { data } = await api.patch(`/api/subtasks/${id}`); setSubtasks(prev => prev.map(s => s.id === id ? data : s)); } catch { } }
  async function deleteSubtask(id: string) { try { await api.delete(`/api/subtasks/${id}`); setSubtasks(prev => prev.filter(s => s.id !== id)); } catch { } }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl !rounded-none border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white max-h-[85vh] flex flex-col">
        <DialogHeader><DialogTitle className="text-2xl font-black uppercase">TASK DETAILS</DialogTitle></DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['details', 'comments', 'subtasks'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 border-2 border-black text-xs font-black uppercase transition-all active:translate-x-1 active:translate-y-1 flex-1 ${
                tab === t ? 'bg-[#ffff00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}>
              {t === 'details' ? 'DETAILS' : t === 'comments' ? `COMMENTS (${comments.length})` : `SUBTASKS (${subtasks.filter(s=>s.completed).length}/${subtasks.length})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-2 min-h-0">
          {tab === 'details' && (
            <div className="space-y-4">
              <div><label className="neo-label bg-[#ffff00]">TITLE</label>
                <input value={title} onChange={e => setTitle(e.target.value)} disabled={!canEdit} className="neo-input py-3.5 px-5 text-sm font-bold uppercase disabled:opacity-50" /></div>
              <div><label className="neo-label bg-[#ffd7f5]">DESCRIPTION</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={!canEdit} rows={3} className="neo-input px-5 py-3.5 text-sm font-medium resize-none disabled:opacity-50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="neo-label bg-[#a3e635]">STATUS</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} disabled={!canEdit} className="neo-input py-3.5 px-5 text-sm font-bold uppercase">
                    <option value="todo">TO DO</option><option value="in_progress">IN PROGRESS</option><option value="done">DONE</option></select></div>
                <div><label className="neo-label bg-[#00fbfb]">PRIORITY</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} disabled={!canEdit} className="neo-input py-3.5 px-5 text-sm font-bold uppercase">
                    <option value="low">LOW</option><option value="medium">MEDIUM</option><option value="high">HIGH</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="neo-label bg-white">ASSIGN TO</label>
                  <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} disabled={!canEdit} className="neo-input py-3.5 px-5 text-sm font-bold">
                    <option value="">UNASSIGNED</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                <div><label className="neo-label bg-white">DUE DATE</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={!canEdit} className="neo-input py-3.5 px-5 text-sm font-bold" /></div>
              </div>
            </div>
          )}
          {tab === 'comments' && (
            <div className="space-y-3">
              {comments.length === 0 && <p className="text-black/40 text-sm text-center py-8 font-bold uppercase">No comments yet</p>}
              {comments.map(c => (
                <div key={c.id} className="border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <div className="flex justify-between items-center mb-1"><span className="text-xs font-black text-black uppercase">{c.user_name}</span><span className="text-[10px] text-black/40 font-bold">{new Date(c.created_at).toLocaleString()}</span></div>
                  <p className="text-sm text-black">{c.content}</p>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="ADD A COMMENT..." className="neo-input flex-1 py-2.5 px-5 text-sm font-bold uppercase" onKeyDown={e => { if (e.key === 'Enter') addComment(); }} />
                <button onClick={addComment} className="neo-btn neo-btn-yellow px-5 py-2.5 text-sm font-black uppercase">POST</button>
              </div>
            </div>
          )}
          {tab === 'subtasks' && (
            <div className="space-y-2">
              {subtasks.length === 0 && <p className="text-black/40 text-sm text-center py-8 font-bold uppercase">No subtasks yet</p>}
              {subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-3 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <button onClick={() => toggleSubtask(s.id)} className={`w-6 h-6 border-2 border-black flex items-center justify-center transition-colors ${s.completed ? 'bg-[#00fbfb]' : 'bg-white hover:bg-zinc-100'}`}>
                    {s.completed && <span className="material-symbols-outlined text-black text-sm font-bold">check</span>}
                  </button>
                  <span className={`flex-1 text-sm font-bold ${s.completed ? 'line-through text-black/40' : 'text-black'}`}>{s.title}</span>
                  <button onClick={() => deleteSubtask(s.id)} className="material-symbols-outlined text-lg text-black/30 hover:text-red-500 transition-colors">close</button>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)} placeholder="ADD SUBTASK..." className="neo-input flex-1 py-2.5 px-5 text-sm font-bold uppercase" onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }} />
                <button onClick={addSubtask} className="neo-btn neo-btn-yellow px-5 py-2.5 text-sm font-black uppercase">ADD</button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between pt-4 border-t-4 border-black">
          <div>{isAdmin && <button onClick={handleDelete} className="border-2 border-red-500 text-red-500 px-4 py-2 text-sm font-black uppercase hover:bg-red-50 transition-colors">DELETE TASK</button>}</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="border-2 border-black px-5 py-2.5 text-sm font-black uppercase hover:bg-zinc-100 transition-colors">CANCEL</button>
            {canEdit && <button onClick={handleSave} disabled={saving} className="neo-btn neo-btn-yellow px-6 py-2.5 text-sm font-black flex items-center gap-2 uppercase">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />SAVING…</> : 'SAVE CHANGES'}</button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
