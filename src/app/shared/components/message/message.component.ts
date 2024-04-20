/* @format */
import { Component, OnInit } from '@angular/core';
import {
  MessageService,
  MessageDisplayOptions,
} from '@shared/services/message/message.service';
import { Router } from '@angular/router';
import { IFrameService } from '@shared/services/iframe/iframe.service';

interface Message {
  text: string;
  style: any;
  navigateTo?: string[];
  navigateParams?: any;
  externalUrl?: string;
  externalMessage?: string;
}

@Component({
  selector: 'pr-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  displayText: string;
  navigateTo: string[];
  navigateParams: any;
  visible: boolean;
  useFade = this.iFrame.isIFrame();
  style: any;
  queue: Message[] = [];
  externalUrl: string;
  externalMessage: string;

  private displayTime = 9000;

  constructor(
    private service: MessageService,
    private router: Router,
    private iFrame: IFrameService
  ) {
    this.service.registerComponent(this);
  }

  ngOnInit() {}

  display(data: MessageDisplayOptions) {
    if (this.visible) {
      this.queue.push({
        text: data.message,
        style: data.style,
        navigateTo: data.navigateTo,
        navigateParams: data.navigateParams,
        externalUrl: data.externalUrl,
        externalMessage: data.externalMessage,
      });
    } else {
      this.displayText = data.message;
      this.navigateTo = data.navigateTo;
      this.navigateParams = data.navigateParams;
      this.style = data.style ? `alert-${data.style}` : null;
      this.visible = true;
      this.externalUrl = data.externalUrl;
      this.externalMessage = data.externalMessage;
      setTimeout(this.dismiss.bind(this), this.displayTime);
    }
  }

  onClick() {
    if (this.navigateTo) {
      this.router.navigate(this.navigateTo, {
        queryParams: this.navigateParams,
      });
    }

    this.dismiss();
  }

  dismiss() {
    this.visible = false;
    if (this.queue.length) {
      const message = this.queue.shift();
      setTimeout(
        () =>
          this.display({
            message: message.text,
            style: message.style,
            navigateTo: message.navigateTo,
            navigateParams: message.navigateParams,
            externalUrl: message.externalUrl,
            externalMessage: message.externalMessage,
          }),
        500
      );
    }
    return false;
  }
}
