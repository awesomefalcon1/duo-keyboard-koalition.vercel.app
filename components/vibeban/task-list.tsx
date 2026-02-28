'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { wouldCreateCycle } from '@/lib/vibeban/prerequisites';
import { TaskCard, TASK_TYPES } from './task-card';
import { TopologicalGraph, computeLayers } from './topological-graph';
import type { Task, Prerequisite, TaskRequirement } from '@/lib/vibeban/types';
import { TASK_TYPE_OPTIONS } from '@/lib/vibeban/types';

const supabase = createClient();

interface TaskListProps {
    projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
    const [requirements, setRequirements] = useState<TaskRequirement[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentBank, setCurrentBank] = useState(0);

    // Modal state — null = closed, 'new' = create, Task = editing
    const [modalTask, setModalTask] = useState<Task | 'new' | null>(null);
    const [viewTask, setViewTask] = useState<Task | null>(null);

    // Form state (shared by create & edit)
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState('task');
    const [formUrgency, setFormUrgency] = useState('medium');
    const [formPriority, setFormPriority] = useState('medium');
    const [formAssigneeId, setFormAssigneeId] = useState<string | null>(null);
    const [formPrereqIds, setFormPrereqIds] = useState<string[]>([]);
    const [prereqSearch, setPrereqSearch] = useState('');

    useEffect(() => {
        loadTasks();
        loadPrerequisites();
        loadRequirements();

        // Realtime: push updates so all collaborators see changes instantly
        const channel = supabase
            .channel(`vibeban-tasks-${projectId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` }, () => {
                loadTasks();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'task_prerequisites' }, () => {
                loadPrerequisites();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const loadTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });
        if (error) { console.error('Error loading tasks:', error); return; }
        if (data) setTasks(data);
    };

    const loadPrerequisites = async () => {
        const { data: taskIds } = await supabase
            .from('tasks')
            .select('id')
            .eq('project_id', projectId);
        if (!taskIds || taskIds.length === 0) { setPrerequisites([]); return; }
        const ids = taskIds.map(t => t.id);
        const { data, error } = await supabase
            .from('task_prerequisites')
            .select('*')
            .in('task_id', ids);
        if (error) { console.error('Error loading prerequisites:', error); return; }
        if (data) setPrerequisites(data);
    };

    const loadRequirements = async () => {
        const { data: taskIds } = await supabase
            .from('tasks')
            .select('id')
            .eq('project_id', projectId);
        if (!taskIds || taskIds.length === 0) { setRequirements([]); return; }
        const ids = taskIds.map(t => t.id);
        const { data, error } = await supabase
            .from('task_requirements')
            .select('*')
            .in('task_id', ids);
        if (error) { console.error('Error loading requirements:', error); return; }
        if (data) setRequirements(data);
    };

    // Layers
    const layers = useMemo(() => computeLayers(tasks, prerequisites), [tasks, prerequisites]);
    useEffect(() => {
        if (layers.length > 0 && currentBank >= layers.length)
            setCurrentBank(Math.max(0, layers.length - 1));
    }, [layers.length, currentBank]);
    const layer0Tasks = useMemo(() => layers[currentBank] || [], [layers, currentBank]);

