// src/ai/flows/handle-uncertainty.ts
'use server';

/**
 * @fileOverview Implements a Genkit flow to handle AI uncertainty by providing a clear
 * disclaimer and directing users to HR when the AI is unsure of an answer.
 *
 * - handleAIUncertainty - A function that processes user queries and returns an AI response with uncertainty handling.
 * - HandleAIUncertaintyInput - The input type for the handleAIUncertainty function.
 * - HandleAIUncertaintyOutput - The return type for the handleAIUncertainty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HandleAIUncertaintyInputSchema = z.object({
  query: z.string().describe('The user query regarding HR policies.'),
  hrPolicyContext: z.string().describe('The context of HR policies to be used for answering questions.'),
});
export type HandleAIUncertaintyInput = z.infer<typeof HandleAIUncertaintyInputSchema>;

const HandleAIUncertaintyOutputSchema = z.object({
  response: z.string().describe('The AI response to the user query.'),
  confidence: z.enum(['high', 'medium', 'low', 'uncertain']).describe('The confidence level of the AI in its response.'),
});
export type HandleAIUncertaintyOutput = z.infer<typeof HandleAIUncertaintyOutputSchema>;

export async function handleAIUncertainty(input: HandleAIUncertaintyInput): Promise<HandleAIUncertaintyOutput> {
  return handleAIUncertaintyFlow(input);
}

const handleAIUncertaintyPrompt = ai.definePrompt({
  name: 'handleAIUncertaintyPrompt',
  input: {schema: HandleAIUncertaintyInputSchema},
  output: {schema: HandleAIUncertaintyOutputSchema},
  prompt: `{{hrPolicyContext}}

User Query: {{query}}

AI Response:`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const handleAIUncertaintyFlow = ai.defineFlow(
  {
    name: 'handleAIUncertaintyFlow',
    inputSchema: HandleAIUncertaintyInputSchema,
    outputSchema: HandleAIUncertaintyOutputSchema,
  },
  async input => {
    const {output} = await handleAIUncertaintyPrompt(input);

    // Simple confidence check (can be improved)
    let confidence: HandleAIUncertaintyOutput['confidence'] = 'medium'; // Default confidence
    if (
      output?.response.toLowerCase().includes("i'm not sure") ||
      output?.response.toLowerCase().includes('i cannot find') ||
      output?.response.toLowerCase().includes('contact hr')
    ) {
      confidence = 'uncertain';
    } else if (output?.response.toLowerCase().includes('sorry') || output?.response.toLowerCase().includes('issue')) {
      confidence = 'low';
    }

    return { ...output!, confidence };
  }
);
