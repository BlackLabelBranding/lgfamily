import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '@/lib/tasks.js';
import { getFamilyMembers } from '@/lib/family.js';

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

function formatDate(value) {
  if (!value) return 'No date';
  return new Date(value).toLocaleString();
}

function getMemberDisplayName(member) {
  return member.display_name || member.first_name || 'Unnamed';
}

function StatCard({ title, value, subtitle, to }) {
  const content = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function SectionCard({ title, actionLabel, actionTo, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {actionLabel && actionTo ? (
          <Link
            to={actionTo}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function TaskRow({ task }) {
  const completed = task.status === 'completed';

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`font-semibold ${
              completed ? 'text-slate-400 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h3>

          {task.priority ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {task.priority}
            </span>
          ) : null}

          {task.assigned_to ? (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {task.assigned_to}
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
          {task.due_at ? <span>Due: {formatDate(task.due_at)}</span> : <span>No due date</span>}
          {task.reminder_at ? <span>Reminder: {formatDate(task.reminder_at)}</span> : null}
        </div>
      </div>

      <div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            completed
              ? 'bg-slate-100 text-slate-600'
              : isOverdue(task.due_at)
              ? 'bg-red-100 text-red-700'
              : isToday(task.due_at)
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {completed
            ? 'Completed'
            : isOverdue(task.due_at)
            ? 'Overdue'
            : isToday(task.due_at)
            ? 'Today'
            : 'Open'}
        </span>
      </div>
    </div>
  );
}

function FamilyRow({ member }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
      <div>
        <h3 className="font-semibold text-slate-900">{getMemberDisplayName(member)}</h3>
        <p className="text-sm text-slate-500">
          {member.relationship || 'Family member'}
        </p>
      </div>

      {member.birth_date ? (
        <span className="text-sm text-slate-500">
          {new Date(member.birth_date).toLocaleDateString()}
        </span>
      ) : null}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
      {text}
    </div>
  );
}

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setErrorText('');

    try {
      const [taskData, familyData] = await Promise.all([
        getTasks(),
        getFamilyMembers(),
      ]);

      setTasks(taskData || []);
      setFamilyMembers(familyData || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setErrorText(error?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const openTasks = tasks.filter((task) => task.status !== 'completed');
    const completedTasks = tasks.filter((task) => task.status === 'completed');
    const overdueTasks = openTasks.filter((task) => isOverdue(task.due_at));
    const todayTasks = openTasks.filter((task) => isToday(task.due_at));

    return {
      totalFamily: familyMembers.length,
      openTasks: openTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      todayTasks: todayTasks.length,
    };
  }, [tasks, familyMembers]);

  const recentOpenTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== 'completed')
      .sort((a, b) => {
        const aTime = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [tasks]);

  const recentCompletedTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status === 'completed')
      .sort((a, b) => {
        const aTime = a.completed_at ? new Date(a.completed_at).getTime() : 0;
        const bTime = b.completed_at ? new Date(b.completed_at).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [tasks]);

  const featuredFamily = useMemo(() => familyMembers.slice(0, 6), [familyMembers]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                FamilyHub
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Keep your family organized with tasks, schedules, and household info in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/tasks"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Open Tasks
              </Link>
              <Link
                to="/family"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Family
              </Link>
            </div>
          </div>
        </div>

        {errorText ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorText}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Loading dashboard...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard
                title="Family Members"
                value={stats.totalFamily}
                subtitle="People in household"
                to="/family"
              />
              <StatCard
                title="Open Tasks"
                value={stats.openTasks}
                subtitle="Still needs action"
                to="/tasks"
              />
              <StatCard
                title="Due Today"
                value={stats.todayTasks}
                subtitle="Tasks for today"
                to="/tasks"
              />
              <StatCard
                title="Overdue"
                value={stats.overdueTasks}
                subtitle="Needs attention now"
                to="/tasks"
              />
              <StatCard
                title="Completed"
                value={stats.completedTasks}
                subtitle="Finished tasks"
                to="/tasks"
              />
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
              <SectionCard title="Open Tasks" actionLabel="View All" actionTo="/tasks">
                {recentOpenTasks.length === 0 ? (
                  <EmptyState text="No open tasks yet." />
                ) : (
                  <div className="space-y-3">
                    {recentOpenTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Family Members" actionLabel="Manage Family" actionTo="/family">
                {featuredFamily.length === 0 ? (
                  <EmptyState text="No family members added yet." />
                ) : (
                  <div className="space-y-3">
                    {featuredFamily.map((member) => (
                      <FamilyRow key={member.id} member={member} />
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
              <SectionCard title="Recently Completed" actionLabel="Go to Tasks" actionTo="/tasks">
                {recentCompletedTasks.length === 0 ? (
                  <EmptyState text="No completed tasks yet." />
                ) : (
                  <div className="space-y-3">
                    {recentCompletedTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Quick Access">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    to="/calendar"
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
                  >
                    <h3 className="font-semibold text-slate-900">Calendar</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Manage household events and schedules.
                    </p>
                  </Link>

                  <Link
                    to="/groceries"
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
                  >
                    <h3 className="font-semibold text-slate-900">Groceries</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Track pantry items and shopping lists.
                    </p>
                  </Link>

                  <Link
                    to="/photos"
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
                  >
                    <h3 className="font-semibold text-slate-900">Photos & Memories</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Keep family memories organized.
                    </p>
                  </Link>

                  <Link
                    to="/emergency"
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
                  >
                    <h3 className="font-semibold text-slate-900">Emergency Info</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Store critical household information.
                    </p>
                  </Link>
                </div>
              </SectionCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
