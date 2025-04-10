'use server';
/**
 * @fileOverview An AI agent for intelligent task prioritization.
 *
 * - prioritizeTasks - A function that prioritizes tasks based on urgency, importance, and impact.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().describe('Unique identifier for the task.'),
      title: z.string().describe('The title of the task.'),
      urgency: z.string().describe('The urgency of the task (e.g., high, medium, low).'),
      importance: z.string().describe('The importance of the task (e.g., high, medium, low).'),
      dueDate: z.string().describe('The due date of the task (YYYY-MM-DD).'),
      impact: z.number().describe('A numerical value representing the impact of the task.'),
    })
  ).describe('A list of tasks to prioritize.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(
  z.object({
    id: z.string().describe('Unique identifier for the task.'),
    priorityScore: z.number().describe('A numerical score representing the priority of the task.'),
    reason: z.string().describe('Explanation of why this task was prioritized this way.')
  })
).describe('A list of tasks with their priority scores.');
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {
    schema: z.object({
      tasks: z.array(
        z.object({
          id: z.string().describe('Unique identifier for the task.'),
          title: z.string().describe('The title of the task.'),
          urgency: z.string().describe('The urgency of the task (e.g., high, medium, low).'),
          importance: z.string().describe('The importance of the task (e.g., high, medium, low).'),
          dueDate: z.string().describe('The due date of the task (YYYY-MM-DD).'),
          impact: z.number().describe('A numerical value representing the impact of the task.'),
        })
      ).describe('A list of tasks to prioritize.'),
    }),
  },
  output: {
    schema: z.array(
      z.object({
        id: z.string().describe('Unique identifier for the task.'),
        priorityScore: z.number().describe('A numerical score representing the priority of the task.'),
        reason: z.string().describe('Explanation of why this task was prioritized this way.')
      })
    ).describe('A list of tasks with their priority scores.'),
  },
  prompt: `You are an AI assistant that prioritizes tasks based on urgency, importance, impact and due date.

  Analyze the following tasks and assign a priority score to each, explaining your reasoning. The priority score should be a number between 0 and 100.

  Tasks:
  {{#each tasks}}
  - ID: {{this.id}}, Title: {{this.title}}, Urgency: {{this.urgency}}, Importance: {{this.importance}}, Due Date: {{this.dueDate}}, Impact: {{this.impact}}
  {{/each}}

  Return a JSON array of tasks with their priority scores and reasoning.
  `,
});

const prioritizeTasksFlow = ai.defineFlow<
  typeof PrioritizeTasksInputSchema,
  typeof PrioritizeTasksOutputSchema
>(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
