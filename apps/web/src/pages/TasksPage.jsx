import React, { useEffect, useMemo, useState } from 'react';
import {
  getTasks,
  addTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
} from '@/lib/tasks.js';

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleString();
}

function toDatetimeLocal(value) {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isToday(dateString) {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();

  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isOverdue(dateString) {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  return d < now && !isToday(dateString);
}

function TaskModal({ open, onClose, onSave, task, saving }) {
  const [form, setForm] = useState({
    title: '',
    notes: '',
    due_at: '',
    reminder_at: '',
    priority: 'medium',
    assigned_to: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        notes: task.notes || '',
        due_at: toDatetimeLocal(task.due_at),
        reminder_at: toDatetimeLocal(task.reminder_at),
        priority: task.priority || 'medium',
        assigned_to: task.assigned_to || '',
      });
    } else {
      setForm({
        title: '',
        notes: '',
        due_at: '',
        reminder_at: '',
        priority: 'medium',
        assigned_to: '',
      });
    }
  }, [task, open]);

  if (!open) return null;

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    await onSave({
      title: form.title.trim(),
      notes: form.notes.trim() || null,
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      reminder_at: form.reminder_at ? new Date(form.reminder_at).toISOString() : null,
      priority: form.priority || 'medium',
      assigned_to: form.assigned_to.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {task ? 'Edit Task' : 'Add Task'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create and manage household tasks and reminders.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Take out trash"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Optional details"
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Due Date</label>
              <input
                type="datetime-local"
                value={form.due_at}
                onChange={(e) => updateField('due_at', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Reminder</label>
              <input
                type="datetime-local"
                value={form.reminder_at}
                onChange={(e) => updateField('reminder_at', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assigned To</label>
              <input
                type="text"
                value={form.assigned_to}
                onChange={(e) => updateField('assigned_to', e.target.value)}
                placeholder="Shelby"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const completed = task.status === 'completed';

  const priorityStyles = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-base font-semibold ${
                completed ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                priorityStyles[task.priority] || priorityStyles.medium
              }`}
            >
              {task.priority || 'medium'}
            </span>

            {task.assigned_to ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {task.assigned_to}
              </span>
            ) : null}
          </div>

          {task.notes ? (
            <p className={`text-sm ${completed ? 'text-slate-400' : 'text-slate-600'}`}>
              {task.notes}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            {task.due_at ? <span>Due: {formatDate(task.due_at)}</span> : null}
            {task.reminder_at ? <span>Reminder: {formatDate(task.reminder_at)}</span> : null}
            {task.completed_at ? <span>Completed: {formatDate(task.completed_at)}</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onToggle(task)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {completed ? 'Reopen' : 'Complete'}
          </button>

          <button
            onClick={() => onEdit(task)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskSection({ title, tasks, emptyText, onToggle, onEdit, onDelete }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadTasks() {
    setLoading(true);
    setErrorText('');

    try {
      const data = await getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setErrorText(error?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function handleOpenCreate() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function handleOpenEdit(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingTask(null);
  }

  async function handleSaveTask(formData) {
    setSaving(true);
    setErrorText('');

    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await addTask(formData);
      }

      setModalOpen(false);
      setEditingTask(null);
      await loadTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
      setErrorText(error?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task) {
    try {
      await toggleTaskComplete(task);
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      setErrorText(error?.message || 'Failed to update task');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this task?')) return;

    try {
      await deleteTask(id);
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setErrorText(error?.message || 'Failed to delete task');
    }
  }

  const grouped = useMemo(() => {
    const overdue = [];
    const today = [];
    const upcoming = [];
    const completed = [];

    for (const task of tasks) {
      if (task.status === 'completed') {
        completed.push(task);
      } else if (isOverdue(task.due_at)) {
        overdue.push(task);
      } else if (isToday(task.due_at)) {
        today.push(task);
      } else {
        upcoming.push(task);
      }
    }

    return { overdue, today, upcoming, completed };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Tasks & Reminders
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Household tasks synced from Supabase.
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Add Task
            </button>
          </div>
        </div>

        {errorText ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorText}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Loading tasks...
          </div>
        ) : (
          <div className="grid gap-8">
            <TaskSection
              title="Overdue"
              tasks={grouped.overdue}
              emptyText="No overdue tasks."
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />

            <TaskSection
              title="Today"
              tasks={grouped.today}
              emptyText="Nothing due today."
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />

            <TaskSection
              title="Upcoming"
              tasks={grouped.upcoming}
              emptyText="No upcoming tasks."
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />

            <TaskSection
              title="Completed"
              tasks={grouped.completed}
              emptyText="No completed tasks yet."
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
        saving={saving}
      />
    </div>
  );
}

export default TasksPage;
