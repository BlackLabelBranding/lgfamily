import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  getTasks,
  addTask,
  toggleTaskComplete,
  deleteTask,
} from '@/lib/tasks';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    try {
      const data = await getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
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
      alert(error.message || 'Failed to add task');
    }
  }

  async function handleToggle(task) {
    try {
      await toggleTaskComplete(task);
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert(error.message || 'Failed to update task');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this task?')) return;

    try {
      await deleteTask(id);
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(error.message || 'Failed to delete task');
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks & Reminders</h1>
          <p className="text-sm text-slate-500">Household tasks synced from Supabase.</p>
        </div>
        <Button onClick={handleAddTask}>Add Task</Button>
      </div>

      {loading ? (
        <div className="rounded-xl border p-6 text-sm text-slate-500">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
          No tasks yet.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3
                    className={
                      task.status === 'completed'
                        ? 'font-medium text-slate-400 line-through'
                        : 'font-medium text-slate-900'
                    }
                  >
                    {task.title}
                  </h3>
                  {task.notes ? (
                    <p className="mt-1 text-sm text-slate-500">{task.notes}</p>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggle(task)}>
                    {task.status === 'completed' ? 'Reopen' : 'Complete'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
