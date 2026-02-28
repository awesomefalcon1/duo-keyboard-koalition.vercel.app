'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { TaskList } from './task-list';

const supabase = createClient();

interface Project {
  id: string;
  name: string;
  description: string;
}

interface TaskSummary {
  id: string;
  title: string;
  urgency: string;
  due_date: string | null;
  type: string;
  status: string;
  project_id?: string;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [sidebarView, setSidebarView] = useState<'projects' | 'my-tasks'>(
    'projects'
  );
  const [myTasks, setMyTasks] = useState<TaskSummary[]>([]);
  const [projectTasks, setProjectTasks] = useState<Record<string, TaskSummary[]>>({});
  const [mainView, setMainView] = useState<'swimlanes' | 'project'>('swimlanes');
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const minSidebarWidth = 200;
  const maxSidebarWidth = 480;

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (moveEvent: MouseEvent) => {
      setSidebarWidth(
        Math.min(maxSidebarWidth, Math.max(minSidebarWidth, moveEvent.clientX))
      );
    };
    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [minSidebarWidth, maxSidebarWidth]);

  useEffect(() => {
    loadProjects();
    loadMyTasks();

    // Realtime: refresh project list when projects table changes
    const channel = supabase
      .channel('vibeban-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        loadProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadMyTasks();
        loadProjectTasks();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProjectTasks();
  }, [projects]);

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    }
  };

  const loadMyTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, urgency, due_date, type, status')
      .eq('assignee_id', user?.id)
      .eq('status', 'incomplete')
      .order('due_date', { ascending: true });

    if (data) {
      setMyTasks(data);
    }
  };

  const loadProjectTasks = async () => {
    if (projects.length === 0) {
      setProjectTasks({});
      return;
    }

    const projectIds = projects.map((project) => project.id);

    const { data } = await supabase
      .from('tasks')
      .select('id, title, urgency, due_date, type, status, project_id')
      .in('project_id', projectIds)
      .eq('status', 'incomplete')
      .order('created_at', { ascending: false });

    if (!data) return;

    const grouped = data.reduce<Record<string, TaskSummary[]>>((acc, task) => {
      if (!acc[task.project_id]) {
        acc[task.project_id] = [];
      }
      acc[task.project_id].push(task);
      return acc;
    }, {});

    setProjectTasks(grouped);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    if (!user?.id) {
      alert('No valid user session. Please sign out and sign back in.');
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: newProjectName,
          description: newProjectDescription,
          owner_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      if (
        error.message?.includes('foreign key') ||
        error.message?.includes('violates')
      ) {
        alert(
          'Your session is stale. Please sign out and create a new account.'
        );
        await supabase.auth.signOut();
      } else {
        alert(`Error creating project: ${error.message}`);
      }
      return;
    }

    if (data) {
      setProjects([data, ...projects]);
      setSelectedProject(data);
      setMainView('project');
      setNewProjectName('');
      setNewProjectDescription('');
      setShowProjectForm(false);
      loadProjectTasks();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'review': return '🔍';
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'research': return '🔬';
      default: return '📋';
    }
  };

  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [renamingName, setRenamingName] = useState('');

  const handleRenameProject = async () => {
    if (!selectedProject || !renamingName.trim() || renamingName === selectedProject.name) {
      setIsRenamingProject(false);
      return;
    }

    const { error } = await supabase
      .from('projects')
      .update({ name: renamingName })
      .eq('id', selectedProject.id);

    if (error) {
      alert(`Error renaming project: ${error.message}`);
    } else {
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, name: renamingName } : p));
      setSelectedProject({ ...selectedProject, name: renamingName });
    }
    setIsRenamingProject(false);
  };

  const handleRemoveProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project and all its tasks?')) return;

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      alert(`Error deleting project: ${error.message}`);
    } else {
      setProjects(projects.filter(p => p.id !== id));
      if (selectedProject?.id === id) setSelectedProject(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white transition-colors">
      {/* Nav */}
      <nav className="bg-card/90 backdrop-blur-sm border-b border-primary/30">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-primary italic cyber-glow">
                DKK Build Velocity
              </h1>

              {selectedProject && (
                <div className="flex items-center gap-2">
                  {isRenamingProject ? (
                    <input
                      type="text"
                      value={renamingName}
                      onChange={(e) => setRenamingName(e.target.value)}
                      onBlur={handleRenameProject}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameProject(); if (e.key === 'Escape') setIsRenamingProject(false); }}
                      className="text-sm px-2 py-0.5 bg-background rounded-md border border-primary/50 focus:outline-none text-white"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => { setRenamingName(selectedProject.name); setIsRenamingProject(true); }}
                      className="text-sm text-gray-300 px-2 py-0.5 bg-background rounded-md border border-primary/30 hover:border-primary/60 transition-colors flex items-center gap-2 group max-w-[220px]"
                      title="Click to rename project"
                    >
                      <span className="truncate">{selectedProject.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] flex-shrink-0">✏️</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm text-primary hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Create Project Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-primary/30 cyber-box">
            <h2 className="text-xl font-bold mb-4 text-white">
              New Project
            </h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full px-4 py-2.5 border border-primary/40 rounded-lg mb-3 bg-background text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') createProject(); }}
            />
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-2 border border-primary/40 rounded-lg mb-4 bg-background text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowProjectForm(false);
                  setNewProjectName('');
                  setNewProjectDescription('');
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-5 py-2 bg-primary/20 text-primary border border-primary/40 rounded-lg hover:bg-primary/30 font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout — full height */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar — resizable width */}
        <aside
          className="relative bg-card/70 border-r border-primary/30 overflow-y-auto flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          {/* Resize handle — drag to change sidebar width */}
          <button
            type="button"
            aria-label="Resize sidebar"
            onMouseDown={handleResizeStart}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500/40 transition-colors z-10 flex items-center justify-center group"
          >
            <span className="absolute inset-y-0 -left-1 w-3" aria-hidden />
            <span className="w-0.5 h-12 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
          <div className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setSidebarView('projects')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sidebarView === 'projects'
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'text-gray-300 hover:bg-primary/10'
                  }`}
              >
                📁 All Projects
              </button>
              <button
                onClick={() => setSidebarView('my-tasks')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sidebarView === 'my-tasks'
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'text-gray-300 hover:bg-primary/10'
                  }`}
              >
                ✓ My Tasks ({myTasks.length})
              </button>
            </nav>

            {/* My Tasks sidebar */}
            {sidebarView === 'my-tasks' && myTasks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 tracking-wider">
                  Assigned to You
                </h3>
                <div className="space-y-2">
                  {myTasks.slice(0, 10).map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 bg-background rounded-lg border border-primary/20"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{getTypeEmoji(task.type)}</span>
                        <p className="text-sm font-medium text-white truncate flex-1">
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span
                          className={`text-xs font-medium ${getUrgencyColor(
                            task.urgency || 'medium'
                          )}`}
                        >
                          {task.urgency || 'medium'}
                        </span>
                        {task.due_date && (
                          <span className="text-xs text-gray-400">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects list */}
            {sidebarView === 'projects' && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 pr-1">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Projects
                  </h3>
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="px-2 py-1 bg-primary/20 text-primary border border-primary/40 text-[10px] rounded-md hover:bg-primary/30 font-bold transition-colors uppercase tracking-tight"
                  >
                    + Project
                  </button>
                </div>
                <div className="space-y-1">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`group flex items-center gap-1 w-full p-2 rounded-lg text-sm transition-colors ${selectedProject?.id === project.id
                        ? 'bg-primary/20 text-primary font-medium border border-primary/40'
                        : 'text-gray-300 hover:bg-primary/10'
                        }`}
                      onClick={() => {
                        setSelectedProject(project);
                        setMainView('project');
                      }}
                    >
                      <button className="flex-1 text-left truncate">
                        {project.name}
                      </button>

                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setRenamingName(project.name);
                            setIsRenamingProject(true);
                          }}
                          className="p-1 hover:text-primary transition-colors"
                          title="Rename"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => handleRemoveProject(project.id, e)}
                          className="p-1 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content — fills remaining space */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {selectedProject ? (
            mainView === 'project' ? (
              <>
                <div className="px-4 py-3 border-b border-primary/20 bg-card/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">Vibe Ban</p>
                    <h2 className="text-lg font-semibold text-primary">{selectedProject.name}</h2>
                  </div>
                  <button
                    onClick={() => setMainView('swimlanes')}
                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide bg-primary/20 text-primary border border-primary/40 rounded-md hover:bg-primary/30 transition-colors"
                  >
                    Back to Swim Lanes
                  </button>
                </div>
                <TaskList projectId={selectedProject.id} />
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-white">Vibe Ban Swim Lanes</h2>
                  <p className="text-sm text-gray-400 mt-1">Each project is rendered as its own lane for rapid builder flow.</p>
                </div>

                <div className="space-y-4">
                  {projects.map((project) => {
                    const laneTasks = projectTasks[project.id] || [];
                    return (
                      <section
                        key={project.id}
                        className="rounded-xl border border-primary/30 bg-card/60 p-4 cyber-box"
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-primary">{project.name}</h3>
                            <p className="text-xs text-gray-400">{laneTasks.length} open task{laneTasks.length === 1 ? '' : 's'}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setMainView('project');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide bg-primary/20 text-primary border border-primary/40 rounded-md hover:bg-primary/30 transition-colors"
                          >
                            Open Lane
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <div className="flex gap-3 min-w-full pb-1">
                            {laneTasks.length > 0 ? (
                              laneTasks.slice(0, 12).map((task) => (
                                <article
                                  key={task.id}
                                  className="min-w-[220px] max-w-[260px] rounded-lg border border-primary/20 bg-background p-3"
                                >
                                  <div className="flex items-center justify-between text-xs mb-2">
                                    <span>{getTypeEmoji(task.type)}</span>
                                    <span className={getUrgencyColor(task.urgency || 'medium')}>{task.urgency || 'medium'}</span>
                                  </div>
                                  <p className="text-sm font-medium text-white line-clamp-2">{task.title}</p>
                                  {task.due_date && (
                                    <p className="text-xs text-gray-400 mt-2">Due {new Date(task.due_date).toLocaleDateString()}</p>
                                  )}
                                </article>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">No open tasks in this lane.</p>
                            )}
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-4">📁</div>
                <p className="text-lg font-medium">No project selected</p>
                <p className="text-sm mt-1">
                  Select or create a project to get started
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
