/* @format */
import { Injectable } from '@angular/core';
import { MessageComponent } from '@shared/components/message/message.component';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

@Injectable()
export class MessageService {
  private component: MessageComponent;

  constructor(private constants: PrConstantsService) {}

  registerComponent(toRegister: MessageComponent) {
    if (this.component) {
      throw new Error('MessageService - Message component already registered');
    }

    this.component = toRegister;
  }

  public showMessage(
    message: string,
    style?: 'success' | 'info' | 'warning' | 'danger',
    translate?: boolean,
    navigateTo?: string[],
    navigateParams?: any,
    externalUrl?: string
  ) {
    if (!this.component) {
      throw new Error('MessageService - Missing component');
    }

    if (!translate) {
      this.component.display(
        message,
        style,
        navigateTo,
        navigateParams,
        externalUrl
      );
    } else {
      this.component.display(
        this.constants.translate(message),
        style,
        navigateTo,
        navigateParams,
        externalUrl
      );
    }
  }

  public showError(
    message: string,
    translate?: boolean,
    navigateTo?: string[],
    navigateParams?: any,
    externalUrl?: string
  ) {
    return this.showMessage(
      message,
      'danger',
      translate,
      navigateTo,
      navigateParams,
      externalUrl
    );
  }
}
