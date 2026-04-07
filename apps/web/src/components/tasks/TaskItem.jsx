import { Button } from '@/components/ui/button';

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleString();
}

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700',
};

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const isCompleted = task.status === 'completed';

  return (
    <div className="rounded-xl border p-4 shadow-sm bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
              {task.title}
            </h3>
            <span className={`rounded-full px-2 py-1 text-xs ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}>
              {task.priority}
            </span>
            {task.assigned_to ? (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {task.assigned_to}
              </span>
            ) : null}
          </div>

          {task.notes ? (
            <p className={`text-sm ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
              {task.notes}
            </p>
          ) : null}

          <div className="flex flex-col gap-1 text-xs text-slate-500">
            {task.due_at ? <span>Due: {formatDate(task.due_at)}</span> : null}
            {task.reminder_at ? <span>Reminder: {formatDate(task.reminder_at)}</span> : null}
            {task.completed_at ? <span>Completed: {formatDate(task.completed_at)}</span> : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm" onClick={() => onToggle(task)}>
            {isCompleted ? 'Reopen' : 'Complete'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
