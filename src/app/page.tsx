
"use client";

import { useState, useMemo, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { AddTaskForm } from '@/components/add-task-form';
import { TaskList } from '@/components/task-list';
import { AiTaskSuggester } from '@/components/ai-task-suggester';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { ListTodo, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const { toast } = useToast();

  const addTask = useCallback((text: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]); // Add to the beginning for "date added" order (newest first)
    toast({ title: "Task Added", description: `"${text}" has been added.`, variant: "default"});
  }, [setTasks, toast]);

  const toggleComplete = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    if (task) {
      toast({ title: `Task ${task.completed ? "Marked Active" : "Completed"}`, description: `"${task.text}" status updated.`, variant: "default" });
    }
  }, [setTasks, tasks, toast]);

  const deleteTask = useCallback((id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    if (taskToDelete) {
     toast({ title: "Task Deleted", description: `"${taskToDelete.text}" removed.`, variant: "destructive" });
    }
  }, [setTasks, tasks, toast]);

  const reorderTasks = useCallback((draggedId: string, targetId: string) => {
    setTasks(prevTasks => {
      const activeTasks = prevTasks.filter(task => !task.completed);
      const completedTasks = prevTasks.filter(task => task.completed);

      const draggedIndex = activeTasks.findIndex(task => task.id === draggedId);
      const targetIndex = activeTasks.findIndex(task => task.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return prevTasks; // Should not happen if logic is correct

      const newActiveTasks = [...activeTasks];
      const [draggedItem] = newActiveTasks.splice(draggedIndex, 1);
      newActiveTasks.splice(targetIndex, 0, draggedItem);
      
      // Maintain original completed tasks order or sort them if needed
      const sortedCompletedTasks = completedTasks.sort((a, b) => b.createdAt - a.createdAt);
      return [...newActiveTasks, ...sortedCompletedTasks];
    });
    toast({ title: "Tasks Reordered", variant: "default" });
  }, [setTasks, toast]);

  const clearCompletedTasks = useCallback(() => {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
      toast({ title: "No Completed Tasks", description: "There are no completed tasks to clear.", variant: "default"});
      return;
    }
    setTasks(prevTasks => prevTasks.filter(task => !task.completed));
    toast({ title: "Completed Tasks Cleared", description: `${completedCount} task(s) removed.`, variant: "default" });
  }, [setTasks, tasks, toast]);

  // Active tasks are shown in user-defined order (after drag-drop) or by creation (newest first)
  // Completed tasks are shown by creation (newest first)
  const activeTasks = useMemo(() => tasks.filter(task => !task.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(task => task.completed).sort((a,b) => b.createdAt - a.createdAt), [tasks]);


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl min-h-screen flex flex-col">
      <header className="my-8 sm:my-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary flex items-center justify-center gap-3">
          <ListTodo className="h-10 w-10 sm:h-12 sm:w-12" />
          TaskMaster
        </h1>
        <p className="text-muted-foreground mt-2 text-md sm:text-lg">
          Organize your life, one task at a time.
        </p>
      </header>

      <main className="flex-grow">
        <AiTaskSuggester onAddSuggestedTask={addTask} />
        
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <AddTaskForm onAddTask={addTask} />
          </CardContent>
        </Card>

        <TaskList
          title="Active Tasks"
          tasks={activeTasks}
          onToggleComplete={toggleComplete}
          onDeleteTask={deleteTask}
          onReorderTasks={reorderTasks}
          isDraggable={true}
          emptyStateMessage="All caught up! Add a new task or use AI suggestions."
        />

        {completedTasks.length > 0 && (
          <div className="mt-10">
            <TaskList
              title="Completed Tasks"
              tasks={completedTasks}
              onToggleComplete={toggleComplete}
              onDeleteTask={deleteTask}
              isDraggable={false}
              emptyStateMessage="No tasks completed yet."
            />
            <div className="text-right mt-[-1rem] mb-8"> {/* Adjust margin to align with list items */}
              <Button variant="outline" onClick={clearCompletedTasks} className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Completed
              </Button>
            </div>
          </div>
        )}
      </main>
      <footer className="text-center mt-12 py-6 border-t">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} TaskMaster. Built with Next.js & Firebase Studio.</p>
      </footer>
    </div>
  );
}
