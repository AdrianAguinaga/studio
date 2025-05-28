
"use client";

import type { FC, DragEvent } from 'react';
import type { Task } from '@/lib/types';
import { TaskItem } from './task-item';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  title: string;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks?: (draggedId: string, targetId: string) => void;
  isDraggable?: boolean;
  emptyStateMessage?: string;
}

export const TaskList: FC<TaskListProps> = ({
  tasks,
  title,
  onToggleComplete,
  onDeleteTask,
  onReorderTasks,
  isDraggable = false,
  emptyStateMessage = "No tasks here!"
}) => {
  
  let draggedItemId: string | null = null;
  // State to manage which item is being dragged over for visual feedback
  let dragOverItemId: string | null = null; 

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    if (!isDraggable) return;
    draggedItemId = id;
    e.dataTransfer.effectAllowed = 'move';
    try { // For older browsers and specific environments
      e.dataTransfer.setData('text/plain', id);
    } catch (error) {
      // Some environments might restrict setData
    }
    (e.currentTarget as HTMLElement).classList.add('opacity-50', 'ring-2', 'ring-primary');
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, id: string) => {
    if (!isDraggable || !draggedItemId || draggedItemId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Basic visual feedback: Add a class to the item being dragged over
    // More sophisticated visual feedback might involve inserting a placeholder element
    const targetElement = document.getElementById(`task-${id}`);
    if (targetElement && dragOverItemId !== id) {
        document.querySelectorAll('.drag-over-highlight').forEach(el => el.classList.remove('drag-over-highlight'));
        targetElement.classList.add('drag-over-highlight'); // Define .drag-over-highlight in CSS
        dragOverItemId = id;
    }
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    if (!isDraggable || !draggedItemId || !onReorderTasks) return;
    e.preventDefault(); // Prevent default to allow drop
    if (draggedItemId !== targetId) {
      onReorderTasks(draggedItemId, targetId);
    }
    // Cleanup
    draggedItemId = null;
    dragOverItemId = null;
    document.querySelectorAll('.drag-over-highlight').forEach(el => el.classList.remove('drag-over-highlight'));
    document.querySelectorAll('.opacity-50.ring-2.ring-primary').forEach(el => el.classList.remove('opacity-50', 'ring-2', 'ring-primary'));
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    if (!isDraggable) return;
    // Cleanup
    (e.currentTarget as HTMLElement).classList.remove('opacity-50', 'ring-2', 'ring-primary');
    draggedItemId = null;
    dragOverItemId = null;
    document.querySelectorAll('.drag-over-highlight').forEach(el => el.classList.remove('drag-over-highlight'));
  };

  // Add a style for drag-over-highlight or use Tailwind classes directly if simple enough
  // For example, in globals.css: .drag-over-highlight { border-top: 2px dashed hsl(var(--primary)); }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-primary">{title}</h2>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground italic p-4 bg-card rounded-md shadow-sm">{emptyStateMessage}</p>
      ) : (
        <div className="space-y-0"> {/* Remove space-y-2 if TaskItem has mb-2 */}
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
              isDraggable={isDraggable}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
};
