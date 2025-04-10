
"use client";

import { useState } from 'react';
import { goalDecomposition } from '@/ai/flows/goal-decomposition';
import { transcribeAudio } from '@/services/speech-recognition';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export const GoalInput = ({ onGoalDecomposition }) => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoalChange = (e) => {
    setGoal(e.target.value);
  };

  const handleDecomposeGoal = async () => {
    setIsLoading(true);
    try {
      const result = await goalDecomposition({ goal });
      onGoalDecomposition(result.tasks);
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
          placeholder="Enter your goal here"
          value={goal}
          onChange={handleGoalChange}
          className="flex-grow"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleDecomposeGoal} disabled={isLoading}>
          {isLoading ? "Decomposing..." : "Decompose Goal"}
        </Button>
        <Button onClick={handleVoiceInput} disabled={isLoading}>
          {isLoading ? "Listening..." : "Voice Input"}
        </Button>
      </div>
    </div>
  );
};
