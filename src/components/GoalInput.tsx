"use client";

import { useState, useRef, useEffect } from 'react';
import { goalDecomposition } from '@/ai/flows/goal-decomposition';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast";

// Function to generate a unique ID
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const GoalInput = ({ onGoalDecomposition, isDreamCreation = false }) => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const SpeechRecognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support speech recognition.",
      });
      return;
    }

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.lang = 'en-US';

    recognition.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      setGoal(transcript);
      setIsLoading(false);
    };

    recognition.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsLoading(false);
      toast({
        title: "Voice input error",
        description: `There was an error with voice recognition: ${event.error}`,
        variant: "destructive",
      });
    };

    recognition.current.onend = () => {
      setIsLoading(false);
    };

  }, []);

  const handleGoalChange = (e) => {
    setGoal(e.target.value);
  };

  const handleDecomposeGoal = async () => {
    setIsLoading(true);
    try {
      if (isDreamCreation) {

        const result = await goalDecomposition({ goal });
        // Add a unique ID to each task
        const tasksWithIds = result.tasks.map(task => ({ ...task, id: generateUniqueId() }));

        // Create a new dream object
        const newDream = {
          goal: goal,
          createdAt: new Date().toISOString(), // Capture creation timestamp
        };
        onGoalDecomposition(newDream, tasksWithIds); // Pass the new dream object and tasks

      } else {
        const result = await goalDecomposition({ goal });
        // Add a unique ID to each task
        const tasksWithIds = result.tasks.map(task => ({ ...task, id: generateUniqueId() }));
        onGoalDecomposition(tasksWithIds);
      }
      setGoal('');
    } catch (error) {
      console.error("Error decomposing goal:", error);
      toast({
        title: "Failed to decompose goal",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
     if (!recognition.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      recognition.current.start();
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setIsLoading(false);
       toast({
        title: "Voice input failed",
        description: "Please check microphone permissions and try again.",
        variant: "destructive",
      });
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
        <Button
          onClick={handleVoiceInput}
          disabled={isLoading || (typeof window !== 'undefined' && !window.SpeechRecognition && !window.webkitSpeechRecognition)}>
          {isLoading ? "Listening..." : "Voice Input"}
        </Button>
      </div>
    </div>
  );
};
