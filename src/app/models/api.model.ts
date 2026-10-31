import { Message } from './chat.model';

export interface ModelInfo {
  id: string;
  context_length?: number;
  architecture?: { output_modalities?: string[] };
}

export interface ModelsResponse {
  data: ModelInfo[];
}

export interface ChatRequest {
  model: string;
  messages: Pick<Message, 'role' | 'content'>[];
  temperature: number;
}

export interface ChatResponse {
  model: string;
  choices: { message: { content: string | null } }[];
}
