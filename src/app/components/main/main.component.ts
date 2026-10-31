import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { SUGGESTIONS } from '../../constants/suggestions';
import { ChatService } from '../../services/chat.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-main',
  imports: [CardComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  protected readonly chatService = inject(ChatService);
  protected readonly suggestions = SUGGESTIONS;
  protected readonly draft = signal('');

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  constructor() {
    // Keep the newest message in view.
    effect(() => {
      this.chatService.active();
      this.chatService.loading();
      setTimeout(() => this.scrollToEnd());
    });
  }

  protected send(text: string): void {
    const prompt = text.trim();
    if (!prompt) return;
    this.draft.set('');
    void this.chatService.send(prompt);
  }

  protected onEnter(event: Event): void {
    if ((event as KeyboardEvent).shiftKey) return;
    event.preventDefault();
    this.send(this.draft());
  }

  private scrollToEnd(): void {
    const el = this.scroller()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
