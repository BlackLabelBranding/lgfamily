
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import TaskCard from '@/components/TaskCard.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

function TasksPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Pick up groceries", completed: false, dueDate: "Today", priority: "high", assignee: { name: "Sarah", initials: "S" } },
    { id: 2, title: "Help Emma with homework", completed: false, dueDate: "Today", priority: "medium", assignee: { name: "Michael", initials: "M" } },
    { id: 3, title: "Schedule car maintenance", completed: false, dueDate: "Apr 6", priority: "medium", assignee: { name: "Michael", initials: "M" } },
    { id: 4, title: "Buy birthday gift for Grandma", completed: false, dueDate: "Apr 10", priority: "high", assignee: { name: "Sarah", initials: "S" } },
  ]);

  const familyTasks = [
    { id: 5, title: "Spring cleaning - garage", completed: false, dueDate: "This weekend", priority: "low", assignee: { name: "Family", initials: "F" } },
    { id: 6, title: "Plan summer vacation", completed: false, dueDate: "Apr 15", priority: "medium", assignee: { name: "Sarah", initials: "S" } },
  ];

  const recurringTasks = [
    { id: 7, title: "Water plants", completed: false, dueDate: "Every Monday", priority: "low", assignee: { name: "Emma", initials: "E" } },
    { id: 8, title: "Take out trash", completed: false, dueDate: "Every Thursday", priority: "low", assignee: { name: "Lucas", initials: "L" } },
  ];

  const reminders = [
    { id: 9, title: "Call dentist for Emma's checkup", completed: false, dueDate: "Tomorrow", priority: "medium", assignee: { name: "Sarah", initials: "S" } },
    { id: 10, title: "Renew library books", completed: false, dueDate: "Apr 7", priority: "low", assignee: { name: "Michael", initials: "M" } },
  ];

  const completedTasks = [
    { id: 11, title: "Pay electricity bill", completed: true, dueDate: "Apr 1", priority: "high", assignee: { name: "Michael", initials: "M" } },
    { id: 12, title: "Submit school forms", completed: true, dueDate: "Apr 2", priority: "medium", assignee: { name: "Sarah", initials: "S" } },
  ];

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <>
      <Helmet>
        <title>Tasks & Reminders - FamilyHub</title>
        <meta name="description" content="Manage family tasks, reminders, and to-do lists" />
      </Helmet>
      
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>Tasks & reminders</h1>
                  <p className="text-muted-foreground">Keep track of what needs to be done</p>
                </div>
                <Button className="gap-2 touch-target">
                  <Plus className="h-4 w-4" />
                  Add task
                </Button>
              </div>

              <Tabs defaultValue="my-tasks" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
                  <TabsTrigger value="my-tasks" className="text-xs sm:text-sm">My tasks</TabsTrigger>
                  <TabsTrigger value="family-tasks" className="text-xs sm:text-sm">Family tasks</TabsTrigger>
                  <TabsTrigger value="recurring" className="text-xs sm:text-sm">Recurring</TabsTrigger>
                  <TabsTrigger value="reminders" className="text-xs sm:text-sm">Reminders</TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="my-tasks" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map(task => (
                      <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="family-tasks" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyTasks.map(task => (
                      <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recurring" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recurringTasks.map(task => (
                      <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reminders" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reminders.map(task => (
                      <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedTasks.map(task => (
                      <TaskCard key={task.id} task={task} onToggle={handleToggleTask} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default TasksPage;
