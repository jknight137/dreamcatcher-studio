
"use client";

import { useState } from 'react';
import { GoalInput } from '@/components/GoalInput';
import { TaskDisplay } from '@/components/TaskDisplay';
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleGoalDecomposition = (newTasks) => {
    setTasks(newTasks);
    updateProgress(newTasks);
  };

  const handleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    updateProgress(updatedTasks);
  };

  const updateProgress = (currentTasks) => {
    const completedTasks = currentTasks.filter((task) => task.completed).length;
    const totalTasks = currentTasks.length;
    const newProgress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    setProgress(newProgress);
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GoalFlow</h1>
      <GoalInput onGoalDecomposition={handleGoalDecomposition} />
      <div className="mb-4">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">Goals Completed: {progress}%</p>
      </div>
      <TaskDisplay tasks={tasks} onTaskCompletion={handleTaskCompletion} />
    </div>
  );
}

