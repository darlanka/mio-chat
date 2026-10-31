import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent {
  readonly title = input.required<string>();
  readonly prompt = input.required<string>();
  readonly pick = output<string>();
}
