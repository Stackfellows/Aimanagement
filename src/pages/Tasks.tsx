import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, CheckCircle, Clock, Calendar, Tag, ChevronDown, ChevronUp, AlertCircle, Wand2, Sparkles, Loader2 } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'Medium', 
    status: 'Pending',
    category: 'Work',
    dueDate: ''
  });
  
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      await api.post('/tasks', newTask);
      setNewTask({ title: '', description: '', priority: 'Medium', status: 'Pending', category: 'Work', dueDate: '' });
      setIsFormOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };
  
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      // 1. Parse with AI
      const parseRes = await api.post('/ai/parse-task', { prompt: aiInput });
      const parsedTask = parseRes.data;
      
      // 2. Create Task
      await api.post('/tasks', {
        title: parsedTask.title || aiInput,
        description: parsedTask.description || '',
        priority: parsedTask.priority || 'Medium',
        category: parsedTask.category || 'Work',
        dueDate: parsedTask.dueDate || '',
        status: 'Pending'
      });
      
      setAiInput('');
      fetchTasks();
    } catch (err) {
      console.error('AI Task Creation failed', err);
      alert('Failed to parse task via AI. Please try again or use the manual form.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const updateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedTaskId === id) setExpandedTaskId(null);
    else setExpandedTaskId(id);
  };

  const getDateStatus = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    if (diffDays === 0) return { label: 'Due Today', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
    if (diffDays === 1) return { label: 'Due Tomorrow', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    return { label: `Due in ${diffDays} days`, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-foreground/60 bg-foreground/5 border-border';
    }
  };

  if (loading) return <div className="p-6 flex items-center justify-center text-foreground/50 h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Task Center
            </h1>
          </div>
          <p className="text-foreground/60 text-base max-w-lg">Manage your daily priorities or let our AI automatically schedule your unstructured tasks.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-card text-foreground border border-border px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-foreground/5 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {isFormOpen ? 'Close Form' : <><Plus className="w-4 h-4" /> Manual Entry</>}
        </button>
      </div>

      {/* AI Magic Input */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
        <form onSubmit={handleAiSubmit} className="relative flex items-center bg-card border border-border/50 rounded-2xl p-2 shadow-lg backdrop-blur-xl">
          <div className="pl-4 pr-3 text-primary">
            {aiLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
          </div>
          <input 
            type="text"
            className="flex-1 bg-transparent border-none text-foreground px-2 py-3 focus:outline-none placeholder:text-foreground/40 text-base"
            placeholder="Type 'Remind me to call John tomorrow at 5pm high priority'..."
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            disabled={aiLoading}
          />
          <button 
            type="submit"
            disabled={aiLoading || !aiInput.trim()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Generate
          </button>
        </form>
      </div>

      {isFormOpen && (
        <div className="bg-card/80 backdrop-blur-md border border-border rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-foreground">
            <Plus className="w-5 h-5 text-primary" /> Manual Task Creation
          </h2>
          <form onSubmit={handleCreateTask} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Task Title</label>
              <input 
                type="text" 
                required
                className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                placeholder="e.g. Prepare Q3 Financial Report"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Category</label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <select 
                    className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    value={newTask.category}
                    onChange={e => setNewTask({...newTask, category: e.target.value})}
                  >
                    <option>Work</option>
                    <option>Personal</option>
                    <option>Meeting</option>
                    <option>Study</option>
                    <option>Health</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Priority</label>
                <div className="relative">
                  <AlertCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <select 
                    className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Due Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input 
                    type="date" 
                    className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Description (Optional)</label>
              <textarea 
                className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-y"
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
                placeholder="Add context, sub-tasks, or notes here..."
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20">
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {tasks.map((task, idx) => {
          const isExpanded = expandedTaskId === task._id;
          const dateStatus = getDateStatus(task.dueDate);
          
          return (
            <div 
              key={task._id} 
              className={`group bg-card/60 backdrop-blur-md border rounded-2xl shadow-sm transition-all duration-300 overflow-hidden ${task.status === 'Completed' ? 'border-border/30 opacity-60 grayscale-[0.5]' : 'border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5'}`}
              style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <button 
                    onClick={() => updateStatus(task._id, task.status)}
                    className={`mt-1 sm:mt-0 p-2.5 rounded-full transition-all shrink-0 ${task.status === 'Completed' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-background border border-border text-foreground/30 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/30'}`}
                  >
                    {task.status === 'Completed' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </button>
                  
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(task._id)}>
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <h3 className={`font-bold truncate text-base tracking-tight ${task.status === 'Completed' ? 'line-through text-foreground/40' : 'text-foreground'}`}>
                        {task.title}
                      </h3>
                      {task.category && (
                        <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-foreground/5 text-foreground/70 border border-foreground/10">
                          {task.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border bg-opacity-20 ${getPriorityColor(task.priority)}`}>
                        {task.priority} Priority
                      </span>
                      
                      {dateStatus && task.status !== 'Completed' && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border bg-opacity-20 flex items-center gap-1.5 ${dateStatus.color}`}>
                          <Calendar className="w-3.5 h-3.5" /> {dateStatus.label}
                        </span>
                      )}
                      
                      {task.status === 'Completed' && task.dueDate && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg border border-border/50 text-foreground/40 bg-foreground/5">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {task.description && (
                    <button onClick={() => toggleExpand(task._id)} className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  )}
                  <button onClick={() => handleDelete(task._id)} className="text-red-500/40 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {isExpanded && task.description && (
                <div className="px-5 pb-5 pt-3 border-t border-border/30 bg-background/30">
                  <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Description / Notes
                  </h4>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed font-medium">
                    {task.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        
        {tasks.length === 0 && !loading && (
          <div className="text-center py-20 px-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Your slate is clean!</h3>
            <p className="text-foreground/60 text-sm max-w-sm mx-auto mb-8">
              Type a task in the AI Magic bar above to get started instantly, or click Manual Entry if you prefer the old-fashioned way.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
