import { ResumeData } from '@/components/TemplateRenderer';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  changes?: Partial<ResumeData>;
  suggestedPrompts?: string[];
  pendingApproval?: boolean;
}

export interface AIServiceParams {
  prompt: string;
  currentResumeData: ResumeData;
  selectedTemplate: any;
  chatHistory: ChatMessage[];
  userProfile: any;
  mode?: 'edit' | 'suggest' | 'analyze';
}

export interface AIServiceResponse {
  explanation: string;
  changes?: Partial<ResumeData>;
  suggestedPrompts: string[];
}

export class AIService {
  static async sendCommand(params: AIServiceParams): Promise<AIServiceResponse> {
    try {
      const response = await fetch('/api/ai/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          currentResumeData: params.currentResumeData,
          selectedTemplate: params.selectedTemplate,
          chatHistory: params.chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userProfile: params.userProfile,
          mode: params.mode || 'edit',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'AI command failed' }));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      return {
        explanation: data.explanation,
        changes: data.changes,
        suggestedPrompts: data.suggestedPrompts || [],
      };
    } catch (err: any) {
      console.error('[AIService Error]', err);
      throw err;
    }
  }
}
