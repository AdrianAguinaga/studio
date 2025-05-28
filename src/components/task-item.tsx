
"use client";

import type { FC, DragEvent } from 'react';
import type { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  isDraggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>, id: string) => void; // Added id for precise targeting
  onDrop?: (e: DragEvent<HTMLDivElement>, id:string) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
}

export const TaskItem: FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDeleteTask,
  isDraggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) => {
  return (
    <Card 
      className={cn(
        "mb-2 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg",
        task.completed ? 'bg-accent/10 border-accent/30' : 'bg-card', // Subtle accent for completed
        isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
      )}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart?.(e, task.id)}
      onDragOver={(e) => {
        if (isDraggable) {
          e.preventDefault(); // Essential for onDrop to fire
          onDragOver?.(e, task.id);
        }
      }}
      onDrop={(e) => {
        if (isDraggable) {
          e.preventDefault(); // Ensure drop is handled
          onDrop?.(e, task.id);
        }
      }}
      onDragEnd={(e) => isDraggable && onDragEnd?.(e)}
      id={`task-${task.id}`} // Unique ID for drag identification
      aria-roledescription={isDraggable ? "Draggable task item" : "Task item"}
    >
      <CardContent className="p-3 sm:p-4 flex items-center gap-3">
        {isDraggable && <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />}
        <Checkbox
          id={`task-checkbox-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          aria-labelledby={`task-text-${task.id}`}
          className="shrink-0"
        />
        <label
          htmlFor={`task-checkbox-${task.id}`}
          id={`task-text-${task.id}`}
          className={cn(
            "flex-grow text-sm sm:text-base break-words transition-colors", // Allow text to wrap
            task.completed ? 'line-through text-muted-foreground/80' : 'text-foreground'
          )}
        >
          {task.text}
        </label>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteTask(task.id)}
          aria-label={`Delete task: ${task.text}`}
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </CardContent>
    </Card>
  );
};
