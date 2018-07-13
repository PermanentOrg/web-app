import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message/message.service';

interface Message {
  text: string;
  style: string;
}

@Component({
  selector: 'pr-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  displayText: string;
  visible: Boolean;
  style: string;
  queue: Message[] = [];

  private displayTime = 3000;

  constructor(private service: MessageService) {
    this.service.registerComponent(this);
  }

  ngOnInit() {
  }

  display(textToDisplay: string, style?: string, displayTime = this.displayTime) {

    if (this.visible) {
      this.queue.push({text: textToDisplay, style: style});
    } else {
      this.displayText = textToDisplay;
      this.style = style ? `alert-${style}` : null;
      this.visible = true;
      setTimeout(this.dismiss.bind(this), displayTime);
    }
  }

  dismiss() {
    this.visible = false;
    if (this.queue.length) {
      const message = this.queue.shift();
      setTimeout(() => this.display(message.text, message.style), 500);
    }
    return false;
  }

}
