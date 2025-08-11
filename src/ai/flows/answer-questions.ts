'use server';

/**
 * @fileOverview An AI agent that answers questions about DeepLuxMed's services.
 *
 * - answerQuestions - A function that answers questions about DeepLuxMed's services.
 * - AnswerQuestionsInput - The input type for the answerQuestions function.
 * - AnswerQuestionsOutput - The return type for the answerQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsInputSchema = z.object({
  question: z.string().describe('The question to answer about DeepLuxMed services.'),
});
export type AnswerQuestionsInput = z.infer<typeof AnswerQuestionsInputSchema>;

const AnswerQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about DeepLuxMed services.'),
});
export type AnswerQuestionsOutput = z.infer<typeof AnswerQuestionsOutputSchema>;

export async function answerQuestions(input: AnswerQuestionsInput): Promise<AnswerQuestionsOutput> {
  return answerQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsPrompt',
  input: {schema: AnswerQuestionsInputSchema},
  output: {schema: AnswerQuestionsOutputSchema},
  prompt: `You are an AI assistant that answers questions about DeepLuxMed's services. DeepLuxMed offers the following services:

*   Escalas-DLM.com (repository of medical scales)
*   Expediente-DLM.com (electronic health record system)
*   CognitivApp-DLM.com (cognitive rehabilitation)
*   Physio-DLM.com (telerehabilitation with videos and online patient monitoring, medical update courses for doctors and physiotherapists)

Answer the following question about DeepLuxMed's services:

{{question}}`,
});

const answerQuestionsFlow = ai.defineFlow(
  {
    name: 'answerQuestionsFlow',
    inputSchema: AnswerQuestionsInputSchema,
    outputSchema: AnswerQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
