import { Injectable } from '@angular/core';
import { MessageComponent } from '@shared/components/message/message.component';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private component: MessageComponent;

  constructor(private constants: PrConstantsService) { }

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

    if (!translate) {
      this.component.display(message, style);
    } else {
      this.component.display(this.constants.translate(message), style);
    }

  }

  public showError(message: string, translate ?: boolean) {
    return this.showMessage(message, 'danger', translate);
  }
}