    // Filtered tasks for graph and bank view (search + type filter)
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return t.title.toLowerCase().includes(q);
            }
            if (filterType !== 'all' && t.type !== filterType) return false;
            return true;
        });
    }, [tasks, searchQuery, filterType]);

    // Bank view: current bank tasks that also pass search/filter
    const bankViewTaskIds = useMemo(() => new Set(filteredTasks.map(t => t.id)), [filteredTasks]);
    const bankViewTasks = useMemo(
        () => layer0Tasks.filter(t => bankViewTaskIds.has(t.id)),
        [layer0Tasks, bankViewTaskIds]
    );

    type MainView = 'bank' | 'graph';
    const [mainView, setMainView] = useState<MainView>('bank');

    // Helpers
    const getPrereqsForTask = (taskId: string) => prerequisites.filter(p => p.task_id === taskId);
    const isTaskBlocked = (taskId: string) => {
        const prereqs = getPrereqsForTask(taskId);
        if (prereqs.length === 0) return false;
        const prereqTaskIds = prereqs.map(p => p.prerequisite_task_id);
        const prereqTasks = tasks.filter(t => prereqTaskIds.includes(t.id));
        if (prereqTasks.length === 0) return false;
        const incompleteCount = prereqTasks.filter(t => t.status === 'incomplete').length;
        return incompleteCount > 0;
    };

    const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
        const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
        if (error) { console.error('Error updating task:', error); return; }
        setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Delete this task?')) return;
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) { console.error('Error deleting task:', error); return; }
        setTasks(tasks.filter(t => t.id !== taskId));
        setPrerequisites(prerequisites.filter(p => p.task_id !== taskId && p.prerequisite_task_id !== taskId));
        setModalTask(null);
    };

    const handleCreateReview = async (parentTaskId: string) => {
        const parent = tasks.find(t => t.id === parentTaskId);
        if (!parent) return;
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                project_id: projectId,
                title: `Review: ${parent.title}`,
                description: '',
                type: 'review',
                urgency: parent.urgency,
                priority: parent.priority,
                prerequisite_mode: 'all',
                parent_task_id: parentTaskId,
                reporter_id: user?.id ?? null,
            }])
            .select()
            .single();
        if (error) { console.error('Error creating review task:', error); return; }
        if (data) {
            setTasks([data, ...tasks]);
            await loadPrerequisites();
        }
    };

    // ── Modal helpers ──────────────────────────────────────────
    const openCreateModal = () => {
        setFormTitle('');
        setFormDescription('');
        setFormType('task');
        setFormUrgency('medium');
        setFormPriority('medium');
        setFormAssigneeId(user?.id ?? null);
        setFormPrereqIds([]);
        setPrereqSearch('');
        setModalTask('new');
    };

    const openEditModal = (task: Task) => {
        setFormTitle(task.title);
        setFormDescription(task.description || '');
        setFormType(task.type);
        setFormUrgency(task.urgency);
        setFormPriority(task.priority);
        setFormAssigneeId(task.assignee_id ?? null);
        setFormPrereqIds(
            prerequisites.filter(p => p.task_id === task.id).map(p => p.prerequisite_task_id)
        );
        setPrereqSearch('');
        setModalTask(task);
    };

    const closeModal = () => setModalTask(null);

    const handleSaveModal = async () => {
        const title = formTitle.trim();
        if (!title) return;

        if (modalTask === 'new') {
            // ── CREATE ──
            const { data, error } = await supabase
                .from('tasks')
                .insert([{
                    project_id: projectId,
                    title,
                    description: formDescription,
                    type: formType,
                    urgency: formUrgency,
                    priority: formPriority,
                    assignee_id: formAssigneeId || null,
                    reporter_id: user?.id ?? null,
                    prerequisite_mode: 'all',
                }])
                .select()
                .single();

            if (error) { alert(`Error: ${error.message}`); return; }
            if (data) {
                const safePrereqIds = formPrereqIds.filter(
                    (pid) => !wouldCreateCycle(data.id, pid, prerequisites)
                );
                const skipped = formPrereqIds.length - safePrereqIds.length;
                if (skipped > 0) {
                    alert(`${skipped} prerequisite(s) were skipped because they would create a circular dependency.`);
                }
                if (safePrereqIds.length > 0) {
                    await supabase.from('task_prerequisites').insert(
                        safePrereqIds.map((pid) => ({ task_id: data.id, prerequisite_task_id: pid }))
                    );
                }
                setTasks([data, ...tasks]);
                await loadPrerequisites();
            }
        } else if (modalTask) {
            // ── UPDATE ──
            const updates: Partial<Task> = {
                title,
                description: formDescription,
                type: formType as Task['type'],
                urgency: formUrgency as Task['urgency'],
                priority: formPriority as Task['priority'],
                assignee_id: formAssigneeId || null,
                prerequisite_mode: 'all',
            };
            await handleTaskUpdate(modalTask.id, updates);

            // Sync prerequisites
            const existingPrereqIds = prerequisites
                .filter(p => p.task_id === modalTask.id)
                .map(p => p.prerequisite_task_id);
            const toDelete = existingPrereqIds.filter(id => !formPrereqIds.includes(id));
            const toAddRaw = formPrereqIds.filter(id => !existingPrereqIds.includes(id));
            const toAdd = toAddRaw.filter(
                (pid) => !wouldCreateCycle(modalTask.id, pid, prerequisites)
            );
            const skipped = toAddRaw.length - toAdd.length;
            if (skipped > 0) {
                alert(`${skipped} prerequisite(s) were skipped because they would create a circular dependency.`);
            }

            if (toDelete.length > 0) {
                await supabase
                    .from('task_prerequisites')
                    .delete()
                    .eq('task_id', modalTask.id)
                    .in('prerequisite_task_id', toDelete);
            }
            if (toAdd.length > 0) {
                await supabase.from('task_prerequisites').insert(
                    toAdd.map(pid => ({ task_id: modalTask.id, prerequisite_task_id: pid }))
                );
            }
            await loadPrerequisites();
        }
        closeModal();
    };

    // Header Stats
    const total = layer0Tasks.length;
    const completed = layer0Tasks.filter((t: Task) => t.status === 'complete').length;
    const incomplete = total - completed;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const isLayerComplete = total > 0 && incomplete === 0;
    const hasNextLayer = currentBank < layers.length - 1;
    const hasPrevLayer = currentBank > 0;

    // Prereq picker candidates (exclude self, already selected, and any that would create a cycle)
    const prereqCandidates = useMemo(() => {
        const editingId = modalTask && modalTask !== 'new' ? modalTask.id : null;
        return tasks.filter(t => {
            if (t.id === editingId) return false;
            if (formPrereqIds.includes(t.id)) return false;
            if (editingId && wouldCreateCycle(editingId, t.id, prerequisites)) return false;
            if (prereqSearch) return t.title.toLowerCase().includes(prereqSearch.toLowerCase());
            return true;
        });
    }, [tasks, modalTask, formPrereqIds, prereqSearch, prerequisites]);

    return (
        <div className="flex flex-col h-full min-h-0 min-w-0 w-full relative">
            {/* Navbar Controls */}
            <div className="flex-shrink-0 px-5 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="px-2.5 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 w-36"
                />

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="all">All types</option>
                    {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">View:</span>
                    <button
                        onClick={() => setMainView('bank')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${mainView === 'bank' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                        Bank
                    </button>
                    <button
                        onClick={() => setMainView('graph')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${mainView === 'graph' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                        Graph
                    </button>
                </div>
                <div className="flex-1"></div>

                <button
                    onClick={openCreateModal}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-1"
                >
                    <span className="text-sm leading-none">+</span> New Task
                </button>
            </div>

            {/* Bank Header HUD */}
            <div className="flex-shrink-0 z-10 transition-all duration-300 w-full">
                <div className={`w-full px-2 py-4 border-b transition-all duration-300 ${isLayerComplete
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-sm'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'
                    }`}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {hasPrevLayer && (
                                <button
                                    onClick={() => setCurrentBank(currentBank - 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >↓</button>
                            )}
                            <div>
                                <h2 className={`font-bold uppercase tracking-wide text-sm flex items-center gap-2 ${isLayerComplete ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                                    Bank {currentBank + 1}
                                    {isLayerComplete && <span className="animate-bounce">✨</span>}
                                </h2>
                                <p className="text-[10px] text-gray-500">{incomplete} remaining</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-xs mx-4">
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isLayerComplete && hasNextLayer ? (
                                <button onClick={() => setCurrentBank(currentBank + 1)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all shadow-md animate-pulse flex items-center gap-1">
                                    Next Bank ↑
                                </button>
                            ) : (
                                <span className="text-xs font-medium text-gray-400">{Math.round(progress)}%</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════
                TASK CONFIGURATION MODAL (Create + Edit)
               ════════════════════════════════════════════════════ */}
            {modalTask !== null && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-12 px-4" onClick={closeModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {modalTask === 'new' ? '✨ New Task' : '✏️ Edit Task'}
                            </h3>
                            <div className="flex items-center gap-2">
                                {modalTask !== 'new' && (
                                    <button
                                        onClick={() => handleDeleteTask(modalTask.id)}
                                        className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSaveModal(); }}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    value={formDescription}
                                    onChange={e => setFormDescription(e.target.value)}
                                    placeholder="Details, context, acceptance criteria..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Type + Urgency + Priority */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Type</label>
                                    <select value={formType} onChange={e => setFormType(e.target.value)} className="w-full px-2 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white">
                                        {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Urgency</label>
                                    <select value={formUrgency} onChange={e => setFormUrgency(e.target.value)} className="w-full px-2 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white">
                                        <option value="low">🟢 Low</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="high">🟠 High</option>
                                        <option value="critical">🔴 Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Priority</label>
                                    <select value={formPriority} onChange={e => setFormPriority(e.target.value)} className="w-full px-2 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Assignee */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assignee</label>
                                <select
                                    value={formAssigneeId ?? ''}
                                    onChange={e => setFormAssigneeId(e.target.value || null)}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
                                >
                                    <option value="">Unassigned</option>
                                    {user?.id && <option value={user.id}>Me ({user.email})</option>}
                                </select>
                            </div>

                            {/* Prerequisites (all must complete) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Prerequisites</label>

                                {/* Selected prereqs */}
                                {formPrereqIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {formPrereqIds.map(pid => {
                                            const t = tasks.find(tk => tk.id === pid);
                                            return (
                                                <span key={pid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                                    {t?.title || pid.slice(0, 8)}
                                                    <button onClick={() => setFormPrereqIds(formPrereqIds.filter(id => id !== pid))} className="text-blue-400 hover:text-red-500 font-bold">&times;</button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Search to add */}
                                <input
                                    type="text"
                                    value={prereqSearch}
                                    onChange={e => setPrereqSearch(e.target.value)}
                                    placeholder="Search tasks to add as prerequisite..."
                                    className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                {prereqSearch && prereqCandidates.length > 0 && (
                                    <div className="mt-1 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
                                        {prereqCandidates.slice(0, 8).map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => { setFormPrereqIds([...formPrereqIds, t.id]); setPrereqSearch(''); }}
                                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                            >
                                                <span className="text-[10px] text-gray-400 mr-1">{t.type.toUpperCase()}</span> {t.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100 dark:border-gray-700">
                            <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
                            <button
                                onClick={handleSaveModal}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                {modalTask === 'new' ? 'Create Task' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content: Bank view (list) or Full graph */}
            {mainView === 'bank' ? (
                <div className="flex-1 min-h-0 overflow-auto bg-white dark:bg-gray-900">
                    <div className="p-4 max-w-3xl mx-auto">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                            Bank {currentBank + 1} — {bankViewTasks.length} task{bankViewTasks.length !== 1 ? 's' : ''}
                        </h3>
                        {bankViewTasks.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                                <p className="text-sm">No tasks in this bank matching filters.</p>
                                <p className="text-xs mt-1">Add tasks or adjust search/type filter.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {bankViewTasks.map(task => (
                                    <li key={task.id}>
                                        <TaskCard
                                            task={task}
                                            onUpdate={handleTaskUpdate}
                                            onDelete={handleDeleteTask}
                                            onCreateReview={handleCreateReview}
                                            onEdit={openEditModal}
                                            onView={(t) => setViewTask(t)}
                                            currentUserId={user?.id ?? null}
                                            allTasks={tasks}
                                            prerequisites={getPrereqsForTask(task.id)}
                                            onPrerequisitesChanged={loadPrerequisites}
                                            blockedTaskIds={prerequisites.filter(p => p.prerequisite_task_id === task.id).map(p => p.task_id)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ) : (
                <TopologicalGraph
                    tasks={filteredTasks}
                    prerequisites={prerequisites}
                    isTaskBlocked={isTaskBlocked}
                    onUpdate={handleTaskUpdate}
                    onTaskClick={openEditModal}
                    currentBank={currentBank}
                />
            )}

            {/* ════════════════════════════════════════════════════
                READ-ONLY TASK VIEW MODAL
               ════════════════════════════════════════════════════ */}
            {viewTask && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-12 px-4" onClick={() => setViewTask(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{TASK_TYPE_OPTIONS.find(o => o.value === viewTask.type)?.emoji}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                        {viewTask.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium tracking-wide uppercase">
                                        {viewTask.type} • {viewTask.status}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setViewTask(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Meta Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Assignee</p>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {viewTask.assignee_id ? (viewTask.assignee_id === user?.id ? 'Me' : 'Assigned') : 'Unassigned'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Reporter</p>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {viewTask.reporter_id ? (viewTask.reporter_id === user?.id ? 'Me' : '—') : '—'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Urgency</p>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${viewTask.urgency === 'critical' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' :
                                        viewTask.urgency === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800' :
                                            viewTask.urgency === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' :
                                                'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                        }`}>
                                        {viewTask.urgency.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Priority</p>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                        {viewTask.priority}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Est. Time</p>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {viewTask.estimated_hours}h
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Due Date</p>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {viewTask.due_date ? new Date(viewTask.due_date).toLocaleDateString() : 'No date'}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <section>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Description</p>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        {viewTask.description || <span className="italic text-gray-400">No description provided.</span>}
                                    </p>
                                </div>
                            </section>

                            {/* Requirements */}
                            <section>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Acceptance Criteria</p>
                                <div className="space-y-3">
                                    {requirements.filter(r => r.task_id === viewTask.id).length > 0 ? (
                                        requirements.filter(r => r.task_id === viewTask.id).map(r => (
                                            <div key={r.id} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded border transition-colors ${r.is_met ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                    {r.is_met && <svg className="w-3 h-3 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm ${r.is_met ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                                        {r.content}
                                                    </p>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-1 inline-block">
                                                        {r.source_type === 'user_statement' ? 'Voice of User' : 'Technical Spec'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No requirements listed.</p>
                                    )}
                                </div>
                            </section>

                            {/* Prerequisites */}
                            <section>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Prerequisites</p>
                                <div className="space-y-2">
                                    {getPrereqsForTask(viewTask.id).length > 0 ? (
                                        getPrereqsForTask(viewTask.id).map(p => {
                                            const pt = tasks.find(t => t.id === p.prerequisite_task_id);
                                            return (
                                                <div key={p.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${pt?.status === 'complete' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    <span className={`text-sm font-medium ${pt?.status === 'complete' ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                                        {pt?.title || 'Unknown Task'}
                                                    </span>
                                                    <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                                                        {pt?.type}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No prerequisites defined.</p>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                            <button
                                onClick={() => { setViewTask(null); openEditModal(viewTask); }}
                                className="px-5 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-2"
                            >
                                ✏️ Edit Task
                            </button>
                            <button
                                onClick={() => setViewTask(null)}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all focus:ring-4 focus:ring-blue-500/20"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
