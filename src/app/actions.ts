'use server';

import type { AnswerQuestionsOutput } from '@/ai/flows/answer-questions';

export async function askAI(question: string): Promise<AnswerQuestionsOutput> {
  if (!question) {
    return { answer: 'Por favor, haz una pregunta.' };
  }

  try {
    const { answerQuestions } = await import('@/ai/flows/answer-questions');
    const result = await answerQuestions({ question });
    return result;
  } catch (error) {
    console.error('Error calling AI flow:', error);
    return { answer: 'Lo siento, no pude procesar tu pregunta en este momento. Inténtalo de nuevo más tarde.' };
  }
}
