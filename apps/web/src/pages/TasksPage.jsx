import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import TaskList from '@/components/tasks/TaskList';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';
import {
  getTasks,
  addTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
} from '@/lib/tasks';

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadTasks() {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      alert(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const grouped = useMemo(() => {
    const now = new Date();
    const overdue = [];
    const today = [];
    const upcoming = [];
    const completed = [];

    for (const task of tasks) {
      if (task.status === 'completed') {
        completed.push(task);
        continue;
      }

      if (!task.due_at) {
        upcoming.push(task);
        continue;
      }

      const due = new Date(task.due_at);

      if (due < now && !isSameDay(due, now)) {
        overdue.push(task);
      } else if (isSameDay(due, now)) {
        today.push(task);
      } else {
        upcoming.push(task);
      }
    }

    return { overdue, today, upcoming, completed };
  }, [tasks]);

  function openCreate() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  async function handleSubmit(formData) {
    setSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await addTask(formData);
      }

      setDialogOpen(false);
      setEditingTask(null);
      await loadTasks();
    } catch (err) {
      console.error('Failed to save task:', err);
      alert(err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task) {
    try {
      await toggleTaskComplete(task);
      await loadTasks();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      alert(err.message || 'Failed to update task');
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;

    try {
      await deleteTask(id);
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert(err.message || 'Failed to delete task');
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks & Reminders</h1>
          <p className="text-sm text-slate-500">
            Household tasks, reminders, and due dates.
          </p>
        </div>

        <Button onClick={openCreate}>Add Task</Button>
      </div>

      {loading ? (
        <div className="rounded-xl border p-6 text-sm text-slate-500">
          Loading tasks...
        </div>
      ) : (
        <div className="space-y-8">
          <TaskList
            title="Overdue"
            tasks={grouped.overdue}
            emptyText="No overdue tasks."
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
          />

          <TaskList
            title="Today"
            tasks={grouped.today}
            emptyText="Nothing due today."
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
          />

          <TaskList
            title="Upcoming"
            tasks={grouped.upcoming}
            emptyText="No upcoming tasks."
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
          />

          <TaskList
            title="Completed"
            tasks={grouped.completed}
            emptyText="No completed tasks yet."
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        task={editingTask}
        isSaving={saving}
      />
    </div>
  );
}
