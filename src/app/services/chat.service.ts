import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Chat, Message } from '../models/chat.model';
import { LlmService } from './llm.service';

const STORAGE_KEY = 'mio-chats';
const TITLE_MAX_LENGTH = 34;

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly llm = inject(LlmService);

  readonly chats = signal<Chat[]>(this.restore());
  readonly activeId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly active = computed(() => this.chats().find(c => c.id === this.activeId()) ?? null);

  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(this.chats())));
  }

  newChat(): void {
    this.activeId.set(null);
  }

  select(id: string): void {
    this.activeId.set(id);
  }

  remove(id: string): void {
    this.chats.update(chats => chats.filter(c => c.id !== id));
    if (this.activeId() === id) this.newChat();
  }

  async send(text: string): Promise<void> {
    if (this.loading()) return;

    const id = this.activeId() ?? this.createChat(text);
    this.append(id, { role: 'user', content: text });
    this.loading.set(true);

    try {
      this.append(id, await this.llm.ask(this.messagesOf(id)));
    } catch (error) {
      const content = error instanceof Error ? error.message : 'Something went wrong.';
      this.append(id, { role: 'assistant', content, error: true });
    } finally {
      this.loading.set(false);
    }
  }

  private createChat(firstMessage: string): string {
    const id = crypto.randomUUID();
    const title = firstMessage.length > TITLE_MAX_LENGTH
      ? `${firstMessage.slice(0, TITLE_MAX_LENGTH)}…`
      : firstMessage;
    this.chats.update(chats => [{ id, title, messages: [] }, ...chats]);
    this.activeId.set(id);
    return id;
  }

  private append(id: string, message: Message): void {
    this.chats.update(chats =>
      chats.map(c => (c.id === id ? { ...c, messages: [...c.messages, message] } : c)),
    );
  }

  private messagesOf(id: string): Message[] {
    return this.chats().find(c => c.id === id)?.messages ?? [];
  }

  private restore(): Chat[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
