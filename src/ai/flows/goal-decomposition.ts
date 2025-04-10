'use server';
/**
 * @fileOverview Decomposes user goals into actionable tasks using AI.
 *
 * - goalDecomposition - A function that handles the goal decomposition process.
 * - GoalDecompositionInput - The input type for the goalDecomposition function.
 * - GoalDecompositionOutput - The return type for the goalDecomposition function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GoalDecompositionInputSchema = z.object({
  goal: z.string().describe('The user-defined goal to decompose.'),
});
export type GoalDecompositionInput = z.infer<typeof GoalDecompositionInputSchema>;

const GoalDecompositionOutputSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().describe('The title of the task.'),
      urgency: z.string().describe('The urgency of the task (e.g., High, Medium, Low).'),
      importance: z.string().describe('The importance of the task (e.g., High, Medium, Low).'),
      dueDate: z.string().describe('The due date of the task (YYYY-MM-DD).'),
      impact: z.number().describe('The impact score of the task (1-10).'),
    })
  ).describe('The list of actionable tasks decomposed from the goal.'),
});
export type GoalDecompositionOutput = z.infer<typeof GoalDecompositionOutputSchema>;

export async function goalDecomposition(input: GoalDecompositionInput): Promise<GoalDecompositionOutput> {
  return goalDecompositionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'goalDecompositionPrompt',
  input: {
    schema: z.object({
      goal: z.string().describe('The user-defined goal to decompose.'),
    }),
  },
  output: {
    schema: z.object({
      tasks: z.array(
        z.object({
          title: z.string().describe('The title of the task.'),
          urgency: z.string().describe('The urgency of the task (e.g., High, Medium, Low).'),
          importance: z.string().describe('The importance of the task (e.g., High, Medium, Low).'),
          dueDate: z.string().describe('The due date of the task (YYYY-MM-DD).'),
          impact: z.number().describe('The impact score of the task (1-10).'),
        })
      ).describe('The list of actionable tasks decomposed from the goal.'),
    }),
  },
  prompt: `You are an AI assistant designed to decompose complex goals into actionable tasks. You will structure and prioritize tasks based on the SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound), Eisenhower Matrix (urgency vs. importance), and Pareto Principle (80/20 rule).  Make sure to output the tasks in a JSON format.

Goal: {{{goal}}}
`,
});

const goalDecompositionFlow = ai.defineFlow<
  typeof GoalDecompositionInputSchema,
  typeof GoalDecompositionOutputSchema
>({
  name: 'goalDecompositionFlow',
  inputSchema: GoalDecompositionInputSchema,
  outputSchema: GoalDecompositionOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
