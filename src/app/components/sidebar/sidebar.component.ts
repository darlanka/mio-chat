import { Component, inject, input, output } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly chatService = inject(ChatService);

  readonly collapsed = input(false);
  readonly toggle = output<void>();
}
