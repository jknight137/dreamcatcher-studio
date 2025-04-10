"use client";

import { useState } from 'react';
import { GoalInput } from '@/components/GoalInput';
import { TaskDisplay } from '@/components/TaskDisplay';
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";

export default function Home() {
  const [dreams, setDreams] = useState([]);
  const [activeDream, setActiveDream] = useState(null);
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState<"dreams" | "tasks">("dreams");

  const handleDreamCreation = async (newDream) => {
    // setDreams([...dreams, newDream]);
    //setActiveDream(newDream); // Automatically switch to the new dream
    //setView("tasks");

      const updatedDreams = [...dreams, newDream];
      setDreams(updatedDreams);
      setActiveDream(newDream);
      setView("tasks");

    // Update the active dream to reflect the changes
    // setActiveDream(updatedDreams.find(dream => dream === activeDream));

  };

  const handleDreamSelection = (dream) => {
    setActiveDream(dream);
    setView("tasks");
  };

  const handleGoalDecomposition = (newTasks) => {
    const updatedDreams = dreams.map(dream =>
      dream === activeDream ? { ...dream, tasks: newTasks } : dream
    );
    setDreams(updatedDreams);

    // Update the active dream to reflect the changes
    setActiveDream(updatedDreams.find(dream => dream === activeDream));

    updateProgress(newTasks);
  };

  const handleTaskCompletion = (taskId) => {
    const updatedTasks = activeDream?.tasks?.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const updatedDreams = dreams.map(dream =>
      dream === activeDream ? { ...dream, tasks: updatedTasks } : dream
    );
    setDreams(updatedDreams);

    // Update the active dream to reflect the changes
    setActiveDream(updatedDreams.find(dream => dream === activeDream));

    updateProgress(updatedTasks);
  };

  const updateProgress = (currentTasks) => {
    if (!currentTasks) return;
    const completedTasks = currentTasks.filter((task) => task.completed).length;
    const totalTasks = currentTasks.length;
    const newProgress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    setProgress(newProgress);
  };

  const renderDreamsView = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Dreams</h2>
      <GoalInput onGoalDecomposition={handleDreamCreation} isDreamCreation={true} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dreams.map((dream, index) => (
          <Card key={index} onClick={() => handleDreamSelection(dream)} className="cursor-pointer">
            <CardHeader>
              <CardTitle>{dream.goal}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Created At: {new Date(dream.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTaskOverview = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Button onClick={() => setView("dreams")}>Back to Dreams</Button>
          {activeDream && <h1 className="text-2xl font-bold ml-4">Dream: {activeDream.goal}</h1>}
        </div>
        <div>
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">Tasks Completed: {progress}%</p>
        </div>
      </div>
      {activeDream && (
        <TaskDisplay
          tasks={activeDream.tasks || []}
          onTaskCompletion={handleTaskCompletion}
          onGoalDecomposition={handleGoalDecomposition}
        />
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {view === "dreams" ? renderDreamsView() : renderTaskOverview()}
    </div>
  );
}

