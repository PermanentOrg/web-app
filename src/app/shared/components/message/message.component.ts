/* @format */
import { Component, OnInit } from '@angular/core';
import { MessageService } from '@shared/services/message/message.service';
import { Router } from '@angular/router';
import { IFrameService } from '@shared/services/iframe/iframe.service';

interface Message {
  text: string;
  style: string;
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
  style: string;
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

  display(
    textToDisplay: string,
    style?: string,
    navigateTo?: string[],
    navigateParams = {},
    externalUrl?: string,
    externalMessage?: string
  ) {
    if (this.visible) {
      this.queue.push({
        text: textToDisplay,
        style: style,
        navigateTo: navigateTo,
        navigateParams: navigateParams,
        externalUrl: externalUrl,
        externalMessage: externalMessage,
      });
    } else {
      this.displayText = textToDisplay;
      this.navigateTo = navigateTo;
      this.navigateParams = navigateParams;
      this.style = style ? `alert-${style}` : null;
      this.visible = true;
      this.externalUrl = externalUrl;
      this.externalMessage = externalMessage;
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
          this.display(
            message.text,
            message.style,
            message.navigateTo,
            message.navigateParams,
            message.externalUrl,
            message.externalMessage
          ),
        500
      );
    }
    return false;
  }
}
