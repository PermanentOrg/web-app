import { Injectable } from '@angular/core';
import { MessageComponent } from '../../components/message/message.component';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private component: MessageComponent;

  constructor() { }

  registerComponent(toRegister: MessageComponent) {
    if (this.component) {
      throw new Error('MessageService - Message component already registered');
    }

    this.component = toRegister;
  }

  public showMessage(message: string, style ?: string, translate ?: boolean) {
    if (!this.component) {
      throw new Error('MessageService - Missing component');
    }

    this.component.display(message, style);
  }
}
