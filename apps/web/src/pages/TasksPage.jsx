import React, { useEffect, useState } from 'react';
import { getTasks, addTask, toggleTaskComplete, deleteTask } from '@/lib/tasks.js';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    try {
      const data = await getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      alert(error.message || 'Failed to load tasks');
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
        <button
          onClick={handleAddTask}
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          Add Task
        </button>
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
                  <button
                    onClick={() => handleToggle(task)}
                    className="rounded-md border px-3 py-1 text-sm"
                  >
                    {task.status === 'completed' ? 'Reopen' : 'Complete'}
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="rounded-md border px-3 py-1 text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TasksPage;
