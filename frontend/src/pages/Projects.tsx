import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Project { id: string; name: string; description: string | null; owner_id: string; created_at: string; my_role: string; member_count: string; task_count: string; }

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]); const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false); const [creating, setCreating] = useState(false);
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'member'>('all');

  useEffect(() => { loadProjects(); }, []);
  async function loadProjects() { try { const { data } = await api.get('/api/projects'); setProjects(data); } finally { setLoading(false); } }
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim()) return; setCreating(true);
    try { await api.post('/api/projects', { name, description }); setDialogOpen(false); setName(''); setDescription(''); await loadProjects(); } finally { setCreating(false); }
  }
  const filtered = projects.filter(p => filter === 'admin' ? p.my_role === 'admin' : filter === 'member' ? p.my_role === 'member' : true);

  if (loading) return <div className="p-8 w-full"><div className="animate-pulse space-y-6"><div className="h-10 w-60 neo-card-static" /><div className="grid grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-48 neo-card-static" />)}</div></div></div>;

  return (
    <div className="w-full flex-1 bg-[#f9f9f9]">
      <div className="p-8 pb-0">
        <div className="flex items-end justify-between mb-2 border-b-4 border-black pb-6">
          <div>
            <h1 className="text-[64px] font-black text-black uppercase leading-none tracking-tighter">PROJECTS</h1>
            <p className="text-xl text-black/60 font-bold mt-2">Manage your workspaces</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="neo-btn px-6 py-3 font-black text-[15px] flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-xl">add</span>CREATE
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md !rounded-none border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase">CREATE PROJECT</DialogTitle>
                <DialogDescription className="font-bold text-black/60">Add a new project to organize your team's work.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6 mt-4">
                <div className="space-y-2 relative">
                  <Label className="neo-label bg-[#ffff00]">PROJECT NAME</Label>
                  <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Mobile App Redesign" className="neo-input py-3.5 px-5 text-sm font-bold uppercase" />
                </div>
                <div className="space-y-2">
                  <Label className="neo-label bg-[#ffd7f5]">DESCRIPTION</Label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What is this project about?" className="neo-input px-5 py-3.5 text-sm font-medium resize-none" />
                </div>
                <DialogFooter className="gap-3">
                  <button type="button" onClick={() => setDialogOpen(false)} className="border-2 border-black px-5 py-2.5 text-sm font-bold uppercase hover:bg-zinc-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={creating} className="neo-btn neo-btn-yellow px-6 py-2.5 text-sm font-black flex items-center gap-2 uppercase">
                    {creating ? <><Loader2 className="h-4 w-4 animate-spin" />CREATING…</> : 'CREATE'}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-3 mt-6 mb-6">
          {[{ key: 'all', label: 'ALL' }, { key: 'admin', label: 'OWNED' }, { key: 'member', label: 'MEMBER' }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
              className={`px-5 py-2.5 border-2 border-black text-xs font-black uppercase transition-all active:translate-x-1 active:translate-y-1 ${
                filter === f.key
                  ? 'bg-[#ffff00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100'
              }`}>
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-black/50 font-black self-center uppercase">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="px-8 pb-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(project => (
              <Link key={project.id} to={`/projects/${project.id}`} className="group">
                <article className="neo-card p-6 flex flex-col gap-4 h-full cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-[#a3e635] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                      <span className="material-symbols-outlined text-black text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
                    </div>
                    <span className={`neo-badge ${project.my_role === 'admin' ? 'bg-[#00fbfb]' : 'bg-zinc-200'}`}>
                      {project.my_role === 'admin' ? 'OWNER' : 'MEMBER'}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-black text-black uppercase mb-1">{project.name}</h3>
                    {project.description && <p className="text-sm text-black/60 line-clamp-2 font-medium">{project.description}</p>}
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t-2 border-black">
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-black/50">group</span><span className="text-xs font-bold text-black/60">{project.member_count}</span></div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-black/50">task</span><span className="text-xs font-bold text-black/60">{project.task_count}</span></div>
                    <span className="ml-auto text-[11px] text-black/40 font-bold">{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="neo-card-static p-16 text-center">
            <div className="w-16 h-16 bg-[#ffff00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-black text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
            </div>
            <h3 className="text-2xl font-black text-black uppercase mb-2">NO PROJECTS YET</h3>
            <p className="text-sm text-black/60 font-bold max-w-sm mx-auto mb-6">Create your first project to get started.</p>
            <button onClick={() => setDialogOpen(true)} className="neo-btn neo-btn-yellow px-6 py-3 font-black text-[15px] flex items-center gap-2 mx-auto uppercase"><span className="material-symbols-outlined text-xl">add</span>CREATE FIRST PROJECT</button>
          </div>
        )}
      </div>
    </div>
  );
}
