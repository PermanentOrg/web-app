import { Component, OnInit } from '@angular/core';
import { MessageService } from '@shared/services/message/message.service';
import { Router } from '@angular/router';

interface Message {
  text: string;
  style: string;
  navigateTo?: string[];
}

@Component({
  selector: 'pr-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  displayText: string;
  navigateTo: string[];
  visible: boolean;
  useFade = !!window.frameElement;
  style: string;
  queue: Message[] = [];

  private displayTime = 3000;

  constructor(private service: MessageService, private router: Router) {
    this.service.registerComponent(this);
  }

  ngOnInit() {
  }

  display(textToDisplay: string, style?: string, navigateTo?: string[]) {
    if (this.visible) {
      this.queue.push({text: textToDisplay, style: style, navigateTo: navigateTo});
    } else {
      this.displayText = textToDisplay;
      this.navigateTo = navigateTo;
      this.style = style ? `alert-${style}` : null;
      this.visible = true;
      setTimeout(this.dismiss.bind(this), this.displayTime);
    }
  }

  onClick() {
    if (this.navigateTo) {
      this.router.navigate(this.navigateTo);
    }

    this.dismiss();
  }

  dismiss() {
    this.visible = false;
    if (this.queue.length) {
      const message = this.queue.shift();
      setTimeout(() => this.display(message.text, message.style, message.navigateTo), 500);
    }
    return false;
  }

}
