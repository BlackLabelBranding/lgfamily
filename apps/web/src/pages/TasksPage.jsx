import React, { useEffect, useState } from 'react';
import { getTasks } from '@/lib/tasks';

function TasksPage() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasks().then(setTasks).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1>Tasks & Reminders</h1>
      <pre>{JSON.stringify(tasks, null, 2)}</pre>
    </div>
  );
}

export default TasksPage;
