'use server';
/**
 * @fileOverview An HR policy question answering AI agent.
 *
 * - hrPolicyResponse - A function that answers HR policy questions.
 * - HrPolicyResponseInput - The input type for the hrPolicyResponse function.
 * - HrPolicyResponseOutput - The return type for the hrPolicyResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HrPolicyResponseInputSchema = z.object({
  hrPolicyContext: z
    .string()
    .describe('The HR policy context to use when answering questions.'),
  userQuery: z.string().describe('The HR policy question to answer.'),
});
export type HrPolicyResponseInput = z.infer<typeof HrPolicyResponseInputSchema>;

const HrPolicyResponseOutputSchema = z.object({
  responseText: z.string().describe('The HR policy response.'),
  confidence: z.enum(['high', 'medium', 'low', 'uncertain']).describe('The confidence level of the response.'),
});
export type HrPolicyResponseOutput = z.infer<typeof HrPolicyResponseOutputSchema>;

export async function hrPolicyResponse(input: HrPolicyResponseInput): Promise<HrPolicyResponseOutput> {
  return hrPolicyResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hrPolicyResponsePrompt',
  input: {schema: HrPolicyResponseInputSchema},
  output: {schema: HrPolicyResponseOutputSchema},
  prompt: `{{hrPolicyContext}}

User Query: {{userQuery}}

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

const hrPolicyResponseFlow = ai.defineFlow(
  {
    name: 'hrPolicyResponseFlow',
    inputSchema: HrPolicyResponseInputSchema,
    outputSchema: HrPolicyResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
