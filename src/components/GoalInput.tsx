"use client";

import { useState } from 'react';
import { goalDecomposition } from '@/ai/flows/goal-decomposition';
import { transcribeAudio } from '@/services/speech-recognition';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// Function to generate a unique ID
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const GoalInput = ({ onGoalDecomposition, isDreamCreation = false }) => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoalChange = (e) => {
    setGoal(e.target.value);
  };

  const handleDecomposeGoal = async () => {
    setIsLoading(true);
    try {
      if (isDreamCreation) {
        // Create a new dream object
        const newDream = {
          goal: goal,
          createdAt: new Date().toISOString(), // Capture creation timestamp
          tasks: [], // Initialize with an empty array of tasks
          id: generateUniqueId(),
        };
        onGoalDecomposition(newDream); // Pass the new dream object

      } else {
        const result = await goalDecomposition({ goal });
        // Add a unique ID to each task
        const tasksWithIds = result.tasks.map(task => ({ ...task, id: generateUniqueId() }));
        onGoalDecomposition(tasksWithIds);
      }
      setGoal('');
    } catch (error) {
      console.error("Error decomposing goal:", error);
      alert("Failed to decompose goal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    setIsLoading(true);
    try {
      const transcribedText = await transcribeAudio();
      if (transcribedText) {
        setGoal(transcribedText);
      } else {
        alert("Voice transcription failed. Please try again.");
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Failed to transcribe audio. Please check microphone permissions and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        <Textarea
          placeholder="Enter your dream here"
          value={goal}
          onChange={handleGoalChange}
          className="flex-grow"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleDecomposeGoal} disabled={isLoading}>
          {isLoading ? "Processing..." : (isDreamCreation ? "Create Dream" : "Decompose Dream")}
        </Button>
        <Button onClick={handleVoiceInput} disabled={isLoading}>
          {isLoading ? "Listening..." : "Voice Input"}
        </Button>
      </div>
    </div>
  );
};
