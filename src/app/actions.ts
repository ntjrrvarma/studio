// src/app/actions.ts
'use server';

import { hrPolicyResponse, type HrPolicyResponseInput, type HrPolicyResponseOutput } from '@/ai/flows/hr-policy-response';
import { HR_POLICY_CONTEXT } from '@/config/app-config';

export async function getAIResponseAction(userQuery: string): Promise<HrPolicyResponseOutput> {
  try {
    const input: HrPolicyResponseInput = {
      hrPolicyContext: HR_POLICY_CONTEXT,
      userQuery: userQuery,
    };
    const aiResult = await hrPolicyResponse(input);
    if (!aiResult) {
        throw new Error("AI flow returned undefined.");
    }
    return aiResult;
  } catch (error) {
    console.error("Error getting AI response in server action:", error);
    // Ensure a valid HrPolicyResponseOutput structure is returned even on error
    return {
        responseText: "I apologize, but I encountered an issue processing your request. Please try again later.",
        confidence: 'uncertain' 
    };
  }
}
