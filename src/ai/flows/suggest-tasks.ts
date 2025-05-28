'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting tasks based on a topic or prompt.
 *
 * - suggestTasks - A function that accepts a topic and returns a list of suggested tasks.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The return type for the suggestTasks function, representing an array of task strings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksInputSchema = z.object({
  topic: z.string().describe('The topic or prompt for which to generate task suggestions.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.array(z.string()).describe('An array of suggested tasks based on the input topic.');
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are a helpful AI assistant that suggests tasks related to a given topic.

  Topic: {{{topic}}}

  Please provide a list of tasks that a user might want to add to their todo list related to the topic. The tasks should be specific and actionable. Return a JSON array of strings.`,
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
