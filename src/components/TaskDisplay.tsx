
"use client";

import { useState, useEffect } from 'react';
import { prioritizeTasks } from '@/ai/flows/task-prioritization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const getMatrixCategory = (task) => {
  if (task.urgency === 'High' && task.importance === 'High') {
    return 'Do First';
  } else if (task.urgency === 'High' && task.importance === 'Low') {
    return 'Delegate';
  } else if (task.urgency === 'Low' && task.importance === 'High') {
    return 'Schedule';
  } else {
    return 'Don\'t Do';
  }
};

export const TaskDisplay = ({ tasks, onTaskCompletion }) => {
  const [prioritizedTasks, setPrioritizedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const prioritize = async () => {
      setIsLoading(true);
      try {
        // Map the tasks to the PrioritizeTasksInput format
        const inputTasks = tasks.map(task => ({
          id: task.title, // Use task title as ID for now
          title: task.title,
          urgency: task.urgency,
          importance: task.importance,
          dueDate: task.dueDate,
          impact: task.impact,
        }));

        const result = await prioritizeTasks({ tasks: inputTasks });
        setPrioritizedTasks(result);
      } catch (error) {
        console.error("Error prioritizing tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tasks.length > 0) {
      prioritize();
    } else {
      setPrioritizedTasks([]);
    }
  }, [tasks]);

  const handleRePrioritize = async () => {
      setIsLoading(true);
      try {
        // Map the tasks to the PrioritizeTasksInput format
        const inputTasks = tasks.map(task => ({
          id: task.title, // Use task title as ID for now
          title: task.title,
          urgency: task.urgency,
          importance: task.importance,
          dueDate: task.dueDate,
          impact: task.impact,
        }));

        const result = await prioritizeTasks({ tasks: inputTasks });
        setPrioritizedTasks(result);
      } catch (error) {
        console.error("Error prioritizing tasks:", error);
      } finally {
        setIsLoading(false);
      }
  }

  const categorizeTasks = () => {
    const categorized = {
      'Do First': [],
      'Delegate': [],
      'Schedule': [],
      'Don\'t Do': [],
    };

    tasks.forEach(task => {
      const category = getMatrixCategory(task);
      categorized[category].push(task);
    });

    return categorized;
  };

  const categorizedTasks = categorizeTasks();

  // Sort tasks based on priority score
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = prioritizedTasks.find(pt => pt.id === a.title)?.priorityScore || 0;
    const priorityB = prioritizedTasks.find(pt => pt.id === b.title)?.priorityScore || 0;
    return priorityB - priorityA;
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Task Overview</h2>

        <Button onClick={handleRePrioritize} disabled={isLoading}>
          {isLoading ? "Re-prioritizing..." : "Re-prioritize Tasks"}
        </Button>

      <h3 className="text-lg font-semibold mt-4">Suggested Tasks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {sortedTasks.map(task => (
            <Card key={task.title}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription>
                    {prioritizedTasks.find(pt => pt.id === task.title)?.reason || "No reason provided."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.title}`}
                        defaultChecked={task.completed}
                        onCheckedChange={() => onTaskCompletion(task.title)}
                      />
                      <Label htmlFor={`task-${task.title}`}>Completed</Label>
                    </div>
                    <p>Urgency: {task.urgency}</p>
                    <p>Importance: {task.importance}</p>
                    <p>Due Date: {task.dueDate}</p>
                    <p>Impact: {task.impact}</p>
                  </div>
              </CardContent>
            </Card>
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-4">Eisenhower Matrix</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(categorizedTasks).map(([category, tasks]) => (
          <div key={category}>
            <h4 className="text-md font-semibold">{category}</h4>
            {tasks.map(task => (
              <Card key={task.title}>
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>
                    {prioritizedTasks.find(pt => pt.id === task.title)?.reason || "No reason provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                 <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.title}`}
                        defaultChecked={task.completed}
                        onCheckedChange={() => onTaskCompletion(task.title)}
                      />
                      <Label htmlFor={`task-${task.title}`}>Completed</Label>
                    </div>
                    <p>Urgency: {task.urgency}</p>
                    <p>Importance: {task.importance}</p>
                    <p>Due Date: {task.dueDate}</p>
                    <p>Impact: {task.impact}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
