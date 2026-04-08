import React, { useEffect, useMemo, useState } from 'react';
import { getTasks, addTask, toggleTaskComplete, deleteTask } from '@/lib/tasks.js';

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleString();
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

function TaskCard({ task, onToggle, onDelete }) {
  const completed = task.status === 'completed';

  const priorityStyles = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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

        <div className="flex gap-2">
          <button
            onClick={() => onToggle(task)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {completed ? 'Reopen' : 'Complete'}
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

function TaskSection({ title, tasks, emptyText, onToggle, onDelete }) {
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

  async function handleAddTask() {
    const title = window.prompt('Task title');
    if (!title?.trim()) return;

    try {
      await addTask({ title: title.trim() });
      await loadTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
      setErrorText(error?.message || 'Failed to add task');
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
              onClick={handleAddTask}
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
              onDelete={handleDelete}
            />

            <TaskSection
              title="Today"
              tasks={grouped.today}
              emptyText="Nothing due today."
              onToggle={handleToggle}
              onDelete={handleDelete}
            />

            <TaskSection
              title="Upcoming"
              tasks={grouped.upcoming}
              emptyText="No upcoming tasks."
              onToggle={handleToggle}
              onDelete={handleDelete}
            />

            <TaskSection
              title="Completed"
              tasks={grouped.completed}
              emptyText="No completed tasks yet."
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TasksPage;
