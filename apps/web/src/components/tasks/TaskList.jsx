import TaskItem from './TaskItem';

export default function TaskList({ title, tasks, emptyText, onToggle, onEdit, onDelete }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-slate-500">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem
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
