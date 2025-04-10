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
    const [localTasks, setLocalTasks] = useState(tasks);


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

  const categorizedTasks = categorizeTasks();

  // Sort tasks based on priority score
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = prioritizedTasks.find(pt => pt.id === a.id)?.priorityScore || 0;
    const priorityB = prioritizedTasks.find(pt => pt.id === b.id)?.priorityScore || 0;
    return priorityB - priorityA;
  });

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Task Overview</h2>

        <Button onClick={handleRePrioritize} disabled={isLoading}>
          {isLoading ? "Re-prioritizing..." : "Re-prioritize Tasks"}
        </Button>

      <h3 className="text-lg font-semibold mt-4">Suggested Tasks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {sortedTasks.map(task => (
            
              
                {task.title}
                
                    {prioritizedTasks.find(pt => pt.id === task.id)?.reason || "No reason provided."}
                
              
              
                 
                    
                      
                        Completed
                      
                    
                    Urgency: {task.urgency}
                    Importance: {task.importance}
                    Due Date: {task.dueDate}
                    Impact: {task.impact}
                  
                    
                      Edit
                    
                    
                      Delete
                    
              
            
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-4">Eisenhower Matrix</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(categorizedTasks).map(([category, tasks]) => (
          
            
              {category}
            
            {tasks.map(task => (
              
                
                  
                    {task.title}
                    
                      {prioritizedTasks.find(pt => pt.id === task.id)?.reason || "No reason provided."}
                    
                  
                  
                     
                        
                          Completed
                        
                      
                      Urgency: {task.urgency}
                      Importance: {task.importance}
                      Due Date: {task.dueDate}
                      Impact: {task.impact}
                    
                      
                        Edit
                      
                      
                        Delete
                      
                  
                
              
            ))}
          
        ))}
      </div>
          {/* Edit Task Modal */}
          {editingTaskId && (
              
                
                  
                    
                  
                  
                    
                      
                        Title
                        
                          
                        
                      
                      
                        Urgency
                        
                          
                            
                          
                          
                            High
                            Medium
                            Low
                          
                        
                      
                      
                        Importance
                        
                         
                            
                          
                          
                            High
                            Medium
                            Low
                          
                        
                      
                      
                        Due Date
                        
                          
                        
                      
                      
                        Impact
                        
                          
                        
                      
                    
                    
                      
                        Cancel
                      
                      Save
                    
                  
                
              
            )}
    </>
  );
};

