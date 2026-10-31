import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEndpoint, apiUrl } from '../constants/api.constants';
import { LLM_CONFIG } from '../constants/llm.config';
import { SYSTEM_PROMPT } from '../constants/persona';
import { ChatRequest, ChatResponse, ModelInfo, ModelsResponse } from '../models/api.model';
import { Message } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class LlmService {
  private readonly http = inject(HttpClient);
  private freeModels?: Promise<string[]>;

  /** Sends the conversation to the first free model that answers. */
  async ask(history: Message[]): Promise<Message> {
    if (environment.apiKey.startsWith('PASTE_')) {
      throw new Error('Add your OpenRouter key in src/environments/environment.ts.');
    }

    const messages = this.buildMessages(history);
    const models = (await this.loadFreeModels()).slice(0, LLM_CONFIG.maxAttempts);
    let lastError = 'No free model responded.';

    for (const model of models) {
      try {
        const reply = await this.complete({ model, messages, temperature: LLM_CONFIG.temperature });
        if (reply) return reply;
        lastError = `${model} returned an empty reply.`;
      } catch (error) {
        lastError = this.errorMessage(error);
      }
    }
    throw new Error(lastError);
  }

  private buildMessages(history: Message[]): ChatRequest['messages'] {
    const chat = history.filter(m => !m.error).map(({ role, content }) => ({ role, content }));
    return [{ role: 'system', content: SYSTEM_PROMPT }, ...chat];
  }

  private async complete(request: ChatRequest): Promise<Message | null> {
    const response = await firstValueFrom(
      this.http.post<ChatResponse>(apiUrl(ApiEndpoint.ChatCompletions), request),
    );
    const content = this.stripReasoning(response.choices[0]?.message.content ?? '');
    return content ? { role: 'assistant', content, model: response.model ?? request.model } : null;
  }

  private loadFreeModels(): Promise<string[]> {
    return (this.freeModels ??= this.fetchFreeModels());
  }

  private async fetchFreeModels(): Promise<string[]> {
    const fallback = [LLM_CONFIG.routerModel];
    try {
      const { data } = await firstValueFrom(this.http.get<ModelsResponse>(apiUrl(ApiEndpoint.Models)));
      const free = data
        .filter(m => m.id.endsWith(LLM_CONFIG.freeSuffix) && this.outputsText(m))
        .sort((a, b) => this.rank(a.id) - this.rank(b.id) || (b.context_length ?? 0) - (a.context_length ?? 0))
        .map(m => m.id);
      return [...free, ...fallback];
    } catch {
      return fallback;
    }
  }

  private outputsText(model: ModelInfo): boolean {
    return (model.architecture?.output_modalities ?? ['text']).includes('text');
  }

  private rank(id: string): number {
    const index = LLM_CONFIG.preferredFamilies.findIndex(family => family.test(id));
    return index === -1 ? LLM_CONFIG.preferredFamilies.length : index;
  }

  private stripReasoning(text: string): string {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) return error.error?.error?.message ?? error.message;
    return error instanceof Error ? error.message : String(error);
  }
}
