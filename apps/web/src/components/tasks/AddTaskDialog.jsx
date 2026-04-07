import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const EMPTY_FORM = {
  title: '',
  notes: '',
  due_at: '',
  reminder_at: '',
  priority: 'medium',
  assigned_to: '',
};

function toLocalInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function AddTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task = null,
  isSaving = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        notes: task.notes || '',
        due_at: toLocalInputValue(task.due_at),
        reminder_at: toLocalInputValue(task.reminder_at),
        priority: task.priority || 'medium',
        assigned_to: task.assigned_to || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [task, open]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    await onSubmit({
      title: form.title,
      notes: form.notes,
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      reminder_at: form.reminder_at ? new Date(form.reminder_at).toISOString() : null,
      priority: form.priority,
      assigned_to: form.assigned_to,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Take out trash"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Optional details"
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-due-at">Due</Label>
              <Input
                id="task-due-at"
                type="datetime-local"
                value={form.due_at}
                onChange={(e) => updateField('due_at', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-reminder-at">Reminder</Label>
              <Input
                id="task-reminder-at"
                type="datetime-local"
                value={form.reminder_at}
                onChange={(e) => updateField('reminder_at', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assigned-to">Assigned To</Label>
              <Input
                id="task-assigned-to"
                value={form.assigned_to}
                onChange={(e) => updateField('assigned_to', e.target.value)}
                placeholder="Shelby"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving || !form.title.trim()}>
              {isSaving ? 'Saving...' : task ? 'Save Changes' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
