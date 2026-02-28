'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { wouldCreateCycle } from '@/lib/vibeban/prerequisites';
import type { Task, Prerequisite, TaskType, Priority, Urgency } from '@/lib/vibeban/types';

const supabase = createClient();

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onCreateReview: (parentTaskId: string) => void;
  /** When provided, opens task in view mode */
  onView?: (task: Task) => void;
  /** When provided, pencil click opens task page/modal; when omitted, pencil toggles inline edit */
  onEdit?: (task: Task) => void;
  /** Current user id for showing "Me" vs "Unassigned" for assignee */
  currentUserId?: string | null;
  allTasks: Task[];
  prerequisites: Prerequisite[];
  onPrerequisitesChanged: () => void;
  blockedTaskIds: string[];
}

export const TASK_TYPES = [
  { value: 'task', label: '📋 Task', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
  { value: 'review', label: '🔍 Review', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' },
  { value: 'bug', label: '🐛 Bug', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' },
  { value: 'feature', label: '✨ Feature', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
  { value: 'research', label: '🔬 Research', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' },
];

export function TaskCard({ task, onUpdate, onDelete, onCreateReview: _onCreateReview, onEdit, onView, currentUserId, allTasks, prerequisites, onPrerequisitesChanged, blockedTaskIds }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editType, setEditType] = useState<TaskType>(task.type || 'task');
  const [editPriority, setEditPriority] = useState<Priority>(task.priority || 'medium');
  const [editUrgency, setEditUrgency] = useState<Urgency>(task.urgency || 'medium');
  const [editDueDate, setEditDueDate] = useState(task.due_date || '');
  const [editEstimatedHours, setEditEstimatedHours] = useState(task.estimated_hours || 0);
  const [showPrereqPicker, setShowPrereqPicker] = useState(false);
  const [prereqSearch, setPrereqSearch] = useState('');

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      description: editDescription,
      type: editType,
      priority: editPriority,
      urgency: editUrgency,
      due_date: editDueDate || null,
      estimated_hours: editEstimatedHours,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditType(task.type || 'task');
    setEditPriority(task.priority || 'medium');
    setEditUrgency(task.urgency || 'medium');
    setEditDueDate(task.due_date || '');
    setEditEstimatedHours(task.estimated_hours || 0);
    setIsEditing(false);
  };

  const toggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(task.id, {
      status: task.status === 'complete' ? 'incomplete' : 'complete',
    });
  };

  const addPrerequisite = async (prereqTaskId: string) => {
    if (wouldCreateCycle(task.id, prereqTaskId, prerequisites)) {
      alert('This would create a circular dependency (e.g. Task 1 → Task 2 and Task 2 → Task 1). Choose a different prerequisite.');
      return;
    }
    const { error } = await supabase
      .from('task_prerequisites')
      .insert([{ task_id: task.id, prerequisite_task_id: prereqTaskId }]);

    if (error) {
      console.error('Error adding prerequisite:', error);
      if (error.message?.includes('duplicate')) {
        alert('This prerequisite already exists.');
      } else {
        alert(`Error: ${error.message}`);
      }
      return;
    }
    onPrerequisitesChanged();
    setShowPrereqPicker(false);
    setPrereqSearch('');
  };

  const removePrerequisite = async (prereqId: string) => {
    const { error } = await supabase
      .from('task_prerequisites')
      .delete()
      .eq('id', prereqId);

    if (error) {
      console.error('Error removing prerequisite:', error);
      return;
    }
    onPrerequisitesChanged();
  };

  const typeInfo = TASK_TYPES.find(t => t.value === task.type) || TASK_TYPES[0];
  const isComplete = task.status === 'complete';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isComplete;

  // Blocked if any prerequisite is incomplete (all must complete)
  const prereqTaskIds = prerequisites.map(p => p.prerequisite_task_id);
  const prereqTasks = allTasks.filter(t => prereqTaskIds.includes(t.id));
  const incompletePrereqs = prereqTasks.filter(t => t.status === 'incomplete');

  const isBlocked = prereqTasks.length > 0 && incompletePrereqs.length > 0;

  // Available tasks to add as prerequisites (not self, not already a prereq, and would not create a cycle)
  const availableForPrereq = allTasks
    .filter(t => t.id !== task.id && !prereqTaskIds.includes(t.id))
    .filter(t => !wouldCreateCycle(task.id, t.id, prerequisites))
    .filter(t => {
      if (!prereqSearch) return true;
      return t.title.toLowerCase().includes(prereqSearch.toLowerCase());
    });

  const parentTask = task.parent_task_id ? allTasks.find(t => t.id === task.parent_task_id) : null;

  // Tasks this task is blocking
  const blockedTasks = allTasks.filter(t => blockedTaskIds.includes(t.id));
  const isBlocker = blockedTasks.length > 0;

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  if (isEditing) {
    return (
      <div className="bg-card/80 p-4 rounded-xl shadow-sm border border-primary/20 backdrop-blur-sm">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 text-sm font-semibold bg-background text-white focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 text-sm resize-none bg-background text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={3}
          placeholder="Description..."
        />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Type</label>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as TaskType)}
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {TASK_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Urgency</label>
            <select
              value={editUrgency}
              onChange={(e) => setEditUrgency(e.target.value as Urgency)}
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Priority</label>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Est. Hours</label>
            <input
              type="number"
              value={editEstimatedHours}
              onChange={(e) => setEditEstimatedHours(parseInt(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              min={0}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Due Date</label>
          <input
            type="date"
            value={editDueDate ? new Date(editDueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Prerequisites section in edit mode */}
        <div className="mb-4 p-3 bg-background/60 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              🔗 Prerequisites ({prereqTasks.length})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrereqPicker(!showPrereqPicker)}
                className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Current prerequisites */}
          {prereqTasks.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {prerequisites.map(prereq => {
                const prereqTask = allTasks.find(t => t.id === prereq.prerequisite_task_id);
                if (!prereqTask) return null;
                return (
                  <div key={prereq.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${prereqTask.status === 'complete' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    <span className={`flex-1 truncate ${prereqTask.status === 'complete' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                      {prereqTask.title}
                    </span>
                    <button
                      onClick={() => removePrerequisite(prereq.id)}
                      className="text-red-400 hover:text-red-600 text-xs flex-shrink-0 transition-colors"
                      title="Remove prerequisite"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {prereqTasks.length === 0 && !showPrereqPicker && (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">No prerequisites set</p>
          )}

          {/* Prerequisite picker */}
          {showPrereqPicker && (
            <div className="mt-2 border border-primary/30 rounded-lg overflow-hidden">
              <input
                type="text"
                value={prereqSearch}
                onChange={(e) => setPrereqSearch(e.target.value)}
                placeholder="Search tasks to add..."
                className="w-full px-3 py-2 text-sm bg-background text-white border-b border-primary/30 focus:outline-none"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto">
                {availableForPrereq.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">No tasks available</p>
                ) : (
                  availableForPrereq.slice(0, 10).map(t => (
                    <button
                      key={t.id}
                      onClick={() => addPrerequisite(t.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 text-gray-300 border-b border-primary/10 last:border-b-0 transition-colors flex items-center gap-2"
                    >
                      <span className={`w-2 h-2 rounded-full ${t.status === 'complete' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                      <span className="truncate">{t.title}</span>
                      <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{t.type}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t border-primary/20">
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 text-gray-600 dark:text-gray-300 text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (confirm('Delete this task?')) onDelete(task.id); }}
            className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 ml-auto font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(task);
    else setIsEditing(true);
  };

  return (
    <div
      className={`group bg-card/80 p-4 rounded-xl shadow-sm border border-primary/20 backdrop-blur-sm 
        border-l-4 ${getUrgencyStyle(task.urgency || 'medium')} 
        hover:shadow-md transition-all duration-200
        ${isComplete ? 'opacity-60' : ''}
        ${isBlocked && !isComplete ? 'ring-1 ring-amber-300 dark:ring-amber-700' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={toggleComplete}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${isComplete
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-500 hover:border-green-400 dark:hover:border-green-400'}`}
        >
          {isComplete && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="mb-1">
            <h4 className={`font-semibold text-white text-sm truncate ${isComplete ? 'line-through' : ''}`}>
              {task.title}
            </h4>
          </div>

          {/* Assignee & Reporter */}
          <div className="text-[11px] text-gray-400 mb-1 space-y-0.5">
            <div>
              {task.assignee_id
                ? (task.assignee_id === currentUserId ? 'Assigned to: Me' : 'Assigned')
                : 'Unassigned'}
            </div>
            {task.reporter_id != null && (
              <div>Reported by: {task.reporter_id === currentUserId ? 'Me' : '—'}</div>
            )}
          </div>

          {/* Blocked indicator */}
          {isBlocked && !isComplete && (
            <div className="flex items-center gap-1.5 mb-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium flex-wrap">
              <span>⚠️ Blocked — needs:</span>
              <span className="text-amber-500 dark:text-amber-300">{incompletePrereqs.map(p => p.title).join(', ')}</span>
            </div>
          )}

          {/* Blocker indicator — this task is blocking others */}
          {isBlocker && !isComplete && (
            <div className="mb-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-bold">
                <span>🚫 Blocking {blockedTasks.length} task{blockedTasks.length > 1 ? 's' : ''}:</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {blockedTasks.map(bt => (
                  <span
                    key={bt.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  >
                    {bt.title.length > 30 ? bt.title.substring(0, 30) + '…' : bt.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Parent task link (for reviews) */}
          {parentTask && (
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-1.5">
              🔗 Review of: <span className="font-medium">{parentTask.title}</span>
            </p>
          )}

          {/* Description */}
          {task.description && (
            <p className={`text-sm text-gray-400 line-clamp-2 mb-2 ${isComplete ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}

          {/* Prerequisites display (compact) */}
          {prereqTasks.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Prereqs (all required)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {prereqTasks.map(pt => (
                  <span
                    key={pt.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium
                      ${pt.status === 'complete'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${pt.status === 'complete' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    {pt.title.length > 25 ? pt.title.substring(0, 25) + '…' : pt.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags row (bottom): type, due date, estimated hours */}
          <div className="flex flex-wrap gap-1.5 text-xs mt-2 pt-2 border-t border-primary/10">
            <span className={`px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            {task.due_date && (
              <span className={`px-2 py-0.5 rounded-md font-medium ${isOverdue
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : 'bg-primary/10 text-gray-300'}`}>
                📅 {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            {task.estimated_hours > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-gray-300 font-medium">
                ⏱️ {task.estimated_hours}h
              </span>
            )}
          </div>
        </div>

        {/* Actions (visible on hover): pencil = edit, trash = delete */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {onView && (
            <button
              onClick={(e) => { e.stopPropagation(); onView(task); }}
              title="View details"
              className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            >
              👁️
            </button>
          )}
          <button
            onClick={handleOpenEdit}
            title="Edit task"
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this task?')) onDelete(task.id);
            }}
            title="Delete"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div >
  );
}

