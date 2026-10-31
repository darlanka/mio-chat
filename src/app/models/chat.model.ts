export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
  model?: string;
  error?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

export interface Suggestion {
  title: string;
  prompt: string;
}
