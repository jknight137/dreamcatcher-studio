"use client";

import { useState, useEffect } from 'react';
import { prioritizeTasks } from '@/ai/flows/task-prioritization';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    const prioritize = async () => {
      setIsLoading(true);
      try {
        const inputTasks = tasks.map(task => ({
          id: task.id,
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
      const inputTasks = tasks.map(task => ({
        id: task.id,
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
    setEditedTask({ ...task });
  };

  const handleSaveTask = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...editedTask } : task
    );
    onGoalDecomposition(updatedTasks);
    setEditingTaskId(null);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    onGoalDecomposition(updatedTasks);
  };

  const handleInputChange = (e, field) => {
    setEditedTask({ ...editedTask, [field]: e.target.value });
  };

  const handleSelectChange = (value, field) => {
    setEditedTask({ ...editedTask, [field]: value });
  };

  const categorizedTasks = categorizeTasks();

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
          <div key={task.id} className="task-item p-2 border rounded">
            <p className="text-sm">{task.title}</p>
            <p className="text-xs text-gray-500">
              {prioritizedTasks.find(pt => pt.id === task.id)?.reason || "No reason provided."}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Checkbox id={`complete-${task.id}`} onChange={() => onTaskCompletion(task.id)} checked={task.completed} />
              <Label htmlFor={`complete-${task.id}`} className="text-xs">Completed</Label>
            </div>
            <div className="flex space-x-1 mt-1">
              <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-4">Eisenhower Matrix</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(categorizedTasks).map(([category, tasks]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.map(task => (
                <div key={task.id} className="task-item p-2 border-b last:border-0">
                  <p className="text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {prioritizedTasks.find(pt => pt.id === task.id)?.reason || "No reason provided."}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox id={`complete-matrix-${task.id}`} onChange={() => onTaskCompletion(task.id)} checked={task.completed} className="h-4 w-4"/>
                    <Label htmlFor={`complete-matrix-${task.id}`} className="text-xs">Completed</Label>
                  </div>
                  <div className="flex space-x-1 mt-1">
                    <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Task Modal */}
      {editingTaskId && (
        <div className="edit-task-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="modal-content bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTask.title || ""}
                  onChange={(e) => handleInputChange(e, 'title')}
                />
              </div>
              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={editedTask.urgency || ""}
                  onValueChange={(value) => handleSelectChange(value, 'urgency')}
                >
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="importance">Importance</Label>
                <Select
                  value={editedTask.importance || ""}
                  onValueChange={(value) => handleSelectChange(value, 'importance')}
                >
                  <SelectTrigger id="importance">
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={editedTask.dueDate || ""}
                  onChange={(e) => handleInputChange(e, 'dueDate')}
                />
              </div>
              <div>
                <Label htmlFor="impact">Impact</Label>
                <Input
                  id="impact"
                  type="number"
                  value={editedTask.impact || ""}
                  onChange={(e) => handleInputChange(e, 'impact')}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setEditingTaskId(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveTask(editedTask.id)}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
