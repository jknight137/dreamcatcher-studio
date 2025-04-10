"use client";

import { useState, useEffect } from 'react';
import { prioritizeTasks } from '@/ai/flows/task-prioritization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit } from "lucide-react";

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

export const TaskDisplay = ({ tasks, onTaskCompletion, onGoalDecomposition }) => {
  const [prioritizedTasks, setPrioritizedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});


  useEffect(() => {
    const prioritize = async () => {
      setIsLoading(true);
      try {
        // Map the tasks to the PrioritizeTasksInput format
        const inputTasks = tasks.map(task => ({
          id: task.id, // Use task title as ID for now
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
          id: task.id, // Use task title as ID for now
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

  const handleEditTask = (task) => {
      setEditingTaskId(task.id);
      setEditedTask(task);
  };

  const handleSaveTask = (taskId) => {
        // Implement save functionality here, e.g., updating state or sending to an API
        onGoalDecomposition(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...editedTask } : task
          )
        );
        setEditingTaskId(null);
  };

  const handleDeleteTask = (taskId) => {
        onGoalDecomposition(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleInputChange = (e, field) => {
      setEditedTask({ ...editedTask, [field]: e.target.value });
  };

  const categorizedTasks = categorizeTasks();

  // Sort tasks based on priority score
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = prioritizedTasks.find(pt => pt.id === a.id)?.priorityScore || 0;
    const priorityB = prioritizedTasks.find(pt => pt.id === b.id)?.priorityScore || 0;
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
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription>
                    {prioritizedTasks.find(pt => pt.id === task.id)?.reason || "No reason provided."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        defaultChecked={task.completed}
                        onCheckedChange={() => onTaskCompletion(task.id)}
                      />
                      <Label htmlFor={`task-${task.id}`}>Completed</Label>
                    </div>
                    <p>Urgency: {task.urgency}</p>
                    <p>Importance: {task.importance}</p>
                    <p>Due Date: {task.dueDate}</p>
                    <p>Impact: {task.impact}</p>
                  </div>
                    <Button variant="secondary" size="sm" onClick={() => handleEditTask(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
              </CardContent>
            </Card>
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-4">Eisenhower Matrix</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(categorizedTasks).map(([category, tasks]) => (
          <div key={category}>
            <h4 className="text-md font-semibold">{category}</h4>
            {tasks.map(task => (
              <Card key={task.id}>
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>
                    {prioritizedTasks.find(pt => pt.id === task.id)?.reason || "No reason provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                 <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        defaultChecked={task.completed}
                        onCheckedChange={() => onTaskCompletion(task.id)}
                      />
                      <Label htmlFor={`task-${task.id}`}>Completed</Label>
                    </div>
                    <p>Urgency: {task.urgency}</p>
                    <p>Importance: {task.importance}</p>
                    <p>Due Date: {task.dueDate}</p>
                    <p>Impact: {task.impact}</p>
                  </div>
                    <Button variant="secondary" size="sm" onClick={() => handleEditTask(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
          {/* Edit Task Modal */}
          {editingTaskId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <Card className="max-w-md w-full p-4">
                  <CardHeader>
                    <CardTitle>Edit Task</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editedTask.title || ""}
                          onChange={(e) => handleInputChange(e, 'title')}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="urgency">Urgency</Label>
                        <Select value={editedTask.urgency} onValueChange={(e) => setEditedTask({...editedTask, urgency: e})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="importance">Importance</Label>
                         <Select value={editedTask.importance} onValueChange={(e) => setEditedTask({...editedTask, importance: e})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Importance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          type="date"
                          id="dueDate"
                          value={editedTask.dueDate || ""}
                          onChange={(e) => handleInputChange(e, 'dueDate')}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="impact">Impact</Label>
                        <Input
                          type="number"
                          id="impact"
                          value={editedTask.impact || ""}
                          onChange={(e) => handleInputChange(e, 'impact')}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="ghost" onClick={() => setEditingTaskId(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveTask(editingTaskId)}>Save</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
    </div>
  );
};
