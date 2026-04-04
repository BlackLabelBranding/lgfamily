
import React from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

function TaskCard({ task, onToggle }) {
  const priorityColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-accent text-accent-foreground',
    low: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle?.(task.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-sm mb-2",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{task.dueDate}</span>
              </div>
            )}
            {task.priority && (
              <Badge variant="secondary" className={cn("text-xs", priorityColors[task.priority])}>
                <Flag className="h-3 w-3 mr-1" />
                {task.priority}
              </Badge>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                    {task.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assignee.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default TaskCard;
